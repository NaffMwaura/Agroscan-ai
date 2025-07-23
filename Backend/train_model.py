# AgroscanAI/backend/train_model.py

import tensorflow as tf
from tensorflow.keras.preprocessing import image_dataset_from_directory
# Removed ImageDataGenerator as image_dataset_from_directory is preferred for simpler data pipelines
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
import os
import shutil # Still useful for general file operations if needed


print(f"TensorFlow Version: {tf.__version__}")
# Check for GPU
physical_devices = tf.config.experimental.list_physical_devices('GPU')
if physical_devices:
    try:
        # Enable dynamic memory allocation if you have a GPU
        for gpu in physical_devices:
            tf.config.experimental.set_memory_growth(gpu, True)
        print(f"Num GPUs Available: {len(physical_devices)}. Memory growth enabled.")
    except RuntimeError as e:
        # Memory growth must be set before GPUs have been initialized
        print(e)
else:
    print("No GPU devices found. Training will run on CPU.")


# --- Configuration ---
# IMPORTANT: Adjust this path to where you downloaded and extracted your dataset!
# Example: If your dataset is in 'AgroscanAI/Tea Leaf Disease Dataset'
# and this script is in 'AgroscanAI/backend/', then use "../Tea Leaf Disease Dataset"
DATASET_DIR = "../tea sickness dataset" # <--- YOU MUST CHANGE THIS PATH!
MODEL_SAVE_FILENAME = "best_tea_disease_model.h5" # Name of the file to save the best model
IMG_HEIGHT = 224
IMG_WIDTH = 224
BATCH_SIZE = 32 # Standard batch size for training
SEED = 42 # For reproducibility
EPOCHS = 30 # Number of training epochs (iterations over the entire dataset) - Increased slightly for better learning
LEARNING_RATE = 0.0001 # Initial learning rate for the new layers

# --- 1. Load and Prepare the Dataset ---
# Ensure the dataset path exists
if not os.path.isdir(os.path.join(DATASET_DIR, 'train')):
    print(f"Error: Training data directory not found at {os.path.join(DATASET_DIR, 'train')}")
    print("Please check your DATASET_DIR path in train_model.py and ensure the dataset is extracted correctly.")
    exit()

try:
    print(f"\nAttempting to load training data from: {os.path.join(DATASET_DIR, 'train')}")
    train_ds = image_dataset_from_directory(
        os.path.join(DATASET_DIR, 'train'),
        labels='inferred',
        label_mode='int', # Integer-encode labels (0, 1, 2, ...)
        image_size=(IMG_HEIGHT, IMG_WIDTH),
        interpolation='nearest', # How to resize images if different from target
        batch_size=BATCH_SIZE,
        shuffle=True, # Shuffle training data
        seed=SEED
    )

    print(f"Attempting to load validation/test data from: {os.path.join(DATASET_DIR, 'test')}")
    val_ds = image_dataset_from_directory(
        os.path.join(DATASET_DIR, 'test'),
        labels='inferred',
        label_mode='int',
        image_size=(IMG_HEIGHT, IMG_WIDTH),
        interpolation='nearest',
        batch_size=BATCH_SIZE,
        shuffle=False, # Don't shuffle validation data
        seed=SEED # Use same seed for consistency if splitting from one dir
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)
    print(f"\nFound {num_classes} classes: {class_names}")

    # Normalize image pixel values from [0, 255] to [0, 1]
    # This is a crucial preprocessing step for many pre-trained models like MobileNetV2.
    # The Rescaling layer is part of the Keras preprocessing layers.
    normalization_layer = tf.keras.layers.Rescaling(1./255)
    train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
    val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))

    # Prepare data for performance (cache and prefetch)
    # .cache() keeps images in memory after first epoch (if dataset fits)
    # .prefetch() overlaps data preprocessing and model execution
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
    print("\nDataset loaded and prepared for performance (cached, prefetched, normalized).")

except Exception as e:
    print(f"\nERROR: Could not load dataset. Please check DATASET_DIR path and folder structure.")
    print(f"Details: {e}")
    print("Expected structure: DATASET_DIR/train/class1/, DATASET_DIR/train/class2/, etc.")
    print("And: DATASET_DIR/test/class1/, DATASET_DIR/test/class2/, etc.")
    exit() # Exit the script if dataset loading fails


# --- 2. Build the CNN Model using Transfer Learning ---

print("\n--- Building the Transfer Learning Model ---")

# Load the MobileNetV2 base model, pre-trained on ImageNet
# input_shape: Specifies the shape of the input images (224x224 pixels, 3 color channels)
# include_top=False: Excludes the original ImageNet classification head,
#                    allowing us to add our own layers for tea disease classification.
# weights='imagenet': Uses the weights learned from the vast ImageNet dataset.
base_model = MobileNetV2(input_shape=(IMG_HEIGHT, IMG_WIDTH, 3),
                         include_top=False,
                         weights='imagenet')

# Freeze the base model layers
# This prevents the weights of the pre-trained MobileNetV2 layers from being updated
# during the initial training phase. We only train the new layers we add.
base_model.trainable = False

# Create the new classification head on top of the pre-trained base
x = base_model.output
x = GlobalAveragePooling2D()(x) # Reduces the spatial dimensions of the features
x = Dense(512, activation='relu')(x) # A new dense layer with ReLU activation
x = Dropout(0.5)(x) # Dropout layer to prevent overfitting (randomly sets 50% of neurons to 0 during training)
# Output layer with 'softmax' activation for multi-class classification
# The number of units equals the number of classes (tea diseases + healthy)
predictions = Dense(num_classes, activation='softmax')(x)

# Combine the base model and our new head into a single model
model = Model(inputs=base_model.input, outputs=predictions)

# --- 3. Compile the Model ---
# optimizer: Adam is a popular choice for deep learning
# loss: SparseCategoricalCrossentropy is used because our labels are integers (0, 1, 2, ...)
# metrics: We want to track the accuracy during training
model.compile(optimizer=Adam(learning_rate=LEARNING_RATE),
              loss=tf.keras.losses.SparseCategoricalCrossentropy(),
              metrics=['accuracy'])

model.summary() # Print a summary of the model architecture, showing layers and parameters

# --- 4. Define Callbacks for Training ---
# ModelCheckpoint: Saves the model with the best validation accuracy.
# This ensures that even if training overfits later, you still have the best performing model.
checkpoint_filepath = MODEL_SAVE_FILENAME
model_checkpoint_callback = ModelCheckpoint(
    filepath=checkpoint_filepath,
    save_weights_only=False, # Save the entire model (architecture + weights)
    monitor='val_accuracy', # Metric to monitor for improvement
    mode='max', # We want to maximize validation accuracy
    save_best_only=True, # Only save a new model if val_accuracy improves
    verbose=1 # Show messages when a new best model is saved
)

# EarlyStopping: Stops training if the monitored metric (val_accuracy) doesn't improve
# for a specified number of epochs ('patience').
early_stopping_callback = EarlyStopping(
    monitor='val_accuracy',
    patience=7, # Number of epochs with no improvement after which training will be stopped
    mode='max',
    verbose=1,
    restore_best_weights=True # Restore model weights from the epoch with the best value
)

callbacks = [model_checkpoint_callback, early_stopping_callback]



# --- 5. Train the Model ---
print(f"\n--- Training the Model for {EPOCHS} Epochs ---")
# model.fit() is the method to train the model
history = model.fit(
    train_ds,
    epochs=EPOCHS,
    validation_data=val_ds,
    callbacks=callbacks
)

# --- 6. Evaluate the Model (on validation set for final check) ---
print("\n--- Evaluating the Final Model (best weights restored by EarlyStopping) ---")
loss, accuracy = model.evaluate(val_ds)
print(f"Validation Loss: {loss:.4f}")
print(f"Validation Accuracy: {accuracy:.4f}")

# The best model is already saved by ModelCheckpoint.
print(f"\nModel training script finished. The best model is saved as '{MODEL_SAVE_FILENAME}' in the current directory.")
print("This trained model is now ready to be loaded and used in your FastAPI backend for predictions!")