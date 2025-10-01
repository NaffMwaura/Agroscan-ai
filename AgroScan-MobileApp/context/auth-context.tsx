import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, saveToken, removeToken } from '../app/.utils/token-storage'; 

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

  // Initial Load: Check secure storage for an existing token
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          setToken(storedToken); // Token found, user is authenticated
        } else {
          setToken(false); // No token found, user is signed out
        }
      } catch (error) {
        console.error("Failed to load token:", error);
        setToken(false);
      } finally {
        setIsLoading(false);
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
    setToken(false);
  };

  const value = { token, isLoading, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
