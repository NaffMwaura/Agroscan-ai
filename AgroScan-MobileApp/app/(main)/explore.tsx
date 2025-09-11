import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { removeToken } from '../.utils/token-storage';

export default function ExploreScreen() {
  const handleLogout = async () => {
    // Remove the authentication token
    await removeToken();
    // Redirect the user back to the login screen.
    // The _layout.tsx will handle the navigation based on the token status.
    router.replace('/(auth)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Learn More</Text>
        <Text style={styles.subText}>This screen will contain more information about the app, crop diseases, and best practices for farmers.</Text>
        <Pressable 
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} 
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Log Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 9999,
    backgroundColor: '#EF4444', // Red color for logout
    alignItems: 'center',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginTop: 20,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
