import { Link, Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ActivityIndicator, Modal } from 'react-native';
// FIX: Import the correct API endpoint URL from the constants file
import { API_ENDPOINTS } from '../../utils/constants';
// Import Feather for the eye icon
import { Feather } from '@expo/vector-icons'; 

// NOTE: Removed the hardcoded API_URL constant here.

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Added state for password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); 
  // FIX: Added state for username, which is required by your FastAPI server
  const [username, setUsername] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const showModal = (message: string, success: boolean) => {
    setModalMessage(message);
    setIsSuccess(success);
    setModalVisible(true);
  };

  const handleRegister = async () => {
    // FIX: Check for username, email, and password
    if (!username || !email || !password) {
      showModal('Please enter your username, email, and password.', false);
      return;
    }

    setLoading(true);

    try {
      // FIX: Use the imported constant API_ENDPOINTS.REGISTER
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // FIX: Include username in the payload
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (response.ok) {
        showModal('Registration successful! You can now log in.', true);
        // Wait for modal to close before navigating to login
        setTimeout(() => {
          setModalVisible(false);
          router.push('/(auth)/login');
        }, 1500);
      } else {
        // Handle server-side errors (like email already registered)
        showModal(data.detail || 'Registration failed. Please try again.', false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Provide a more helpful error message in case of network failure
      showModal(`Network error. Ensure your server at ${API_ENDPOINTS.REGISTER} is accessible.`, false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Required for using the Feather icons */}
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Create Account</Text>
      <View style={styles.formContainer}>
         {/* ADDED Username Input Field */}
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Choose a username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        {/* End ADDED */}
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
            <TextInput
            style={styles.passwordInput}
            placeholder="Create a password"
            // Toggle secureTextEntry based on state
            secureTextEntry={!isPasswordVisible} 
            value={password}
            onChangeText={setPassword}
            />
            {/* Toggle button (the eye icon) */}
            <Pressable
                style={styles.toggleButton}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
                <Feather 
                    name={isPasswordVisible ? 'eye-off' : 'eye'} 
                    size={20} 
                    color="#6b7280" 
                />
            </Pressable>
        </View>

        <Pressable 
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }, loading && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </Pressable>
      </View>
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Already have an account?</Text>
        <Link href="/(auth)/login" style={styles.link}>Log in</Link>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  // NEW STYLES FOR PASSWORD TOGGLE
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
  },
  toggleButton: {
    padding: 15,
  },
  // END NEW STYLES
  button: {
    padding: 15,
    borderRadius: 9999,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A9E3C6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#4b5563',
    fontSize: 16,
  },
  link: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
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
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  }
});
