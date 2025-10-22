import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
import io
from PIL import Image
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from pydantic import BaseModel, Field
from passlib.context import CryptContext
from datetime import datetime

# --- Configuration for ML Robustness ---
MODEL_PATH = "./best_tea_disease_model_v3.h5" # Path to the new 9-class model
# *** FIX APPLIED HERE ***: Changed from 224 to 160 to match the MobileNetV2 input shape
IMG_HEIGHT = 160
IMG_WIDTH = 160
# *** END FIX ***
CONFIDENCE_THRESHOLD = 0.70 # Minimum confidence for a 'SUCCESS' diagnosis
NON_TEA_LEAF_CLASS_NAME = "Other_Non_Tea_Leaf" 

# CRITICAL: This list now contains your original 8 classes + the robustness class (9 total).
# The order MUST match the alphabetical order of the directories used during training.
CLASS_NAMES = [
    'Anthracnose', 	 	 	 	# 1
    NON_TEA_LEAF_CLASS_NAME, 	# 2: Other_Non_Tea_Leaf
    'algal leaf', 	 	 	 	# 3
    'bird eye spot', 	 	 	# 4
    'brown blight', 	 	 	# 5
    'gray light', 	 	 	 	# 6
    'healthy', 	 	 	 	    # 7
    'red leaf spot', 	 	 	# 8
    'white spot' 	 	 	 	# 9
]

# Create a FastAPI application instance
app = FastAPI(
    title="Agroscan AI Backend",
    description="API for detecting tea plant diseases using a robust AI/ML model.",
    version="0.3.1",
)

# --- CORS (Cross-Origin Resource Sharing) Configuration ---
origins = ["*"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global variable to hold the loaded ML model ---
model = None

# --- In-Memory 'Database' Structures ---
users_db: Dict[str, Dict[str, str]] = {}
scans_db: Dict[str, List[Dict[str, Any]]] = {}

# Authentication setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") 

# --- Pydantic Schemas ---
class User(BaseModel):
    username: str 
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class SavedScan(BaseModel):
    user_email: str
    prediction: str
    confidence: float
    suggestions: str
    date: str 

class PredictionResponse(BaseModel):
    status: str = Field(..., description="SUCCESS, REJECTED (Non-Tea), or LOW_CONFIDENCE")
    prediction: str = Field(..., description="The predicted class name.")
    confidence: float
    message: str = Field(..., description="A summary of the result.")
    recommendation: str = Field(..., description="Specific advice or instruction for the user.")

# --- Authentication Endpoints (Testing Mode) ---
@app.post("/register")
async def register_user(user: User):
    """
    Register a new user. DANGER: Passwords are being stored UNHASHED for quick testing.
    """
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # CRITICAL: This bypass MUST be removed and replaced with secure hashing in production.
    plain_password = user.password 
    
    users_db[user.email] = {
        "username": user.username,
        "email": user.email,
        "hashed_password": plain_password 
    }
    return {"message": "User registered successfully (DANGER: Password stored UNHASHED!)"}

@app.post("/login")
async def login_user(user_data: UserLogin):
    """
    Log in a user. DANGER: Verifying against stored plain password for quick testing.
    """
    db_user = users_db.get(user_data.email)
    if not db_user:
        raise HTTPException(status_code=400, detail="Incorrect email or password!")
    
    stored_value = db_user["hashed_password"]
    
    if user_data.password != stored_value: 
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    mock_token = f"fake_auth_token_for_{user_data.email}"
    return {"message": "Login successful", "token": mock_token}

# --- History Management Endpoints ---

@app.post("/save_scan")
async def save_scan_endpoint(scan_data: SavedScan):
    """Saves a prediction scan to the user's history."""
    scan_record = scan_data.model_dump()
    user_email = scan_record["user_email"]
    
    if user_email not in scans_db:
        scans_db[user_email] = []
        
    scans_db[user_email].append(scan_record)
    
    return {"message": "Scan saved successfully"}

@app.get("/get_scans/{user_email}")
async def get_scans_endpoint(user_email: str):
    """Retrieves all saved scans for a specific user."""
    user_scans = scans_db.get(user_email, [])
    user_scans.sort(key=lambda x: x.get('date', ''), reverse=True)
    return {"scans": user_scans, "count": len(user_scans)}


# --- App Startup Event: Load the ML Model ---
@app.on_event("startup")
async def load_ml_model():
    """Load the pre-trained TensorFlow/Keras model when the FastAPI application starts."""
    global model
    try:
        model = load_model(MODEL_PATH)
        print(f"ML model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        print(f"ERROR: Could not load the ML model from {MODEL_PATH}. Reason: {e}")
        model = None 

# --- Recommendations Map (Using ORIGINAL class names) ---
RECOMMENDATIONS = {
    'algal leaf': "Algal leaf spot. Improve air circulation, reduce humidity, and consider copper-based fungicides if severe.",
    'Anthracnose': "Anthracnose disease. Prune infected parts, remove fallen leaves, and apply recommended fungicides.",
    'bird eye spot': "Bird's eye spot. Improve drainage, ensure proper spacing, and consider cultural practices to reduce moisture.",
    'brown blight': "Brown blight. Improve sanitation, remove infected leaves, and use appropriate fungicides as per local recommendations.",
    'gray light': "Gray blight. Improve air circulation, avoid overhead irrigation, and use fungicides if necessary.",
    'healthy': "Your tea plant appears healthy! Continue good agricultural practices, including proper fertilization and pest monitoring.",
    'red leaf spot': "Red leaf spot. Ensure balanced fertilization, especially potassium, and manage soil moisture.",
    'white spot': "White spot. Improve plant vigor, reduce stress, and consider organic or chemical treatments.",
    NON_TEA_LEAF_CLASS_NAME: "The uploaded image is not a tea leaf. Please ensure you are submitting a clear photo of a tea leaf for diagnosis."
}

# --- ML Model Prediction Function (Robustness Logic) ---
async def predict_disease_actual_model(image_bytes: bytes) -> PredictionResponse:
    """
    Performs image preprocessing and model inference, implementing robustness checks.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="ML model not loaded. Server is not ready for predictions.")

    try:
        # 1. Load and preprocess the image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        # This line now uses the corrected 160x160 constants.
        image = image.resize((IMG_HEIGHT, IMG_WIDTH)) 
        image_array = np.asarray(image) 
        image_array = image_array / 255.0 # Normalize pixel values
        image_batch = np.expand_dims(image_array, axis=0) # Add batch dimension

        # 2. Make prediction
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

    # 3. Robustness Checks and Response Generation
    
    # A. Check for Non-Tea Image (Explicit Model Rejection)
    if predicted_disease == NON_TEA_LEAF_CLASS_NAME:
        rejection_message = RECOMMENDATIONS[NON_TEA_LEAF_CLASS_NAME]
        return PredictionResponse(
            status="REJECTED",
            prediction=predicted_disease,
            confidence=round(confidence, 4),
            message="Image Rejected: The uploaded photo is not a tea leaf (Non-Tea Leaf detected).",
            recommendation=rejection_message
        )

    # B. Check for Low Confidence Warning (Model Uncertainty)
    if confidence < CONFIDENCE_THRESHOLD:
        return PredictionResponse(
            status="LOW_CONFIDENCE",
            prediction=predicted_disease,
            confidence=round(confidence, 4),
            message=f"The top prediction is **{predicted_disease}**, but the confidence score ({round(confidence * 100, 2)}%) is below the {CONFIDENCE_THRESHOLD * 100}% threshold. Retrying with a clearer image is advised.",
            recommendation="Diagnosis uncertainty is high. Retake the photo or consult a local expert for verification."
        )

    # C. Successful Prediction (High Confidence Diagnosis)
    recommendation = RECOMMENDATIONS.get(predicted_disease, "Consult a local agricultural expert for precise guidance.")
    
    return PredictionResponse(
        status="SUCCESS",
        prediction=predicted_disease,
        confidence=round(confidence, 4),
        message=f"High confidence diagnosis: **{predicted_disease}**",
        recommendation=recommendation
    )


# --- Root and Health Endpoints ---
@app.get("/")
async def read_root():
    """Root endpoint for the Agroscan AI API."""
    return {"message": "Welcome to Agroscan AI Backend! Go to /docs for API documentation."}

@app.get("/health")
async def health_check():
    """Health check endpoint to ensure the API is running and model is loaded."""
    status_msg = "ok" if model is not None else "model_not_loaded"
    message = "API is healthy and model is loaded." if model is not None else "API is running, but ML model failed to load."
    return {"status": status_msg, "message": message}

# --- Main Prediction Endpoint ---
@app.post("/predict", response_model=PredictionResponse)
async def predict_disease_endpoint(file: UploadFile = File(...)):
    """
    Receives an image file, passes it to the ML model for prediction,
    and returns the structured prediction result.
    """
    image_bytes = await file.read()
    return await predict_disease_actual_model(image_bytes)

# Main block for running the application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
