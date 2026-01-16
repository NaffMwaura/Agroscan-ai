import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react-native'; //
import { API_BASE_URL } from '../api/config';
import { IconLeaf } from '../components/ui/Icons';
import InputField from '../components/ui/InputField';

export default function AuthPage() {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // New State for Password Visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    setError(null);
    if (view === 'register' && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = view === 'register' ? '/register' : '/login';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (view === 'login') {
          router.replace('/(tabs)' ); 
        } else {
          setView('login');
          setError("Registration successful! Please sign in.");
        }
      } else {
        setError(data.detail || "Authentication failed.");
      }
    } catch (err) {
      setError("Connection error. Check if phone and laptop are on the same WiFi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={16} color="#6b7280" />
              <Text style={styles.backBtnText}>RETURN</Text>
            </TouchableOpacity>

            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <IconLeaf size={32} color="#fbbf24" />
                </View>
                <Text style={styles.title}>{view === 'register' ? 'Create Account' : 'Welcome Back'}</Text>
              </View>

              {error && (
                <View style={[styles.alert, { backgroundColor: error.includes('successful') ? '#064e3b' : '#450a0a' }]}>
                  <Text style={styles.alertText}>{error}</Text>
                </View>
              )}

              <View style={styles.form}>
                <InputField 
                  label="Email" icon={Mail} placeholder="farmer@agroscan.ai"
                  value={email} onChangeText={setEmail} keyboardType="email-address"
                />
                
                {/* Updated Password Field with Eye Icon */}
                <InputField 
                  label="Password" 
                  icon={Lock} 
                  placeholder="••••••••"
                  value={password} 
                  onChangeText={setPassword} 
                  secureTextEntry={!isPasswordVisible}
                  rightIcon={
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                      {isPasswordVisible ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                    </TouchableOpacity>
                  }
                />

                {view === 'register' && (
                  <InputField 
                    label="Confirm" 
                    icon={Lock} 
                    placeholder="••••••••"
                    value={confirmPassword} 
                    onChangeText={setConfirmPassword} 
                    secureTextEntry={!isPasswordVisible}
                  />
                )}

                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={handleAction} 
                  disabled={isLoading}
                >
                  {isLoading ? <ActivityIndicator color="black" /> : <Text style={styles.actionBtnText}>{view === 'register' ? 'Register' : 'Sign In'}</Text>}
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => setView(view === 'login' ? 'register' : 'login')} style={styles.switchContainer}>
                <Text style={styles.switchText}>
                  {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <Text style={styles.switchHighlight}>{view === 'login' ? 'Join Now' : 'Sign In'}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#05080d' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, gap: 8 },
  backBtnText: { color: '#6b7280', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  glassCard: { backgroundColor: 'rgba(10, 15, 26, 0.8)', borderRadius: 32, padding: 32, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.1)' },
  cardHeader: { alignItems: 'center', marginBottom: 32 },
  iconContainer: { backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: 16, borderRadius: 20, marginBottom: 16 },
  title: { color: 'white', fontSize: 28, fontWeight: 'bold', letterSpacing: -0.5 },
  alert: { padding: 12, borderRadius: 12, marginBottom: 20 },
  alertText: { color: 'white', fontSize: 13, textAlign: 'center' },
  form: { gap: 8 },
  actionBtn: { backgroundColor: '#fbbf24', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  actionBtnText: { color: 'black', fontWeight: 'bold', fontSize: 18 },
  switchContainer: { marginTop: 32, alignItems: 'center' },
  switchText: { color: '#6b7280', fontSize: 14 },
  switchHighlight: { color: '#fbbf24', fontWeight: 'bold', textDecorationLine: 'underline' }
});