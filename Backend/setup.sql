-- Check for and drop tables in reverse dependency order if they exist
DROP TABLE IF EXISTS scans;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS diseases;

-- 1. USERS Table
-- Stores user authentication details
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SCANS Table
-- Stores the historical disease diagnosis results for each user
CREATE TABLE scans (
    scan_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    diagnosis_result VARCHAR(100) NOT NULL,
    confidence_score REAL NOT NULL,
    treatment_recommendation TEXT,
    scan_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. DISEASES Table
-- Stores a simple list of known disease names and descriptions
CREATE TABLE diseases (
    disease_id SERIAL PRIMARY KEY,
    disease_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Optional: Insert initial data for the diseases endpoint
INSERT INTO diseases (disease_name, description) VALUES
('Anthracnose', 'Fungal disease causing black/brown spots and dieback.'),
('Algal Leaf', 'Caused by parasitic green algae, appears as reddish-brown velvety spots.'),
('Bird Eye Spot', 'Small, circular white or gray spots with a red border.'),
('Brown Blight', 'Starts as small, water-soaked spots that rapidly turn brown.'),
('Gray Light', 'A fungal disease that often affects young leaves, causing gray, powdery lesions.'),
('Healthy', 'No signs of disease or pest damage.'),
('Red Leaf Spot', 'Caused by deficiencies or stress, often showing distinct red circular markings.'),
('White Spot', 'Small, irregular white spots on the leaf surface.'),
('Other_Non_Tea_Leaf', 'Image does not contain a tea leaf for analysis.');
