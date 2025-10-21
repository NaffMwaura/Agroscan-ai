import React, { createContext, useContext, useEffect, useState } from 'react';
// Corrected import path for the utility folder (no leading dot, and up one level)
import { getToken, saveToken, removeToken } from '../app/.utils/token-storage'; 


// Flag to prevent re-initializing the token check on hot reloads in development
let tokenInitializationDone = false;

// Define the type for the authentication context state and functions
interface AuthContextType {
  // null = loading/checking state, string = authenticated token, false = signed out
  token: string | null | false; 
  isLoading: boolean;
  signIn: (newToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to consume the AuthContext. Use this in any component to get auth status.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * The provider component that wraps the entire application.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null | false>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mount/Unmount logging for debugging the loop
  useEffect(() => {
    console.log('AuthProvider mounted');
    return () => {
      console.log('AuthProvider unmounted');
    };
  }, []);
  
  // Initial Load: Check secure storage for an existing token
  useEffect(() => {
    const loadToken = async () => {
      // If another instance already initialized the token, skip re-initialization.
      if (tokenInitializationDone) {
        console.log('Auth: token initialization already done — skipping');
        // Ensure consumers know loading finished
        setIsLoading(false);
        return;
      }

      try {
        const storedToken = await getToken();
        if (storedToken) {
          setToken(storedToken); // Token found, user is authenticated
          console.log('Auth: token found');
        } else {
          setToken(false); // No token found, user is signed out
          console.log('Auth: no token');
        }
      } catch (error) {
        console.error("Failed to load token:", error);
        setToken(false);
      } finally {
        setIsLoading(false);
        console.log('Auth: isLoading -> false');
        // This flag prevents repeated checks in development mode, helping to stop the flicker loop.
        tokenInitializationDone = true; 
      }
    };
    loadToken();
  }, []);

  // Function called on successful API login
  const signIn = async (newToken: string) => {
    await saveToken(newToken);
    setToken(newToken);
  };

  // Function called on logout
  const signOut = async () => {
    await removeToken();
    // Setting token to false triggers the Expo Router redirect to the (auth) group
    setToken(false); 
  };

  const value = { token, isLoading, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
