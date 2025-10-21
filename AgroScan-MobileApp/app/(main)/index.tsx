import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, UploadCloud, Activity, Zap, ClipboardList, Info, Loader2 } from 'lucide-react-native';
import { API_ENDPOINTS } from '../../utils/constants'; 
import { getEmailFromToken } from '../../utils/auth-helpers'; // New helper for user ID

// --- IMPORTANT: Expo-Image-Picker Simulation ---
// In a real Expo project, you would use:
// import * as ImagePicker from 'expo-image-picker';
// And you would handle permissions here.
const MOCK_IMAGE_PICKER = {
    // Simulates taking a photo with the live camera
    launchCameraAsync: async () => {
        Alert.alert("Camera Simulation", "The camera feature is enabled, but in this isolated environment, we'll simulate a successful photo. In a real app, you would need to install 'expo-image-picker' and handle permissions.");
        // Simulate a real image URI for preview purposes
        return {
            cancelled: false,
            assets: [{ uri: 'https://placehold.co/224x224/90ee90/000000?text=Sample+Leaf', base64: 'MOCK_BASE64_DATA', mimeType: 'image/jpeg' }]
        };
    },
    // Simulates selecting from the photo library
    launchImageLibraryAsync: async () => {
        Alert.alert("Gallery Simulation", "The gallery upload feature is enabled, but in this isolated environment, we'll simulate a successful upload.");
        // Simulate a real image URI for preview purposes
        return {
            cancelled: false,
            assets: [{ uri: 'https://placehold.co/224x224/90ee90/000000?text=Sample+Leaf', base64: 'MOCK_BASE64_DATA', mimeType: 'image/jpeg' }]
        };
    }
};
// --- END Image Picker Simulation ---

// --- Types ---
interface ScanResult {
  id: string;
  date: string; // ISO Date String
  imageUri: string;
  prediction: string;
  confidence: number;
  suggestions: string;
  pesticide: string;
}

interface QuickStats {
  scansToday: number;
  infected: number;
  healthy: number;
}


export default function DashboardScreen() {
  const [loading, setLoading] = useState(false);
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<any>(null);
  const [currentScanResult, setCurrentScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats>({ scansToday: 0, infected: 0, healthy: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  // --- Data Fetching ---
  const fetchRecentScans = useCallback(async () => {
    const userEmail = await getEmailFromToken();
    if (!userEmail) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.GET_SCANS}?email=${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        // Reverse to show most recent first, limit to 5
        const scans = data.scans || [];
        setRecentScans(scans.reverse().slice(0, 5)); 
        updateQuickStats(scans);
      }
    } catch (error) {
      console.error("Error fetching recent scans:", error);
    }
  }, []);
  
  // --- Quick Stats Calculation ---
  const updateQuickStats = (scans: ScanResult[]) => {
    const today = new Date().toISOString().split('T')[0];
    const scansToday = scans.filter(s => s.date.startsWith(today)).length;
    
    // Check for common infected keywords
    const infected = scans.filter(s => !s.prediction.toLowerCase().includes('healthy') && !s.prediction.toLowerCase().includes('n/a')).length;
    const healthy = scans.filter(s => s.prediction.toLowerCase().includes('healthy')).length;

    setQuickStats({
      scansToday: scansToday,
      infected: infected,
      healthy: healthy,
    });
  };

  useEffect(() => {
    fetchRecentScans();
  }, [fetchRecentScans]);


  // --- Image Handling (Camera/Gallery) ---

  const selectImage = async (useCamera: boolean) => {
    let result;
    
    // Using the simulated picker for this environment
    if (useCamera) {
      result = await MOCK_IMAGE_PICKER.launchCameraAsync();
    } else {
      result = await MOCK_IMAGE_PICKER.launchImageLibraryAsync();
    }

    if (result && !result.cancelled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      setImagePreviewUri(selectedAsset.uri);
      
      // In a real React Native app, this object would contain the necessary file info (uri, type, name)
      // to upload via FormData. We'll use a mock for the upload step.
      setFileToUpload({ uri: selectedAsset.uri, name: 'photo.jpg', type: 'image/jpeg' });
      setCurrentScanResult(null); // Clear previous result
    }
  };

  // --- API Interaction ---

  const saveScanResult = async (scan: ScanResult) => {
    const userEmail = await getEmailFromToken();
    if (!userEmail) {
      Alert.alert("Error", "User not identified. Cannot save scan.");
      return;
    }
    
    try {
      const response = await fetch(API_ENDPOINTS.SAVE_SCAN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, scan: scan }),
      });

      if (response.ok) {
        // Fetch the updated list
        fetchRecentScans(); 
      } else {
        console.error("Failed to save scan:", await response.text());
      }
    } catch (e) {
      console.error("Save scan network error:", e);
    }
  };


  const analyzeImage = async () => {
    if (!fileToUpload) {
      Alert.alert("Error", "Please select an image first using Take Photo or Gallery.");
      return;
    }
    
    setLoading(true);
    setIsAnimating(true);
    setCurrentScanResult(null);

    try {
      // --- SIMULATION of Prediction Result ---
      // We are simulating the network call and result due to environment constraints.
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      const mockBackendPrediction = {
        prediction: Math.random() < 0.7 ? 'Brown Blight' : 'Healthy',
        confidence: parseFloat((Math.random() * 0.2 + 0.78).toFixed(2)), // 78% to 98%
        suggestions: "Simulated: Prune infected parts and apply organic neem oil. Consult local experts.",
        pesticide: 'Recommended: Systemic Fungicides (e.g., Prochloraz)',
      };
      
      if (mockBackendPrediction.prediction === 'Healthy') {
        mockBackendPrediction.suggestions = "Your tea plant appears healthy! Continue good agricultural practices.";
        mockBackendPrediction.pesticide = "N/A";
      }
      
      // --- END SIMULATION ---
      
      const newScan: ScanResult = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        imageUri: imagePreviewUri!,
        prediction: mockBackendPrediction.prediction,
        confidence: mockBackendPrediction.confidence * 100,
        suggestions: mockBackendPrediction.suggestions,
        pesticide: mockBackendPrediction.pesticide,
      };
      
      setCurrentScanResult(newScan);
      
      // Save the scan result to the backend history
      saveScanResult(newScan);

    } catch (e) {
      Alert.alert("Error", "Failed to get prediction from server.");
      console.error(e);
    } finally {
      setLoading(false);
      setTimeout(() => setIsAnimating(false), 500); // Stop animation slightly later
    }
  };
  
  // --- UI Components ---
  const QuickStatsCard = ({ title, value, color, icon: Icon }: { title: string, value: number, color: string, icon: any }) => (
    <View style={[styles.statCard, { backgroundColor: `${color}15` }]}>
      <Icon size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
  
  const getPredictionStyles = (prediction: string | null) => {
    if (!prediction) return { color: '#6b7280', ringColor: '#9ca3af' };
    const lowerPrediction = prediction.toLowerCase();
    
    if (lowerPrediction.includes('healthy')) {
      return { color: '#22c55e', ringColor: '#86efac' }; // Green
    }
    return { color: '#ef4444', ringColor: '#fca5a5' }; // Red
  };
  
  const { color: resultColor, ringColor: resultRingColor } = getPredictionStyles(currentScanResult?.prediction || null);
  
  const ResultCard = () => {
    if (!currentScanResult) return null;

    const confidenceText = `${currentScanResult.confidence.toFixed(1)}%`;

    return (
      <View style={[styles.resultCard, { borderColor: resultRingColor }]}>
        <View style={styles.resultHeader}>
          <Text style={[styles.resultTitle, { color: resultColor }]}>
            {currentScanResult.prediction}
          </Text>
          <Text style={[styles.resultConfidence, { color: resultColor }]}>
            Confidence: {confidenceText}
          </Text>
        </View>
        
        <View style={styles.resultDetail}>
          <Info size={20} color={resultColor} style={{ marginRight: 8 }} />
          <Text style={styles.resultDetailText}>
            <Text style={styles.resultDetailLabel}>Recommended Treatment:</Text> {currentScanResult.pesticide}
          </Text>
        </View>
        
        <View style={styles.resultDetail}>
          <ClipboardList size={20} color={resultColor} style={{ marginRight: 8 }} />
          <Text style={styles.resultDetailText}>
            <Text style={styles.resultDetailLabel}>Prevention Tip:</Text> {currentScanResult.suggestions}
          </Text>
        </View>
        
        <Pressable 
          style={styles.learnMoreButton}
          onPress={() => Alert.alert("Learn More", "This would navigate you to a detailed treatment guide for the identified disease in the 'Explore' tab.")}
        >
          <Text style={styles.learnMoreText}>View Treatment Guide</Text>
        </Pressable>
      </View>
    );
  };
  
  const ScanAnimation = () => (
    <View style={styles.animationContainer}>
      {/* AI Pulse Animation: uses the pulse style for visual effect */}
      <Loader2 size={64} color="#16a34a" style={[styles.spinner, isAnimating && styles.pulse]} />
      <Text style={styles.animationText}>AI Scanning...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.welcomeText}>Welcome back, Farmer!</Text>
        
        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <QuickStatsCard title="Scans Today" value={quickStats.scansToday} color="#16a34a" icon={Activity} />
          <QuickStatsCard title="Infected" value={quickStats.infected} color="#ef4444" icon={Zap} />
          <QuickStatsCard title="Healthy" value={quickStats.healthy} color="#22c55e" icon={Info} />
        </View>
        
        {/* Image Input/Preview Section */}
        <View style={styles.scanSection}>
          <Text style={styles.sectionTitle}>Diagnose New Leaf</Text>
          
          <View style={[styles.imageUploadBox, imagePreviewUri && styles.imageUploadBoxPadded]}>
            {imagePreviewUri ? (
              <Image source={{ uri: imagePreviewUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.placeholderContainer}>
                <UploadCloud size={48} color="#4ade80" />
                <Text style={styles.placeholderText}>Tap below to scan a leaf</Text>
              </View>
            )}
            
            {loading && <ScanAnimation />}
            
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtonRow}>
            {/* Take Photo - Live Camera Access */}
            <Pressable 
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
              onPress={() => selectImage(true)}
              disabled={loading}
            >
              <Camera size={24} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </Pressable>
            
            {/* Gallery Upload */}
            <Pressable 
              style={({ pressed }) => [styles.actionButton, styles.secondaryButton, pressed && styles.actionButtonPressed]}
              onPress={() => selectImage(false)}
              disabled={loading}
            >
              <UploadCloud size={24} color="#1f2937" style={{ marginRight: 8 }} />
              <Text style={[styles.actionButtonText, { color: '#1f2937' }]}>Gallery</Text>
            </Pressable>
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.analyzeButton, 
              pressed && styles.buttonPressed, 
              (!fileToUpload || loading) && styles.buttonDisabled
            ]}
            onPress={analyzeImage}
            disabled={!fileToUpload || loading}
          >
            <Text style={styles.analyzeButtonText}>
              {loading ? 'Analyzing...' : 'Run Analysis'}
            </Text>
          </Pressable>
        </View>
        
        {/* Prediction Result Section */}
        <ResultCard />

        {/* Recent Scans Section */}
        <View style={styles.recentScansSection}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {recentScans.length > 0 ? (
            recentScans.map((scan) => (
              <View key={scan.id} style={styles.scanItem}>
                {/* Use the local image URI for the thumbnail */}
                <Image source={{ uri: scan.imageUri }} style={styles.scanThumbnail} />
                <View style={styles.scanDetails}>
                  <Text style={styles.scanDate}>{new Date(scan.date).toLocaleDateString()}</Text>
                  <Text style={[styles.scanPrediction, { color: getPredictionStyles(scan.prediction).color, fontWeight: 'bold' }]}>
                    {scan.prediction}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent scans found. Start diagnosing!</Text>
          )}
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    marginTop: 10,
  },
  // --- Stats Styles ---
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 5,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  // --- Scan Section Styles ---
  scanSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  imageUploadBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0fff4',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#34d399',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  imageUploadBoxPadded: {
    padding: 0, // No padding when image is present
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#34d399',
    fontWeight: '600',
  },
  // Animation Styles
  animationContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    // Basic spinner style - used for rotation
    transform: [{ rotate: '45deg' }], 
  },
  pulse: {
    // In a real RN app, we'd use Animated API for a better pulse, 
    // but here we rotate to simulate activity.
  },
  animationText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  // Action Button Styles
  actionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    marginHorizontal: 5,
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyzeButton: {
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
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#98dfb3',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  // --- Result Card Styles ---
  resultCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  resultConfidence: {
    fontSize: 18,
    fontWeight: '600',
  },
  resultDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  resultDetailLabel: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  resultDetailText: {
    flexShrink: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  learnMoreButton: {
    marginTop: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  learnMoreText: {
    color: '#16a34a',
    fontWeight: 'bold',
    fontSize: 15,
  },
  // --- Recent Scans Styles ---
  recentScansSection: {
    paddingVertical: 10,
  },
  scanItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#34d399',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scanThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#e5e7eb',
  },
  scanDetails: {
    flex: 1,
  },
  scanDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  scanPrediction: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 10,
  }
});
