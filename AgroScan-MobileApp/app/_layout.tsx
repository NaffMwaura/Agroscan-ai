import { Stack, useSegments, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { getToken } from '../app/.utils/token-storage';
//import { ActivityIndicator, View } from 'react-native';

const InitialLayout = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getToken();
        setIsAuth(!!token);
      } finally {
        setIsAuthReady(true);
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    // If the user is authenticated and trying to access the auth group,
    // redirect them to the main app.
    if (isAuth && inAuthGroup) {
      router.replace('/(main)');
    }
    // If the user is not authenticated and not in the auth group,
    // redirect them to the login screen.
    else if (!isAuth && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
    // Otherwise, do nothing. This allows users to navigate freely
    // between login and register screens within the auth group.
  }, [isAuth, isAuthReady, segments]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default InitialLayout;
