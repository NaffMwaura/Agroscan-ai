import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native'; // Standard imports

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AgroscanAI Info</Text>
      
      {/* Replaced Themed View with a standard View */}
      <View style={styles.separator} />

      <Text style={styles.description}>
        This is a modal for additional information. 
        You can use this for "About Us" or "Settings" later.
      </Text>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#064e3b', // Matching your Landing Page theme
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  description: {
    color: '#d1d5db',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: 'rgba(255,255,255,0.2)', // Static color instead of theme props
  },
});