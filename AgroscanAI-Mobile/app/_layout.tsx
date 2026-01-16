import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 1. Landing Page (The Entry Point) */}
        <Stack.Screen name="index" /> 

        {/* 2. Login Page */}
        <Stack.Screen name="login" />

        {/* 3. Dashboard Group (Tabs) - gestureEnabled: false prevents swiping back to login */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            gestureEnabled: false,
            animation: 'fade' // Smooth transition into the dashboard
          }} 
        />

        {/* 4. Modal for Information */}
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal', 
            headerShown: true, 
            title: 'Information' 
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}