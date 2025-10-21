# AgroscanAI/backend/train_model.py

import tensorflow as tf
from tensorflow.keras.preprocessing import image_dataset_from_directory
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
import os
import shutil 


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
DATASET_DIR = "../tea sickness dataset" # <--- YOU MUST CHANGE THIS PATH!
MODEL_SAVE_FILENAME = "best_tea_disease_model_v2.h5" # Name changed to v2
IMG_HEIGHT = 224
IMG_WIDTH = 224
BATCH_SIZE = 32
SEED = 42
EPOCHS = 30
LEARNING_RATE = 0.0001

# CRITICAL UPDATE: Define the new class name for non-tea-leaf images.
NON_TEA_LEAF_CLASS_NAME = "Other_Non_Tea_Leaf"
# To make this work, you must create a subdirectory with this name
# inside the 'train' and 'test' folders of your dataset, and populate
# it with images that are NOT tea leaves (e.g., general pictures).


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
        interpolation='nearest',
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
        seed=SEED
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)
    print(f"\nFound {num_classes} classes: {class_names}") # This should now include 'Other_Non_Tea_Leaf'

    # Normalize image pixel values from [0, 255] to [0, 1]
    normalization_layer = tf.keras.layers.Rescaling(1./255)
    train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
    val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))

    # Prepare data for performance (cache and prefetch)
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
    print("\nDataset loaded and prepared for performance (cached, prefetched, normalized).")

except Exception as e:
    print(f"\nERROR: Could not load dataset. Please check DATASET_DIR path and folder structure.")
    print(f"Details: {e}")
    print("Expected structure: DATASET_DIR/train/class1/, DATASET_DIR/train/class2/, etc., and the new folder: DATASET_DIR/train/Other_Non_Tea_Leaf/")
    exit() # Exit the script if dataset loading fails


# --- 2. Build the CNN Model using Transfer Learning ---

print("\n--- Building the Transfer Learning Model ---")

# Load the MobileNetV2 base model, pre-trained on ImageNet
base_model = MobileNetV2(input_shape=(IMG_HEIGHT, IMG_WIDTH, 3),
                         include_top=False,
                         weights='imagenet')

# Freeze the base model layers
base_model.trainable = False

# Create the new classification head on top of the pre-trained base
x = base_model.output
x = GlobalAveragePooling2D()(x) # Reduces the spatial dimensions of the features
x = Dense(512, activation='relu')(x) # A new dense layer with ReLU activation
x = Dropout(0.5)(x) # Dropout layer to prevent overfitting
# The output layer size (num_classes) now dynamically includes the new Non_Tea_Leaf class.
predictions = Dense(num_classes, activation='softmax')(x)

# Combine the base model and our new head into a single model
model = Model(inputs=base_model.input, outputs=predictions)

# --- 3. Compile the Model ---
model.compile(optimizer=Adam(learning_rate=LEARNING_RATE),
              loss=tf.keras.losses.SparseCategoricalCrossentropy(),
              metrics=['accuracy'])

model.summary() # Print a summary of the model architecture, showing layers and parameters

# --- 4. Define Callbacks for Training ---
checkpoint_filepath = MODEL_SAVE_FILENAME
model_checkpoint_callback = ModelCheckpoint(
    filepath=checkpoint_filepath,
    save_weights_only=False,
    monitor='val_accuracy',
    mode='max',
    save_best_only=True,
    verbose=1
)

early_stopping_callback = EarlyStopping(
    monitor='val_accuracy',
    patience=7,
    mode='max',
    verbose=1,
    restore_best_weights=True
)

callbacks = [model_checkpoint_callback, early_stopping_callback]


# --- 5. Train the Model ---
print(f"\n--- Training the Model for {EPOCHS} Epochs ---")
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
