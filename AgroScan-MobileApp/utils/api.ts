import { Alert } from 'react-native';

// FIX: Using the CORRECT IP address (172.16.75.94) where the Uvicorn server is listening.
export const API_BASE_URL = 'http://172.16.75.94:8000'; 

/**
 * Handles general API calls for login and registration.
 * @param endpoint The API endpoint (e.g., '/login' or '/register').
 * @param data The user credentials (email, password, etc.).
 * @returns The JSON response from the server if successful, or null on failure.
 */
export const makeAuthRequest = async (endpoint: '/login' | '/register', data: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // FIX: Robust JSON parsing to handle non-JSON responses (like Python server crashes)
    let result;
    try {
        result = await response.json();
    } catch (e) {
        const rawText = await response.text();
        // If the server crashed, display a general server error.
        Alert.alert("Server Error", `The server returned an unhandled error. Please check the backend console for details. Raw Response: ${rawText.substring(0, 100)}...`);
        console.error(`Failed to parse JSON for ${endpoint}:`, rawText);
        return null; // Stop execution here
    }

    if (!response.ok) {
      // Handle server-side validation errors (e.g., "Invalid credentials")
      // Check for 'detail' which is common in FastAPI validation errors
      const errorMessage = (result.detail && Array.isArray(result.detail) 
        ? result.detail.map((d: any) => d.msg).join('\n') 
        : result.detail) || `Server error: ${response.status} ${response.statusText}`;
      
      Alert.alert("Authentication Failed", errorMessage);
      return null;
    }

    // Success response
    return result;

  } catch (error) {
    console.error(`Network Error during ${endpoint} request:`, error);
    // Handle network failures (server not running, wrong IP)
    Alert.alert("Network Error", "Could not connect to the server. Please check your URL and connection.");
    return null;
  }
};
