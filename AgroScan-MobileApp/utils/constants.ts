const LOCAL_IP = "172.16.76.2"; 
const PORT = 8000; // Your Backend port (as defined in server.ts)

// The BASE_API_URL used for all fetch requests
export const BASE_API_URL = `http://${LOCAL_IP}:${PORT}`;

// Object containing all specific API paths
export const API_ENDPOINTS = {
  // Authentication
  REGISTER: `${BASE_API_URL}/register`,
  LOGIN: `${BASE_API_URL}/login`,

  // Core App Functionality
  PREDICT: `https://agroscan-ai-backend.onrender.com/predict`,
  SAVE_SCAN: `${BASE_API_URL}/save_scan`,
  GET_SCANS: `${BASE_API_URL}/get_scans`,
  HEALTH: `${BASE_API_URL}/health`,
};

// --- General Constants ---
export const AUTH_TOKEN_KEY = "agro_token";