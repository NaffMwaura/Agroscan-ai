# AgroscanAI/backend/app/main.py

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import io
from PIL import Image # For basic image processing
import numpy as np # For numerical operations, especially image arrays
import tensorflow as tf # For loading the model and tensor operations
from tensorflow.keras.models import load_model # Specific import for loading Keras models


app = FastAPI(
    title="Agroscan AI Backend",
    description="API for detecting tea plant diseases using AI/ML.",
    version="0.1.0",
)

# --- CORS (Cross-Origin Resource Sharing) Configuration ---
origins = [
    "http://localhost:5173",  # Default Vite dev server port
    # Add your Netlify deployed frontend URL here later when you deploy
    "https://agroscanai.netlify.app/",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global variable to hold the loaded ML model ---
# It's initialized to None and loaded during startup.
model = None

# --- Configuration for our ML Model ---
# IMPORTANT: Adjust MODEL_PATH if your .h5 file is not directly in the 'backend' folder
# If train_model.py saved it to 'backend/best_tea_disease_model.h5', this path is correct.
MODEL_PATH = "./best_tea_disease_model.h5"
IMG_HEIGHT = 224
IMG_WIDTH = 224

# IMPORTANT: These class names MUST match the order that TensorFlow
# generated them during training (usually alphabetical order of subfolders).
# Verify this list against the output of your train_model.py script's "Found X classes" line.
CLASS_NAMES = [
    'Anthracnose','algal leaf',  'bird eye spot', 'brown blight',
    'gray light', 'healthy', 'red leaf spot', 'white spot'
]

#'Anthracnose', 'algal leaf', 'bird eye spot',
#  'brown blight', 'gray light', 'healthy', 'red leaf spot', 'white spot'
#This is the order from the result

# --- App Startup Event: Load the ML Model ---
@app.on_event("startup")
async def load_ml_model():
    """
    Load the pre-trained TensorFlow/Keras model when the FastAPI application starts.
    This prevents loading the model on every prediction request, saving time and resources.
    """
    global model
    try:
        model = load_model(MODEL_PATH)
        # Optional: Run a dummy prediction to 'warm up' the model if needed
        # model.predict(np.zeros((1, IMG_HEIGHT, IMG_WIDTH, 3)))
        print(f"ML model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        print(f"ERROR: Could not load the ML model from {MODEL_PATH}. Reason: {e}")
        # Depending on criticality, you might want to raise an exception or set a flag
        # to prevent prediction attempts if the model isn't loaded.
        model = None # Ensure model is None if loading failed

# --- ML Model Prediction Function ---
async def predict_disease_actual_model(image_bytes: bytes) -> Dict[str, Any]:
    """
    Uses the loaded ML model to predict the disease from an image.
    Performs necessary image preprocessing.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="ML model not loaded. Server is not ready for predictions.")

    try:
        # 1. Load and preprocess the image
        image = Image.open(io.BytesIO(image_bytes))
        image = image.resize((IMG_HEIGHT, IMG_WIDTH)) # Resize to model's input size
        image_array = np.asarray(image) # Convert PIL Image to NumPy array

        # Normalize pixel values to [0, 1] (as done during training)
        image_array = image_array / 255.0

        # Add a batch dimension: (height, width, channels) -> (1, height, width, channels)
        # The model expects a batch of images, even if it's just one.
        image_batch = np.expand_dims(image_array, axis=0)

        # 2. Make prediction
        predictions = model.predict(image_batch)
        # Get the confidence for each class
        predicted_probabilities = predictions[0] # Get probabilities for the single image
        # Get the index of the class with the highest probability
        predicted_class_index = np.argmax(predicted_probabilities)
        # Get the confidence level of the top prediction
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
                "predicted_probabilities": predicted_probabilities.tolist() # Convert numpy array to list for JSON
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