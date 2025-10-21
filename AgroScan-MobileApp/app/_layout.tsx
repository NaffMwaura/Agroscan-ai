import { Stack, Redirect, SplashScreen } from 'expo-router';
// Ensure the path to your context file is correct: (app) -> context
import { AuthProvider, useAuth } from '../context/auth-context'; 
import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Prevents the splash screen from auto-hiding while we check for the stored token
SplashScreen.preventAutoHideAsync();

/**
 * This component is the main router logic, redirecting based on authentication state.
 */
function RootLayoutContent() {
  // Get the global authentication state
  const { token, isLoading } = useAuth();
  
  // Hide the splash screen only once the token status is determined
  useEffect(() => {
    if (!isLoading) {
      // FIX: Use .catch() to suppress potential rejection errors if already hidden
      SplashScreen.hideAsync().catch(e => console.error("Failed to hide splash screen:", e));
    }
  }, [isLoading]);

  // Show a loading indicator while we check secure storage for a token
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  // FIX: Conditionally render the correct navigation group based on the token status.
  // This prevents the infinite remount/redirect loop.
  return (
    <Stack>
      {/*
        If authenticated (token is string), show the main app group.
        If unauthenticated (token is false), show the auth group.
      */}
      {token ? (
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}

/**
 * The Root Layout wraps the entire app in the AuthProvider.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  }
});