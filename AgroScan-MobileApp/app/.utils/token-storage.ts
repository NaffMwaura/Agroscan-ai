import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'authToken';

/**
 * Saves the authentication token to local storage.
 * @param token The token string to save.
 */
export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    console.log('Token saved successfully!');
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

/**
 * Retrieves the authentication token from local storage.
 * @returns The token string or null if not found.
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Removes the authentication token from local storage.
 */
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    console.log('Token removed successfully!');
  } catch (error) {
    console.error('Error removing token:', error);
  }
  
};
