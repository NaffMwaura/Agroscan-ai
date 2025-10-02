import { Link, router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
// Import Feather for the eye icon
import { Feather } from '@expo/vector-icons'; 
import { saveToken } from '../.utils/token-storage'; // Assuming this utility exists
import { API_ENDPOINTS } from '../../utils/constants'; // Imports the API URL from constants.ts

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // State for password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); 
  
  // Custom Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Utility to show the custom alert modal.
   */
  const showModal = (message: string, success: boolean) => {
    setModalMessage(message);
    setIsSuccess(success);
    setModalVisible(true);
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      showModal('All fields are required.', false);
      return;
    }

    setLoading(true);

    try {
      // Use the imported constant API_ENDPOINTS.REGISTER
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include all required fields in the payload
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // If the backend returns a token, save it
        if (data.token) {
          // This is generally done on login, but if the backend returns it, save it
          await saveToken(data.token); 
        }
        
        showModal('Registration successful! You can now log in.', true);
        
        // Wait for modal to close before navigating to login
        setTimeout(() => {
          setModalVisible(false);
          router.replace('/(auth)/login');
        }, 1500);

      } else {
        // Handle server-side errors (like email already registered)
        showModal(data.detail || 'Registration failed. Please try again.', false);
      }
    } catch (e: any) {
      console.error("Registration error:", e);
      // Provide a helpful error message in case of network failure
      showModal(`Network error. Ensure your server at ${API_ENDPOINTS.REGISTER} is accessible.`, false);
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX: Using KeyboardAvoidingView to push content up when the keyboard is active.
    <KeyboardAvoidingView
      style={styles.flexContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" 
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Start diagnosing your crops today.</Text>

          {/* Username Input Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                // Toggle secureTextEntry based on state
                secureTextEntry={!isPasswordVisible} 
                autoCapitalize="none"
                editable={!loading}
              />
              <Pressable 
                style={styles.toggleButton}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                disabled={loading}
              >
                {/* Using Feather icons for the toggle */}
                <Feather 
                  name={isPasswordVisible ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#6b7280" 
                />
              </Pressable>
            </View>
          </View>

          {/* Register Button */}
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </Pressable>

          {/* Link to Login */}
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <Text style={styles.loginLink}>Log In</Text>
            </Link>
          </View>
        </View>
      </ScrollView>

      {/* Custom Modal for Alerts */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={[styles.modalText, isSuccess ? styles.modalSuccess : styles.modalError]}>{modalMessage}</Text>
            <Pressable
              style={[styles.modalButton, { backgroundColor: isSuccess ? '#22C55E' : '#EF4444' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 50,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 30,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1f2937',
    width: '100%',
  },
  // START: Password input styles
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    height: 50, 
    borderWidth: 0, 
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#1f2937',
  },
  toggleButton: {
    padding: 15,
  },
  // END: Password input styles
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#98dfb3',
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  linkText: {
    color: '#4b5563',
  },
  loginLink: {
    color: '#16a34a',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  // START: Custom Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSuccess: {
    color: '#22C55E',
  },
  modalError: {
    color: '#EF4444',
  },
  modalButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
    minWidth: 100,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  }
  // END: Custom Modal Styles
});
