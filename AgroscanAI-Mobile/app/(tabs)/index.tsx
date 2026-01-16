import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  IconShield, 
  IconZap, 
  IconStar, 
  IconUser, 
  IconLogOut, 
  IconChevronDown 
} from '../../components/ui/Icons';
import ChatWidget from '../../components/ui/ChatWidget';

const ReviewCard = ({ name, role, text, rating }: any) => (
  <View style={styles.reviewCard}>
    <View style={styles.starRow}>
      {[...Array(rating)].map((_, i) => <IconStar key={i} size={16} />)}
    </View>
    <Text style={styles.reviewText}>"{text}"</Text>
    <Text style={styles.reviewName}>{name}</Text>
    <Text style={styles.reviewRole}>{role}</Text>
  </View>
);

export default function OverviewScreen() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Replace with dynamic user context later
  const userEmail = "farmer@agroscan.ai"; 

  const handleLogout = () => {
    setShowMenu(false);
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: () => {
            router.replace('../' as any); 
          } 
        }
      ]
    );
  };

  return (
    <View style={[
        styles.container, 
        { 
          paddingTop: insets.top,
          backgroundColor: '#05080d' 
        }
    ]}>
      
      {/* --- Profile Header --- */}
      <View style={styles.profileHeader}>
        <Text style={styles.logoText}>AgroScan<Text style={styles.greenText}>AI</Text></Text>
        <TouchableOpacity 
            style={styles.profileBtn} 
            onPress={() => setShowMenu(!showMenu)}
            activeOpacity={0.7}
        >
          <View style={styles.avatar}><Text style={styles.avatarText}>{userEmail[0].toUpperCase()}</Text></View>
          <Text style={styles.userName} numberOfLines={1}>{userEmail.split('@')[0]}</Text>
          <IconChevronDown size={14} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* --- Dropdown Menu Overlay --- */}
      {showMenu && (
        <View style={[styles.dropdown, { top: 65 }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowMenu(false)}>
            <IconUser size={18} color="#10b981" />
            <Text style={styles.menuText}>My Profile</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleLogout}
          >
            <IconLogOut size={18} color="#ef4444" />
            <Text style={[styles.menuText, {color: '#ef4444'}]}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- Main Content --- */}
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={[
            styles.content,
            { paddingBottom: 200 } // Clears both the Tab Bar and the Chat Widget
        ]}
        scrollEnabled={!showMenu}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heroTitle}>
          Precision Farming{"\n"}
          <Text style={styles.gradientText}>Driven by AI.</Text>
        </Text>
        
        <Text style={styles.heroSub}>
          AgroScan AI uses advanced neural networks to detect tea leaf diseases with 98.2% accuracy.
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <IconShield size={32} />
            <Text style={styles.statNum}>98%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statBox}>
            <IconZap size={32} />
            <Text style={styles.statNum}>&lt;2s</Text>
            <Text style={styles.statLabel}>Analysis</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.scanBtn} 
          onPress={() => router.push('/(tabs)/two')}
        >
          <Text style={styles.scanBtnText}>Start Scanning Now</Text>
        </TouchableOpacity>

        <View style={styles.testimonialHeader}>
          <Text style={styles.sectionTitle}>Farmer Testimonials</Text>
          <Text style={styles.sectionSub}>Trusted by 500+ tea estates.</Text>
        </View>

        <ReviewCard 
          name="Samuel K." role="Estate Manager" 
          text="The accuracy in spotting Blight before it spreads has saved us thousands." 
          rating={5} 
        />
        <ReviewCard 
          name="Elena R." role="Small-scale Farmer" 
          text="AgroBot helped me identify exactly which fertilizer to use." 
          rating={5} 
        />
      </ScrollView>

      {/* Floating Chat Button */}
      <ChatWidget />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  profileHeader: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#0a0f1a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    zIndex: 10,
  },
  logoText: { color: 'white', fontSize: 18, fontWeight: '900' },
  greenText: { color: '#10b981' },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 4,
    paddingRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: { color: '#064e3b', fontWeight: 'bold', fontSize: 12 },
  userName: { color: 'white', fontSize: 12, fontWeight: '600', marginRight: 6, maxWidth: 80 },
  dropdown: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    width: 160,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  menuText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  menuDivider: { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 8 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: 'white', lineHeight: 40, marginTop: 20 },
  gradientText: { color: '#10b981' },
  heroSub: { color: '#9ca3af', fontSize: 16, marginTop: 15, lineHeight: 24 },
  statsGrid: { flexDirection: 'row', gap: 15, marginTop: 30 },
  statBox: { flex: 1, backgroundColor: '#0a0f1a', padding: 20, borderRadius: 25, alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  statNum: { color: 'white', fontSize: 24, fontWeight: '900', marginTop: 10 },
  statLabel: { color: '#10b981', fontSize: 12, fontWeight: '600' },
  scanBtn: { backgroundColor: '#10b981', padding: 18, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  scanBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  testimonialHeader: { marginTop: 40, marginBottom: 20 },
  sectionTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  sectionSub: { color: '#6b7280', fontSize: 14 },
  reviewCard: { backgroundColor: '#0a0f1a', padding: 20, borderRadius: 20, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#fbbf24' },
  starRow: { flexDirection: 'row', marginBottom: 10 },
  reviewText: { color: '#d1d5db', fontStyle: 'italic', fontSize: 14, lineHeight: 20 },
  reviewName: { color: 'white', fontWeight: 'bold', marginTop: 15, fontSize: 14 },
  reviewRole: { color: '#10b981', fontSize: 12 }
});