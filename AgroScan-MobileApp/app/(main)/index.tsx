import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Image, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { UploadCloud} from 'lucide-react-native';

const API_URL = "https://agroscan-ai-backend.onrender.com/predict";

export default function TabOneScreen() {
  const [file, setFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // Request for camera roll permissions
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      setFile(selectedAsset);
      setImagePreview(selectedAsset.uri);
      setAnalysisResult(null);
    }
  };
  
  const analyzeImage = async () => {
    if (!file) {
      alert("Please select an image to analyze.");
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      const payload = {
        image_data: file.base64,
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      const prediction = result?.prediction;

      if (prediction) {
        setAnalysisResult(prediction);
      } else {
        setAnalysisResult("Could not analyze the image. The response from the server was unexpected.");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      setAnalysisResult("An error occurred during analysis. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>AgroScan AI</Text>
        <View style={styles.imagePickerContainer}>
          {imagePreview ? (
            <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
          ) : (
            <View style={styles.placeholder}>
              <UploadCloud size={48} color="#22C55E" />
              <Text style={styles.placeholderText}>Tap to upload an image of a crop.</Text>
            </View>
          )}
          <Pressable style={styles.overlay} onPress={pickImage} />
        </View>

        <Pressable
          onPress={analyzeImage}
          style={({ pressed }) => [
            styles.button,
            (!!file && !loading) && { opacity: 0.8 },
            (!file || loading) && styles.buttonDisabled
          ]}
          disabled={!file || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Analyze Crop</Text>
          )}
        </Pressable>

        {analysisResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Analysis Result</Text>
            <Text style={styles.resultText}>{analysisResult}</Text>
          </View>
        )}
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  imagePickerContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 9999,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#86EFAC',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
});
