import { Link, Stack, router } from 'expo-router';
import React, { useState } from 'react';
// Import necessary components including Modal, ScrollView, and KeyboardAvoidingView
import { StyleSheet, Text, View, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import { saveToken } from '../.utils/token-storage';
import { API_ENDPOINTS } from '../../utils/constants'; // Use the shared constants file

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // State for password visibility toggle
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

  const handleLogin = async () => {
    if (!email || !password) {
      showModal('Please enter both email and password.', false);
      return;
    }

    setLoading(true);

    try {
      // FIX: Use the imported constant API_ENDPOINTS.LOGIN
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // --- FIX APPLIED HERE: Check for 'data.token' instead of 'data.access_token' ---
        if (data.token) {
          await saveToken(data.token); // Save the token provided by the FastAPI server
          showModal('Login successful!', true);
          
          // Allow user to see success message before routing
          setTimeout(() => {
            setModalVisible(false);
            // The navigation will now be handled automatically by _layout.tsx based on the token
            router.replace('/(main)'); 
          }, 1000);

        } else {
          showModal('Login failed: Token not received. Server response was missing the "token" field.', false);
        }
      } else {
        // Handle server-side errors
        showModal(data.detail || 'Failed to log in. Please check your credentials.', false);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Provide a more helpful error message in case of network failure
      showModal(`Network error. Ensure your server at ${API_ENDPOINTS.LOGIN} is accessible.`, false);
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX: Using KeyboardAvoidingView and ScrollView for better mobile layout handling
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to diagnose your crops.</Text>
          
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            {/* Password Input with Toggle */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  // Toggle secureTextEntry based on state
                  secureTextEntry={!isPasswordVisible} 
                  value={password}
                  onChangeText={setPassword}
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

            {/* Login Button */}
            <Pressable 
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </Pressable>
          </View>
          
          {/* Link to Register */}
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Don&apos;t have an account?</Text>
            <Link href="/(auth)/register" asChild>
              <Text style={styles.registerLink}>Sign up</Text>
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
  formContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
    marginBottom: 20,
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
  registerLink: {
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
