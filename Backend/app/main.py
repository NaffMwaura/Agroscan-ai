import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
import io
from PIL import Image # For basic image processing
import numpy as np # For numerical operations, especially image arrays
import tensorflow as tf # For loading the model and tensor operations
from tensorflow.keras.models import load_model # Specific import for loading Keras models
from pydantic import BaseModel
from passlib.context import CryptContext


# Create a FastAPI application instance
app = FastAPI(
    title="Agroscan AI Backend",
    description="API for detecting tea plant diseases using AI/ML.",
    version="0.1.0",
)

# --- CORS (Cross-Origin Resource Sharing) Configuration ---
origins = [
    "http://localhost:5173",  # Default Vite dev server port
    "https://agroscanai.netlify.app",
    "http://localhost",
    "http://localhost:8081",
    "http://172.16.75.94:8000",
    "http://172.16.79.243",  # This is the new, required origin for your mobile app
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global variable to hold the loaded ML model ---
model = None

# --- Configuration for our ML Model ---
MODEL_PATH = "./best_tea_disease_model.h5"
IMG_HEIGHT = 224
IMG_WIDTH = 224

CLASS_NAMES = [
    'Anthracnose','algal leaf',  'bird eye spot', 'brown blight',
    'gray light', 'healthy', 'red leaf spot', 'white spot'
]


# --- Authentication and User Management ---
users_db = {}
# Using the correct scheme for passlib
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") 

# Pydantic model for user registration
class User(BaseModel):
    username: str 
    email: str
    password: str

# Pydantic model for user login
class UserLogin(BaseModel):
    email: str
    password: str

# Keep hashing functions for when we re-enable security
def get_password_hash(password: str) -> str:
    """Hashes the password, truncating if necessary to comply with bcrypt's 72-byte limit."""
    
    # Check password length and truncate to prevent bcrypt's 72-byte limit error
    if len(password.encode('utf-8')) > 72:
        print("WARNING: Password truncated to 72 bytes for hashing.")
        # Truncate to the first 72 characters before hashing
        password = password[:72]
        
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies the plain password against the hashed password."""
    # NOTE: passlib/bcrypt handles truncation internally for verification if needed
    return pwd_context.verify(plain_password, hashed_password)

@app.post("/register")
async def register_user(user: User):
    """
    Register a new user. TEMPORARILY DISABLED HASHING FOR TESTING.
    *** RE-ENABLE SECURITY AFTER DEBUGGING ***
    """
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # --------------------------------------------------------------------------
    # SECURITY BYPASS: Storing plain password for testing. DO NOT USE IN PRODUCTION.
    # hashed_password = get_password_hash(user.password) # <-- SECURE LINE (COMMENTED OUT)
    plain_password = user.password # <-- INSECURE, TEMPORARY LINE (NEW)
    # --------------------------------------------------------------------------
    
    users_db[user.email] = {
        "username": user.username,
        "email": user.email,
        # We store the plain password under the old key for easy rollback
        "hashed_password": plain_password 
    }
    # NOTE: Returning success message. Token generation should be handled after successful login.
    return {"message": "User registered successfully (Password stored UNHASHED!)"}

@app.post("/login")
async def login_user(user_data: UserLogin):
    """
    Log in a user by verifying their password against the currently unhashed stored value.
    """
    db_user = users_db.get(user_data.email)
    if not db_user:
        raise HTTPException(status_code=400, detail="Incorrect email or password!")
    
    stored_value = db_user["hashed_password"]
    
    # --------------------------------------------------------------------------
    # SECURITY BYPASS: Direct comparison against the stored plain password.
    # if not verify_password(user_data.password, stored_value): # <-- SECURE LINE (COMMENTED OUT)
    if user_data.password != stored_value: # <-- INSECURE, TEMPORARY LINE (NEW)
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    # --------------------------------------------------------------------------
    
    # SUCCESS: Return a mock token for the frontend to save
    mock_token = f"fake_auth_token_for_{user_data.email}"
    return {"message": "Login successful", "token": mock_token}


# --- App Startup Event: Load the ML Model ---
@app.on_event("startup")
async def load_ml_model():
    """
    Load the pre-trained TensorFlow/Keras model when the FastAPI application starts.
    """
    global model
    try:
        model = load_model(MODEL_PATH)
        print(f"ML model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        print(f"ERROR: Could not load the ML model from {MODEL_PATH}. Reason: {e}")
        model = None 

# --- ML Model Prediction Function ---
async def predict_disease_actual_model(image_bytes: bytes) -> Dict[str, Any]:
    # Ensure model is loaded before proceeding
    if model is None:
        raise HTTPException(status_code=503, detail="ML model not loaded. Server is not ready for predictions.")

    try:
        # 1. Load and preprocess the image
        image = Image.open(io.BytesIO(image_bytes))
        image = image.resize((IMG_HEIGHT, IMG_WIDTH)) 
        image_array = np.asarray(image) 

        # Normalize pixel values to [0, 1] 
        image_array = image_array / 255.0

        # Add a batch dimension: (height, width, channels) -> (1, height, width, channels)
        image_batch = np.expand_dims(image_array, axis=0)

        # 2. Make prediction
        predictions = model.predict(image_batch)
        predicted_probabilities = predictions[0] 
        predicted_class_index = np.argmax(predicted_probabilities)
        confidence = float(predicted_probabilities[predicted_class_index])

        # 3. Get predicted class name
        predicted_disease = CLASS_NAMES[predicted_class_index]

        # 4. Generate suggestions based on prediction
        suggestions = "Consult a local agricultural expert for precise guidance."
        if "healthy" in predicted_disease.lower():
            suggestions = "Your tea plant appears healthy! Continue good agricultural practices, including proper fertilization and pest monitoring."
        elif "algal leaf" in predicted_disease.lower():
            suggestions = "Algal leaf spot. Improve air circulation, reduce humidity, and consider copper-based fungicides if severe."
        elif "anthracnose" in predicted_disease.lower():
            suggestions = "Anthracnose disease. Prune infected parts, remove fallen leaves, and apply recommended fungicides."
        elif "bird eye spot" in predicted_disease.lower():
            suggestions = "Bird's eye spot. Improve drainage, ensure proper spacing, and consider cultural practices to reduce moisture."
        elif "brown blight" in predicted_disease.lower():
            suggestions = "Brown blight. Improve sanitation, remove infected leaves, and use appropriate fungicides as per local recommendations."
        elif "gray light" in predicted_disease.lower():
            suggestions = "Gray blight. Improve air circulation, avoid overhead irrigation, and use fungicides if necessary."
        elif "red leaf spot" in predicted_disease.lower():
            suggestions = "Red leaf spot. Ensure balanced fertilization, especially potassium, and manage soil moisture."
        elif "white spot" in predicted_disease.lower():
            suggestions = "White spot. Improve plant vigor, reduce stress, and consider organic or chemical treatments."


        return {
            "success": True,
            "prediction": predicted_disease,
            "confidence": confidence,
            "suggestions": suggestions,
            "debug_info": {
                "received_bytes": len(image_bytes),
                "predicted_probabilities": predicted_probabilities.tolist() 
            }
        }

    except Image.UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid image file. Could not identify image format.")
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process image or make prediction: {str(e)}")


# --- API Endpoints ---
@app.get("/")
async def read_root():
    """
    Root endpoint for the Agroscan AI API.
    """
    return {"message": "Welcome to Agroscan AI Backend! Go to /docs for API documentation."}

@app.get("/health")
async def health_check():
    """
    Health check endpoint to ensure the API is running and model is loaded.
    """
    status = "ok" if model is not None else "model_not_loaded"
    message = "API is healthy!" if model is not None else "API is running, but ML model failed to load."
    return {"status": status, "message": message}

@app.post("/predict")
async def predict_disease_endpoint(file: UploadFile = File(...)):
    """
    Receives an image file, passes it to the ML model for prediction,
    and returns the prediction result.
    """
    image_bytes = await file.read()
    return await predict_disease_actual_model(image_bytes)

# Optional: Add a main block for easy running (if not using uvicorn directly)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
