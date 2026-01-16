import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconCheckCircleInternal } from '../components/ui/Icons';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ChatWidget from '../components/ui/ChatWidget';

export default function LandingPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container, 
      { paddingTop: insets.top, paddingBottom: insets.bottom }
    ]}>
      {/* Persistent Mobile Header */}
      <Header />

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 100 } // Ensures content clears the Chat FAB
        ]}
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- Hero Section --- */}
        <View style={styles.heroSection}>
          <Text style={styles.title}>
            Do you need prediction{"\n"}
            <Text style={styles.cyanText}>for your crop?</Text>
          </Text>
          
          <Text style={styles.subtitle}>
            Your personal agronomist at your fingertips. We provide actionable 
            solutions through AI-driven insights for tea farmers.
          </Text>

          <TouchableOpacity 
            style={styles.primaryBtn} 
            activeOpacity={0.8}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.btnText}>Start Diagnosis Today</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>Explore How It Works →</Text>
          </TouchableOpacity>

          {/* Integrated Icons into Trust Badges */}
          <View style={styles.trustBadgeRow}>
            <View style={styles.badgeItem}>
              <IconCheckCircleInternal size={14} color="#4ade80" />
              <Text style={styles.badgeText}> Works Offline</Text>
            </View>
            <View style={styles.badgeItem}>
              <IconCheckCircleInternal size={14} color="#4ade80" />
              <Text style={styles.badgeText}> 92% Accuracy</Text>
            </View>
            <View style={styles.badgeItem}>
              <IconCheckCircleInternal size={14} color="#4ade80" />
              <Text style={styles.badgeText}> M-Pesa Ready</Text>
            </View>
          </View>
        </View>

        {/* --- How It Works Section --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnose in 3 Steps</Text>
          
          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepHeading}>Upload & Scan</Text>
              <Text style={styles.stepText}>Securely upload a photo of the tea leaf for analysis.</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepHeading}>Instant Diagnosis</Text>
              <Text style={styles.stepText}>Identify the exact disease and risk confidence in seconds.</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepHeading}>Action Plan</Text>
              <Text style={styles.stepText}>Receive tailored advice on treatment and prevention.</Text>
            </View>
          </View>
        </View>

        {/* --- Features Section --- */}
        <View style={styles.featureSection}>
          <Text style={styles.sectionTitle}>Core Features</Text>
          <View style={styles.featureGrid}>
             <View style={styles.featureItem}>
                <Text style={styles.featureTitle}>Real-time Tracking</Text>
                <Text style={styles.featureDesc}>Identify illnesses like Red Leaf Spot instantly.</Text>
             </View>
             <View style={styles.featureItem}>
                <Text style={styles.featureTitle}>Confidence Scoring</Text>
                <Text style={styles.featureDesc}>Assess risk before applying expensive treatments.</Text>
             </View>
          </View>
        </View>

        {/* Mobile Footer */}
        <Footer />
      </ScrollView>

      {/* Floating Chat Button */}
      <ChatWidget />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#064e3b' 
  },
  scrollContainer: { 
    paddingTop: 10 
  },
  
  // Hero Section
  heroSection: {
    padding: 24,
    paddingTop: 30,
    minHeight: 520,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#064e3b',
  },
  title: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: 'white', 
    textAlign: 'center', 
    lineHeight: 40 
  },
  cyanText: { 
    color: '#22d3ee' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#d1d5db', 
    textAlign: 'center', 
    marginTop: 16, 
    marginBottom: 32, 
    lineHeight: 24 
  },
  
  // Buttons
  primaryBtn: { 
    backgroundColor: '#22d3ee', 
    paddingVertical: 16, 
    borderRadius: 12, 
    width: '100%', 
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  btnText: { 
    color: '#064e3b', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  secondaryBtn: { 
    marginTop: 16, 
    paddingVertical: 16, 
    width: '100%', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.3)', 
    borderRadius: 12 
  },
  secondaryBtnText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },

  // Badges
  trustBadgeRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    marginTop: 32, 
    gap: 15 
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  badgeText: { 
    color: '#4ade80', 
    fontWeight: 'bold', 
    fontSize: 11, 
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },

  // Sections
  section: { 
    padding: 24, 
    backgroundColor: '#065f46' 
  },
  sectionTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 24, 
    textAlign: 'center' 
  },
  
  // Step Cards
  stepCard: { 
    flexDirection: 'row', 
    backgroundColor: '#064e3b', 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 16, 
    alignItems: 'center' 
  },
  stepNumber: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: '#f59e0b', 
    marginRight: 20 
  },
  stepContent: { 
    flex: 1 
  },
  stepHeading: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 4 
  },
  stepText: { 
    color: '#a7f3d0', 
    fontSize: 14,
    lineHeight: 20
  },

  // Feature Section
  featureSection: { 
    padding: 24 
  },
  featureGrid: { 
    gap: 16 
  },
  featureItem: { 
    backgroundColor: '#065f46', 
    padding: 20, 
    borderRadius: 12, 
    borderTopWidth: 4, 
    borderTopColor: '#22d3ee' 
  },
  featureTitle: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 18, 
    marginBottom: 8 
  },
  featureDesc: { 
    color: '#a7f3d0', 
    fontSize: 14,
    lineHeight: 20
  },
});