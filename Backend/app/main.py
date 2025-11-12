import uvicorn
import os
from dotenv import load_dotenv
load_dotenv()
import io
import numpy as np
import tensorflow as tf
from PIL import Image
from typing import Dict, Any, List, Optional
import time 
import bcrypt
import threading 
from fastapi import FastAPI, UploadFile, File, HTTPException, status, Depends, Form 
from fastapi.middleware.cors import CORSMiddleware # FIXED: Corrected capitalization here
from pydantic import BaseModel, Field
import psycopg2
from psycopg2 import pool, sql
from psycopg2.extras import DictCursor 
from tensorflow.python.keras.models import load_model

# --- Configuration ---
DATABASE_URL = os.getenv("DATABASE_URL")
FALLBACK_DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"), 
    "database": os.getenv("DB_NAME", "AgroscanAI"),
    "user": os.getenv("DB_USER", "postgres"), 
    "password": os.getenv("DB_PASSWORD", "root"), 
    "port": os.getenv("DB_PORT", "5432")
}

MODEL_PATH = "./best_tea_disease_model_v3.h5" 
IMG_HEIGHT = 160
IMG_WIDTH = 160
CONFIDENCE_THRESHOLD = 0.70 
NON_TEA_LEAF_CLASS_NAME = "Other_Non_Tea_Leaf" 

CLASS_NAMES = [
    'Anthracnose', 
    NON_TEA_LEAF_CLASS_NAME, 
    'Algal Leaf', 
    'Bird Eye Spot', 
    'Brown Blight', 
    'Gray Light', 
    'Healthy', 
    'Red Leaf Spot', 
    'White Spot' 
]

# --- RECOMMENDATIONS MAP ---
RECOMMENDATIONS = {
    'Algal Leaf': "Algal leaf spot. Improve air circulation, reduce humidity, and consider copper-based fungicides if severe. Action: **Prune and Apply Fungicide**",
    'Anthracnose': "Anthracnose disease. Prune infected parts, remove fallen leaves, and apply recommended fungicides. Action: **Prune and Treat with Fungicide**",
    'Bird Eye Spot': "Bird's eye spot. Improve drainage, ensure proper spacing, and consider cultural practices to reduce moisture. Action: **Improve Drainage and Spacing**",
    'Brown Blight': "Brown blight. Improve sanitation, remove infected leaves, and use appropriate fungicides as per local recommendations. Action: **Sanitation and Fungicide**",
    'Gray Light': "Gray blight. Improve air circulation, avoid overhead irrigation, and use fungicides if necessary. Action: **Improve Air Flow and Treat**",
    'Healthy': "Your tea plant appears healthy! Continue good agricultural practices, including proper fertilization and pest monitoring. Action: **Maintain Practices**",
    'Red Leaf Spot': "Red leaf spot. Ensure balanced fertilization, especially potassium, and manage soil moisture. Action: **Balance Nutrients and Moisture**",
    'White Spot': "White spot. Improve plant vigor, reduce stress, and consider organic or chemical treatments. Action: **Increase Vigor and Treatment**",
    NON_TEA_LEAF_CLASS_NAME: "The uploaded image is not a tea leaf. Please ensure you are submitting a clear photo of a tea leaf for diagnosis. Action: **Retake Photo**"
}

app = FastAPI(
    title="Agroscan AI Unified Backend",
    description="API for detecting tea plant diseases and managing users with PostgreSQL. Prediction now includes auto-save to history.",
    version="0.5.0", 
)

model = None
db_pool = None
model_lock = threading.Lock() 

origins = ["*"] 
app.add_middleware(
    CORSMiddleware, # Corrected: CORSMiddleware is used here
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class UserRegistration(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class SavedScan(BaseModel):
    # Updated to use email for better integration with existing auth flow
    user_email: str 
    diagnosis_result: str
    confidence_score : float
    treatment_recommendation: str 
    scan_date: Optional[str] = None 

class PredictionResponse(BaseModel):
    status: str = Field(..., description="SUCCESS, REJECTED (Non-Tea), or LOW_CONFIDENCE")
    prediction: str = Field(..., description="The predicted class name.")
    confidence: float
    message: str = Field(..., description="A summary of the result.")
    recommendation: str = Field(..., description="Specific advice or instruction for the user.")

# NEW RESPONSE MODEL for /predict that includes the save status
class PredictionAndSaveResponse(PredictionResponse):
    """Extends PredictionResponse to include scan saving status and ID."""
    save_status: str = Field(..., description="Success/Failure status of the DB save operation.")
    scan_id: Optional[int] = Field(None, description="The ID of the saved scan record, if successful.")


# --- Database Connection and Utility Functions (Unchanged) ---

def initialize_pool():
    """Initializes the PostgreSQL connection pool."""
    global db_pool
    if db_pool is None:
        try:
            if DATABASE_URL:
                print("Using DATABASE_URL for connection.")
                # Add extra DSN parameters for SSL needed for cloud deployment/testing
                dsn_params = f"{DATABASE_URL} sslmode=require"
                db_pool = psycopg2.pool.SimpleConnectionPool(
                    minconn=1, 
                    maxconn=10, 
                    dsn=DATABASE_URL,
                    sslmode='require' 
                    
                )
            else:
                print("Using individual DB_CONFIG variables for connection (Local/Fallback).")
                db_pool = psycopg2.pool.SimpleConnectionPool(
                    minconn=1, 
                    maxconn=10, 
                    **FALLBACK_DB_CONFIG
                )
            print("PostgreSQL connection pool initialized successfully.")
        except Exception as e:
            print(f"Failed to initialize connection pool: {e}")
            raise

def get_db_connection():
    """Dependency: Provides a connection object and handles cleanup."""
    if db_pool is None:
        raise HTTPException(status_code=500, detail="Database pool not initialized.")
        
    start_time = time.time()
    conn = db_pool.getconn()
    elapsed = time.time() - start_time
    print(f"DATABASE CONNECTION ACQUIRED IN: {elapsed:.4f} seconds") 

    try:
        yield conn
    finally:
        db_pool.putconn(conn)

def get_user_id_by_email(email: str, conn: psycopg2.connect) -> Optional[int]:
    """Helper function to fetch user_id from email."""
    try:
        with conn.cursor() as cur:
            cur.execute(sql.SQL("SELECT user_id FROM users WHERE email = %s"), (email,))
            result = cur.fetchone()
            return result[0] if result else None
    except Exception as e:
        print(f"Error fetching user ID for {email}: {e}")
        return None
        
def hash_password(password: str) -> str:
    """Hashes the plain text password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a stored hashed password."""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception as e:
        print(f"Error during password verification: {e}")
        return False

# --- New Reusable Scan Saving Logic ---

def save_scan_to_db(user_email: str, diagnosis: str, confidence: float, recommendation: str, conn: psycopg2.connect) -> int:
    """
    Saves a prediction scan to the user's persistent history in PostgreSQL.
    Raises HTTPException on failure.
    """
    
    user_id = get_user_id_by_email(user_email, conn)
    
    if user_id is None:
        # Raise 404 for specific client handling
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.SQL("""
                    INSERT INTO scans (user_id, diagnosis_result, confidence_score, treatment_recommendation)
                    VALUES (%s, %s, %s, %s)
                    RETURNING scan_id;
                """),
                (
                    user_id, 
                    diagnosis, 
                    confidence, 
                    recommendation
                )
            )
            scan_id = cur.fetchone()[0]
            conn.commit()
            return scan_id
            
    except Exception as e:
        conn.rollback()
        print(f"Database insertion error for scan: {e}")
        # Raise 500 for generic DB failure
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save scan history due to a database error.")

# --- Startup/Shutdown Events (Unchanged) ---

@app.on_event("startup")
def startup_db_event():
    """Initialize the database connection pool."""
    initialize_pool()

@app.on_event("shutdown")
def shutdown_db_event():
    """Close the connection pool when the application shuts down."""
    global db_pool
    if db_pool:
        db_pool.closeall()
        print("PostgreSQL connection pool closed.")

# --- ML Prediction Core Function (Unchanged) ---

async def predict_disease_actual_model(image_bytes: bytes) -> PredictionResponse:
    """Performs image preprocessing and model inference."""
    global model
    
    if model is None:
        with model_lock:
            if model is None:
                print(f"ATTEMPTING LAZY LOAD OF ML MODEL from {MODEL_PATH}")
                try:
                    model = load_model(MODEL_PATH)
                    print(f"ML model loaded successfully (Lazy Load).")
                except Exception as e:
                    print(f"ERROR: Could not lazy load the ML model. Reason: {e}")
                    raise HTTPException(status_code=503, detail="ML model failed to load during first request.")

    try:
        # Load and preprocess the image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize((IMG_HEIGHT, IMG_WIDTH)) 
        image_array = np.asarray(image) 
        image_array = image_array / 255.0 
        image_batch = np.expand_dims(image_array, axis=0) 

        # Make prediction
        predictions = model.predict(image_batch, verbose=0)
        predicted_probabilities = predictions[0] 
        predicted_class_index = np.argmax(predicted_probabilities)
        confidence = float(predicted_probabilities[predicted_class_index])
        predicted_disease = CLASS_NAMES[predicted_class_index]

    except Image.UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid image file. Could not identify image format.")
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process image or make prediction: {str(e)}")

    # A. Check for Non-Tea Image
    if predicted_disease == NON_TEA_LEAF_CLASS_NAME:
        rejection_message = RECOMMENDATIONS[NON_TEA_LEAF_CLASS_NAME]
        return PredictionResponse(
            status="REJECTED",
            prediction=predicted_disease,
            confidence=round(confidence, 4),
            message="Image Rejected: The uploaded photo is not a tea leaf (Non-Tea Leaf detected).",
            recommendation=rejection_message
        )

    # B. Check for Low Confidence Warning
    if confidence < CONFIDENCE_THRESHOLD:
        generic_recommendation = "Diagnosis uncertainty is high. Retake the photo or consult a local expert for verification."
        return PredictionResponse(
            status="LOW_CONFIDENCE",
            prediction=predicted_disease,
            confidence=round(confidence, 4),
            message=f"The top prediction is **{predicted_disease}**, but the confidence score ({round(confidence * 100, 2)}%) is below the {CONFIDENCE_THRESHOLD * 100}% threshold. Retrying with a clearer image is advised.",
            recommendation=generic_recommendation
        )

    # C. Successful Prediction (High Confidence)
    recommendation = RECOMMENDATIONS.get(predicted_disease, "Consult a local agricultural expert for precise guidance.")
    
    return PredictionResponse(
        status="SUCCESS",
        prediction=predicted_disease,
        confidence=round(confidence, 4),
        message=f"High confidence diagnosis: **{predicted_disease}**",
        recommendation=recommendation
    )

# --- ENDPOINTS ---

@app.get("/")
async def read_root():
    """Root endpoint for the Agroscan AI API."""
    return {"message": "Welcome to Agroscan AI Unified Backend! Go to /docs for API documentation."}

# --- ML Prediction Endpoint (MODIFIED) ---
@app.post("/predict", response_model=PredictionAndSaveResponse, tags=["ML Prediction"])
async def predict_disease_and_save_endpoint(
    file: UploadFile = File(..., description="The image file of the tea leaf."), 
    user_email: str = Form(..., description="The email of the user to associate the scan with."),
    conn: psycopg2.connect = Depends(get_db_connection)
):
    """
    Receives an image, performs prediction, and automatically saves the result 
    to the user's scan history if the prediction is accepted (SUCCESS/LOW_CONFIDENCE).
    
    Requires 'user_email' to be sent as a form-data field along with the 'file'.
    """
    # 1. Read Image and Get Prediction Result
    image_bytes = await file.read()
    prediction_result = await predict_disease_actual_model(image_bytes)

    # 2. Handle Saving (Only save if status is SUCCESS or LOW_CONFIDENCE)
    scan_id = None
    save_status = "NOT_SAVED_REJECTED"
    
    if prediction_result.status in ["SUCCESS", "LOW_CONFIDENCE"]:
        try:
            scan_id = save_scan_to_db(
                user_email=user_email,
                diagnosis=prediction_result.prediction,
                confidence=prediction_result.confidence,
                recommendation=prediction_result.recommendation,
                conn=conn
            )
            save_status = "SAVED_SUCCESS"
        except HTTPException as e:
            # Catch known save errors (e.g., User not found, DB failure)
            save_status = f"SAVED_FAILED_{e.detail.replace(' ', '_').upper()}"
            print(f"Failed to save scan for user {user_email}: {e.detail}")
        except Exception as e:
            # Catch unexpected errors
            save_status = "SAVED_FAILED_UNKNOWN_ERROR"
            print(f"Unexpected error during save: {e}")

    # 3. Construct Final Response with Save Status
    return PredictionAndSaveResponse(
        status=prediction_result.status,
        prediction=prediction_result.prediction,
        confidence=prediction_result.confidence,
        message=prediction_result.message,
        recommendation=prediction_result.recommendation,
        save_status=save_status,
        scan_id=scan_id
    )

# --- DB Authentication Endpoints (Unchanged) ---

@app.post("/register", tags=["Auth"])
def register_user(user_data: UserRegistration, conn: psycopg2.connect = Depends(get_db_connection)):
    """Handles user registration using PostgreSQL with password hashing."""
    email = user_data.email
    hashed_password = hash_password(user_data.password)
    
    try:
        with conn.cursor() as cur:
            cur.execute(sql.SQL("SELECT user_id FROM users WHERE email = %s"), (email,))
            if cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered."
                )
            
            cur.execute(
                sql.SQL("INSERT INTO users (email, hashed_password) VALUES (%s, %s) RETURNING user_id;"),
                (email, hashed_password)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            
            return {"message": "User registered successfully.", "user_id": user_id, "email": email}
            
    except HTTPException as e:
        raise e
    except Exception as e:
        conn.rollback()
        print(f"Database insertion error: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed due to server error.")

@app.post("/login", tags=["Auth"])
def login_user(user_data: UserLogin, conn: psycopg2.connect = Depends(get_db_connection)):
    """Authenticates the user by checking email and password against PostgreSQL."""
    email = user_data.email
    password = user_data.password

    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.SQL("SELECT user_id, hashed_password FROM users WHERE email = %s;"),
                (email,)
            )
            result = cur.fetchone()
            
            if not result:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials."
                )
            
            user_id, stored_hashed_password = result 
            if not verify_password(password, stored_hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials."
                )
            
            mock_token = f"fake_auth_token_for_{email}" 
            return {"message": "Login successful.", "user_id": user_id, "email": email, "token": mock_token}

    except HTTPException as e:
        raise e
    except Exception as e:
        conn.rollback()
        print(f"Login error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Login failed due to server error.")

# ---Logout

@app.post("/logout", tags=["Auth"])
async def logout_user():
    """
    Handles user logout. Since this application uses client-side managed tokens, 
    this endpoint primarily signals success to the frontend, which then clears 
    its local token/session. 
    
    If server-side token blacklisting were needed (for JWTs), that logic would go here.
    """
    # For a token-based system without server-side tracking, 
    # the server only needs to acknowledge the request.
    return {"message": "Logout successful. Client must destroy local session/token."}

# --- DB Data Endpoint (Unchanged) ---
@app.get("/diseases", tags=["DB Data"], response_model=List[Dict[str, Any]])
def get_disease_list(conn: psycopg2.connect = Depends(get_db_connection)):
    """Fetches a list of known diseases from the database."""
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT disease_name, description FROM diseases;")
            columns = [desc[0] for desc in cur.description]
            diseases = [dict(zip(columns, row)) for row in cur.fetchall()]
            return diseases
    except Exception as e:
        conn.rollback()
        print(f"Database error fetching diseases: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: Could not fetch disease list.")

# --- HISTORY MANAGEMENT ENDPOINTS (MODIFIED /save_scan to use reusable logic) ---

@app.post("/save_scan", tags=["History (PostgreSQL)"])
async def save_scan_endpoint(scan_data: SavedScan, conn: psycopg2.connect = Depends(get_db_connection)):
    """
    Saves a prediction scan to the user's persistent history in PostgreSQL 
    (manual save endpoint, now using reusable function).
    """
    
    # Use the reusable function to perform the save operation
    scan_id = save_scan_to_db(
        user_email=scan_data.user_email,
        diagnosis=scan_data.diagnosis_result,
        confidence=scan_data.confidence_score,
        recommendation=scan_data.treatment_recommendation,
        conn=conn
    )
    
    return {"message": "Scan saved successfully to PostgreSQL.", "scan_id": scan_id}

@app.get("/get_scans/{user_email}", tags=["History (PostgreSQL)"])
async def get_scans_endpoint(user_email: str, conn: psycopg2.connect = Depends(get_db_connection)):
    """Retrieves all saved scans for a specific user from PostgreSQL."""
    
    user_id = get_user_id_by_email(user_email, conn)
    
    if user_id is None:
        return {"scans": [], "count": 0, "message": "User not found or no scans available."}
        
    try:
        with conn.cursor(cursor_factory=DictCursor) as cur: 
            cur.execute(
                sql.SQL("""
                    SELECT 
                        diagnosis_result as prediction, 
                        confidence_score as confidence, 
                        treatment_recommendation,
                        scan_date as date
                    FROM scans 
                    WHERE user_id = %s
                    ORDER BY scan_date DESC;
                """),
                (user_id,)
            )
            scans = [dict(row) for row in cur.fetchall()] 
            
            return {"scans": scans, "count": len(scans), "message": "Scans retrieved successfully from PostgreSQL."}
            
    except Exception as e:
        conn.rollback()
        print(f"Database query error for scans: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve scan history.")

# Main block for running the application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)