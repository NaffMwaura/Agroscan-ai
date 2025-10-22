import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
from tensorflow.keras.optimizers import Adam
import os

# --- Configuration ---
IMG_SIZE = 160  # Reduced from 224 to 160 to lower memory usage
BATCH_SIZE = 16 # Reduced from 32 to 16 to prevent MemoryError/Segmentation Fault
EPOCHS = 30 # Increased epochs for better learning with early stopping
DATA_DIR = '../tea sickness dataset/train' # Assuming this is your training data root
MODEL_PATH = 'best_tea_disease_model_v3.h5'

# Check if the data directory exists
if not os.path.exists(DATA_DIR):
    print(f"Error: Data directory not found at {DATA_DIR}")
    print("Please check your path and make sure your 'tea sickness dataset/train' folder is in the same location.")
    exit()

# 1. Data Augmentation and Loading
# This generator applies subtle random transformations to make the model more robust.
train_datagen = ImageDataGenerator(
    rescale=1./255, # Normalize pixel values
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

# Load the training data, inferring class names from subdirectories
train_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=True
)

NUM_CLASSES = train_generator.num_classes
CLASS_NAMES = list(train_generator.class_indices.keys())
print(f"Found {NUM_CLASSES} classes: {CLASS_NAMES}")

# 2. Transfer Learning using MobileNetV2
# Load the pre-trained MobileNetV2 base model (excluding the top classification layer)
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3), # Input shape now 160x160
    include_top=False,
    weights='imagenet'
)

# Freeze the weights of the base model so they aren't changed during initial training
base_model.trainable = False

# 3. Build the new classification head
model = Sequential([
    base_model,
    GlobalAveragePooling2D(), # Reduces feature map size for input to Dense layers
    Dense(512, activation='relu'),
    Dropout(0.5), # Regularization to prevent overfitting
    Dense(NUM_CLASSES, activation='softmax') # Output layer with 9 classes
])

# 4. Compile the model
# Use a custom, lower learning rate for fine-tuning the pre-trained weights
model.compile(
    optimizer=Adam(learning_rate=0.0001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# 5. Define Callbacks
# ModelCheckpoint saves the best model based on validation loss/accuracy
checkpoint = ModelCheckpoint(
    MODEL_PATH,
    monitor='loss', # Monitor training loss for best model
    save_best_only=True,
    mode='min',
    verbose=1
)

# EarlyStopping prevents overfitting by stopping training if loss doesn't improve
early_stopping = EarlyStopping(
    monitor='loss',
    patience=5, # Number of epochs with no improvement after which training will be stopped
    mode='min',
    restore_best_weights=True,
    verbose=1
)

callbacks_list = [checkpoint, early_stopping]

# 6. Train the model
print("Starting model training...")
# REMOVED steps_per_epoch here to allow Keras to auto-calculate the correct number of steps
history = model.fit(
    train_generator,
    epochs=EPOCHS,
    callbacks=callbacks_list
)

print(f"\nTraining complete. Best model saved to {MODEL_PATH}")

# Optional: Unfreeze and fine-tune for better results if time allows
# base_model.trainable = True
# model.compile(...)
# model.fit(...)
