// --- Networking Configuration ---

// FIX: Updated to the correct IPv4 address of your host machine running the backend server
const LOCAL_IP = "172.16.76.164"; 
const PORT = 8000; // Your Backend port (as defined in server.ts)

// The BASE_API_URL used for all fetch requests
export const BASE_API_URL = `http://${LOCAL_IP}:${PORT}`;

// Object containing all specific API paths
export const API_ENDPOINTS = {
  REGISTER: `${BASE_API_URL}/register`,
  LOGIN: `${BASE_API_URL}/login`,
  PREDICT: `${BASE_API_URL}/predict`,
  HEALTH: `${BASE_API_URL}/health`,
  // PROFILE: `${BASE_API_URL}/profile`,
};

// --- General Constants ---
export const AUTH_TOKEN_KEY = "agro_token";
