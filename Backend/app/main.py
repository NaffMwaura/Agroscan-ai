import uvicorn
import os
import io
import numpy as np
import tensorflow as tf
from PIL import Image
from typing import Dict, Any, List, Optional
import time 

# FastAPI and Pydantic
from fastapi import FastAPI, UploadFile, File, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Database Imports (PostgreSQL)
import psycopg2
from psycopg2 import pool, sql
from psycopg2.extras import DictCursor 

# Machine Learning Imports
from tensorflow.keras.models import load_model

# ==============================================================================
# 1. CONFIGURATION
# ==============================================================================

# --- DATABASE CONFIGURATION ---
# IMPORTANT: When deploying, these environment variables MUST be set to your 
# cloud PostgreSQL database credentials.
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"), 
    "database": os.getenv("DB_NAME", "AgroscanAI"),
    "user": os.getenv("DB_USER", "postgres"), 
    "password": os.getenv("DB_PASSWORD", "root"), 
    "port": os.getenv("DB_PORT", "5432")
}

# --- ML MODEL CONFIGURATION ---
MODEL_PATH = "./best_tea_disease_model_v3.h5" 
IMG_HEIGHT = 160
IMG_WIDTH = 160
CONFIDENCE_THRESHOLD = 0.70 
NON_TEA_LEAF_CLASS_NAME = "Other_Non_Tea_Leaf" 

CLASS_NAMES = [
    'Anthracnose', 
    NON_TEA_LEAF_CLASS_NAME, 
    'algal leaf', 
    'bird eye spot', 
    'brown blight', 
    'gray light', 
    'healthy', 
    'red leaf spot', 
    'white spot' 
]

# --- RECOMMENDATIONS MAP ---
RECOMMENDATIONS = {
    'algal leaf': "Algal leaf spot. Improve air circulation, reduce humidity, and consider copper-based fungicides if severe. Action: **Prune and Apply Fungicide**",
    'Anthracnose': "Anthracnose disease. Prune infected parts, remove fallen leaves, and apply recommended fungicides. Action: **Prune and Treat with Fungicide**",
    'bird eye spot': "Bird's eye spot. Improve drainage, ensure proper spacing, and consider cultural practices to reduce moisture. Action: **Improve Drainage and Spacing**",
    'brown blight': "Brown blight. Improve sanitation, remove infected leaves, and use appropriate fungicides as per local recommendations. Action: **Sanitation and Fungicide**",
    'gray light': "Gray blight. Improve air circulation, avoid overhead irrigation, and use fungicides if necessary. Action: **Improve Air Flow and Treat**",
    'healthy': "Your tea plant appears healthy! Continue good agricultural practices, including proper fertilization and pest monitoring. Action: **Maintain Practices**",
    'red leaf spot': "Red leaf spot. Ensure balanced fertilization, especially potassium, and manage soil moisture. Action: **Balance Nutrients and Moisture**",
    'white spot': "White spot. Improve plant vigor, reduce stress, and consider organic or chemical treatments. Action: **Increase Vigor and Treatment**",
    NON_TEA_LEAF_CLASS_NAME: "The uploaded image is not a tea leaf. Please ensure you are submitting a clear photo of a tea leaf for diagnosis. Action: **Retake Photo**"
}

# ==============================================================================
# 2. GLOBAL VARIABLES & APP SETUP
# ==============================================================================

app = FastAPI(
    title="Agroscan AI Unified Backend",
    description="API for detecting tea plant diseases and managing users with PostgreSQL.",
    version="0.4.1", 
)

# Global variables
model = None
db_pool = None

# --- CORS Configuration ---
origins = ["*"] 
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# 3. PYDANTIC SCHEMAS
# ==============================================================================

# Schemas for PostgreSQL Auth
class UserRegistration(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# Schemas for ML Prediction and History 
class SavedScan(BaseModel):
    user_email: str 
    prediction: str
    confidence: float
    recommendation: str 
    date: Optional[str] = None # DB generates this, but kept for schema consistency

class PredictionResponse(BaseModel):
    status: str = Field(..., description="SUCCESS, REJECTED (Non-Tea), or LOW_CONFIDENCE")
    prediction: str = Field(..., description="The predicted class name.")
    confidence: float
    message: str = Field(..., description="A summary of the result.")
    recommendation: str = Field(..., description="Specific advice or instruction for the user.")

# ==============================================================================
# 4. DATABASE UTILITIES
# ==============================================================================

def initialize_pool():
    """Initializes the PostgreSQL connection pool."""
    global db_pool
    if db_pool is None:
        try:
            db_pool = psycopg2.pool.SimpleConnectionPool(
                minconn=1, 
                maxconn=10, 
                **DB_CONFIG
            )
            print("PostgreSQL connection pool initialized successfully.")
        except Exception as e:
            print(f"Failed to initialize connection pool: {e}")
            raise

def get_db_connection():
    """
    Dependency: Provides a connection object and handles cleanup.
    """
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
        # Use a temporary cursor to avoid committing the main transaction block prematurely
        with conn.cursor() as cur:
            cur.execute(sql.SQL("SELECT user_id FROM users WHERE email = %s"), (email,))
            result = cur.fetchone()
            return result[0] if result else None
    except Exception as e:
        # Note: Do not rollback here, as this function is called inside other transaction blocks
        print(f"Error fetching user ID for {email}: {e}")
        return None

# ==============================================================================
# 5. STARTUP & SHUTDOWN EVENTS
# ==============================================================================

@app.on_event("startup")
async def load_ml_model():
    """Load the pre-trained TensorFlow/Keras model."""
    global model
    try:
        model = load_model(MODEL_PATH)
        print(f"ML model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        print(f"ERROR: Could not load the ML model from {MODEL_PATH}. Reason: {e}")
        model = None 

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

# ==============================================================================
# 6. ML PREDICTION CORE LOGIC (UNCHANGED)
# ==============================================================================

async def predict_disease_actual_model(image_bytes: bytes) -> PredictionResponse:
    """
    Performs image preprocessing and model inference, implementing robustness checks.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="ML model not loaded. Server is not ready for predictions.")

    try:
        # Load and preprocess the image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize((IMG_HEIGHT, IMG_WIDTH)) 
        image_array = np.asarray(image) 
        image_array = image_array / 255.0 # Normalize pixel values
        image_batch = np.expand_dims(image_array, axis=0) # Add batch dimension

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

    # Robustness Checks and Response Generation
    
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

# ==============================================================================
# 7. ENDPOINTS
# ==============================================================================

# --- Root and Health Endpoints ---

@app.get("/")
async def read_root():
    """Root endpoint for the Agroscan AI API."""
    return {"message": "Welcome to Agroscan AI Unified Backend! Go to /docs for API documentation."}

@app.get("/health")
async def health_check():
    """Health check endpoint to ensure the API is running and model/DB are connected."""
    model_status = "ok" if model is not None else "model_not_loaded"
    db_status = "ok" if db_pool is not None else "db_pool_uninitialized"
    
    message = "API is healthy."
    if model_status != "ok":
        message += " ML model failed to load."
    if db_status != "ok":
        message += " DB pool failed to initialize."

    return {"status": "ok" if model_status == "ok" and db_status == "ok" else "degraded",
            "model_status": model_status,
            "db_status": db_status,
            "message": message}

# --- ML Prediction Endpoint ---
@app.post("/predict", response_model=PredictionResponse, tags=["ML Prediction"])
async def predict_disease_endpoint(file: UploadFile = File(...)):
    """
    Receives an image file, passes it to the ML model for prediction,
    and returns the structured prediction result including the recommendation.
    """
    image_bytes = await file.read()
    return await predict_disease_actual_model(image_bytes)


# --- DB Authentication Endpoints ---

@app.post("/register", tags=["Auth"])
def register_user(user_data: UserRegistration, conn: psycopg2.connect = Depends(get_db_connection)):
    """Handles user registration using PostgreSQL."""
    email = user_data.email
    hashed_password = user_data.password 
    
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
            
            user_id, stored_password = result
            
            if password != stored_password:
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

# --- DB Data Endpoint ---
@app.get("/api/v1/diseases", tags=["DB Data"], response_model=List[Dict[str, Any]])
def get_disease_list(conn: psycopg2.connect = Depends(get_db_connection)):
    """Fetches a list of known diseases from the database."""
    try:
        with conn.cursor() as cur:
            # NOTE: This query assumes a 'diseases' table exists in your DB.
            cur.execute("SELECT disease_name, description FROM diseases;")
            columns = [desc[0] for desc in cur.description]
            diseases = [dict(zip(columns, row)) for row in cur.fetchall()]
            return diseases
    except Exception as e:
        conn.rollback()
        print(f"Database error fetching diseases: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: Could not fetch disease list.")


# --- HISTORY MANAGEMENT ENDPOINTS (USING POSTGRESQL SCANS TABLE) ---

@app.post("/save_scan", tags=["History (PostgreSQL)"])
async def save_scan_endpoint(scan_data: SavedScan, conn: psycopg2.connect = Depends(get_db_connection)):
    """Saves a prediction scan to the user's persistent history in PostgreSQL."""
    
    user_email = scan_data.user_email
    user_id = get_user_id_by_email(user_email, conn)
    
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.SQL("""
                    INSERT INTO scans (user_id, prediction_name, confidence, recommendation_text)
                    VALUES (%s, %s, %s, %s)
                    RETURNING scan_id;
                """),
                (user_id, scan_data.prediction, scan_data.confidence, scan_data.recommendation)
            )
            scan_id = cur.fetchone()[0]
            conn.commit()
            
            return {"message": "Scan saved successfully to PostgreSQL.", "scan_id": scan_id}
            
    except Exception as e:
        conn.rollback()
        print(f"Database insertion error for scan: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save scan history.")

@app.get("/get_scans/{user_email}", tags=["History (PostgreSQL)"])
async def get_scans_endpoint(user_email: str, conn: psycopg2.connect = Depends(get_db_connection)):
    """Retrieves all saved scans for a specific user from PostgreSQL."""
    
    user_id = get_user_id_by_email(user_email, conn)
    
    if user_id is None:
        return {"scans": [], "count": 0, "message": "User not found or no scans available."}
        
    try:
        # Use DictCursor to fetch results as dictionaries for easy conversion
        with conn.cursor(cursor_factory=DictCursor) as cur: 
            cur.execute(
                sql.SQL("""
                    SELECT 
                        prediction_name as prediction, 
                        confidence, 
                        recommendation_text as recommendation,
                        scan_date as date
                    FROM scans 
                    WHERE user_id = %s
                    ORDER BY scan_date DESC;
                """),
                (user_id,)
            )
            # Convert DictRow objects to standard dictionaries for the response
            scans = [dict(row) for row in cur.fetchall()] 
            
            return {"scans": scans, "count": len(scans), "message": "Scans retrieved successfully from PostgreSQL."}
            
    except Exception as e:
        conn.rollback()
        print(f"Database query error for scans: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve scan history.")


# Main block for running the application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
