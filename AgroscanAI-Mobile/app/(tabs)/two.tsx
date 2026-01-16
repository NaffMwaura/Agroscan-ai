import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  ActivityIndicator, 
  Alert,
  TextInput
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../api/config';
import { 
  IconCamera, 
  IconLeaf, 
  IconMicroscope, 
  IconImage, 
  IconTrash 
} from '../../components/ui/Icons';

export default function ScanHistoryScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [filteredScans, setFilteredScans] = useState<any[]>([]); // For Search
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [latestResult, setLatestResult] = useState<any>(null);
  const insets = useSafeAreaInsets();

  const userEmail = 'farmer@agroscan.ai';

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get_scans/${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.scans) {
        setScans(data.scans);
        setFilteredScans(data.scans);
      }
    } catch (e) { 
      console.error("History Fetch Error:", e); 
    }
  };

  useEffect(() => { 
    fetchHistory(); 
  }, []);

  // --- SEARCH LOGIC ---
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredScans(scans);
    } else {
      const filtered = scans.filter(item => 
        item.prediction.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.treatment_recommendation.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredScans(filtered);
    }
  }, [searchQuery, scans]);

  // --- DELETE SCAN LOGIC ---
  const deleteScan = (scanId: string) => {
    Alert.alert(
      "Delete Scan",
      "Are you sure you want to remove this scan from your history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/delete_scan/${scanId}`, {
                method: 'DELETE',
              });
              if (res.ok) {
                fetchHistory();
              } else {
                Alert.alert("Error", "Could not delete scan");
              }
            } catch (e) {
              Alert.alert("Error", "Network error");
            }
          } 
        }
      ]
    );
  };

  // --- CAMERA LOGIC ---
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Camera access is required for live scans.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadScan(result.assets[0].uri); 
    }
  };

  // --- GALLERY LOGIC ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Gallery access is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadScan(result.assets[0].uri);
    }
  };

  const uploadScan = async (uri: string) => {
    setLoading(true);
    setLatestResult(null); 
    const formData = new FormData();
    // @ts-ignore
    formData.append('file', { uri, name: 'leaf.jpg', type: 'image/jpeg' });
    formData.append('user_email', userEmail);

    try {
      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = await res.json();
      if (res.ok) {
        setLatestResult(data); 
        fetchHistory();
      }
    } catch (e) { 
      Alert.alert("Error", "Server connection failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={filteredScans}
        keyExtractor={(item) => item.scan_id.toString()}
        // Increase paddingBottom significantly to push content above the ChatWidget FAB
        contentContainerStyle={{ paddingBottom: 220 }} 
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <Text style={styles.title}>AI Analysis</Text>
            
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.cameraBtn]} onPress={takePhoto}>
                <IconCamera size={24} color="white" />
                <Text style={styles.actionBtnText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, styles.galleryBtn]} onPress={pickImage}>
                <IconImage size={24} color="white" />
                <Text style={styles.actionBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>

            {latestResult && (
              <View style={[styles.resultCard, latestResult.status === 'SUCCESS' ? styles.successBorder : styles.errorBorder]}>
                <Text style={styles.resultLabel}>LATEST DIAGNOSIS</Text>
                <Text style={styles.predTextMain}>{latestResult.prediction}</Text>
                <Text style={styles.confText}>Confidence: {(latestResult.confidence * 100).toFixed(1)}%</Text>
                <View style={styles.divider} />
                <Text style={styles.recTitle}>Recommendation:</Text>
                <Text style={styles.recTextMain}>{latestResult.recommendation}</Text>
              </View>
            )}

            {/* --- SEARCH BAR --- */}
            <View style={styles.searchWrapper}>
              <TextInput
                style={styles.searchBar}
                placeholder="Search by disease or recommendation..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <Text style={styles.historyTitle}>Recent Scans ({filteredScans.length})</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <View style={[styles.iconBox, { backgroundColor: item.prediction === 'Healthy' ? '#064e3b' : '#450a0a' }]}>
              <IconLeaf size={20} color={item.prediction === 'Healthy' ? '#10b981' : '#ef4444'} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.historyRow}>
                <Text style={styles.predText}>{item.prediction}</Text>
                <TouchableOpacity onPress={() => deleteScan(item.scan_id)}>
                  <IconTrash size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
              <Text style={styles.recText} numberOfLines={2}>{item.treatment_recommendation}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconMicroscope size={60} color="#1e293b" />
            <Text style={styles.emptyText}>No matching scans found.</Text>
          </View>
        }
      />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Analyzing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05080d' },
  headerArea: { padding: 20 },
  title: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 15, gap: 10 },
  cameraBtn: { backgroundColor: '#10b981' },
  galleryBtn: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  actionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  // Search Styles
  searchWrapper: { marginTop: 10, marginBottom: 5 },
  searchBar: {
    backgroundColor: '#0a0f1a',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: 'white',
    borderWidth: 1,
    borderColor: '#1e293b',
    fontSize: 14,
  },

  historyTitle: { color: '#9ca3af', marginTop: 25, fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 },
  historyCard: { backgroundColor: '#0a0f1a', marginHorizontal: 20, marginBottom: 12, padding: 16, borderRadius: 20, flexDirection: 'row', gap: 15, borderWidth: 1, borderColor: '#1e293b' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  iconBox: { padding: 12, borderRadius: 14, alignSelf: 'flex-start' },
  predText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  dateText: { color: '#6b7280', fontSize: 11, marginBottom: 4 },
  recText: { color: '#9ca3af', fontSize: 13, lineHeight: 18 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5, 8, 13, 0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  loadingText: { color: '#10b981', marginTop: 15, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#475569', marginTop: 15, fontSize: 14 },
  resultCard: { backgroundColor: '#0a1a1a', padding: 20, borderRadius: 24, marginTop: 10, marginBottom: 20, borderWidth: 1, borderColor: '#1e293b' },
  successBorder: { borderLeftWidth: 6, borderLeftColor: '#10b981' },
  errorBorder: { borderLeftWidth: 6, borderLeftColor: '#ef4444' },
  resultLabel: { color: '#10b981', fontSize: 10, fontWeight: '900', marginBottom: 8 },
  predTextMain: { color: 'white', fontSize: 26, fontWeight: '900' },
  confText: { color: '#9ca3af', fontSize: 14, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#1e293b', marginVertical: 18 },
  recTitle: { color: '#fbbf24', fontWeight: 'bold', fontSize: 14, marginBottom: 6 },
  recTextMain: { color: '#d1d5db', fontSize: 15, lineHeight: 22 },
});