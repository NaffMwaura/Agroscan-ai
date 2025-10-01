const LOCAL_IP = "172.16.79.45"; 
const PORT = 8000; //My Backend port
export const BASE_API_URL = `http://${LOCAL_IP}:${PORT}`;

export const API_ENDPOINTS = {
    REGISTER: `${BASE_API_URL}/register`,
    LOGIN: `${BASE_API_URL}/login`,
    PREDICT: `${BASE_API_URL}/predict`,
    HEALTH: `${BASE_API_URL}/health`,
};