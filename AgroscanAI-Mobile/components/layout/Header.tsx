import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { IconLeaf } from '../ui/Icons'; 

export default function Header() {
  const router = useRouter();

  return (
    <View style={styles.nav}>
      {/* Changed h and w to size */}
      <TouchableOpacity onPress={() => router.push('/')} style={styles.logoContainer}>
        <IconLeaf size={24} color="#f59e0b" />
        <Text style={styles.logoText}>AgroScan AI</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => router.push('/login')} 
        style={styles.loginBtn}
      >
        <Text style={styles.loginBtnText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    height: 80, // Slightly increased for better SafeArea spacing
    backgroundColor: '#065f46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20, // Helps with status bar overlap
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    zIndex: 1000, // Ensures it stays above the scroll view
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  loginBtn: { backgroundColor: '#059669', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  loginBtnText: { color: 'white', fontWeight: 'bold' }
});