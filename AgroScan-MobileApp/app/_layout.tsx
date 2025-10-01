import { Stack, Redirect, SplashScreen } from 'expo-router';
import { AuthProvider, useAuth } from '../context/auth-context'; 
import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

SplashScreen.preventAutoHideAsync();

/**
 * This component is the main router logic, redirecting based on authentication state.
 */
function RootLayoutContent() {
  // Get the global authentication state
  const { token, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }


  if (token) {
    return <Redirect href="/(main)" />;
  }

  // If the user is NOT authenticated (token is false):
  // We let them proceed to the default group, which is /(auth).
  // Expo Router will automatically display /(auth)/index.tsx (your Landing Page).
  return (
    <Stack>
      {/* (auth) group: Contains Landing Page, Login, Register */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      {/* (main) group: Protected content, only accessible via redirect above or deep link */}
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
    </Stack>
  );
}


  //The Root Layout wraps the entire app in the AuthProvider.
 
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
