import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { Leaf, Camera, Zap, FileText } from 'lucide-react-native';
import heroImage from '../../assets/images/scanimage1.jpg'; 

const { width } = Dimensions.get('window');


const LandingPage = () => {
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AgroScan AI</Text>
      </View>

      {/* 2. Hero Section */}
      <View style={styles.heroSection}>
        <Image 
          source={heroImage} 
          style={styles.heroImage} 
        />
        <Text style={styles.heroTagline}>Detect Tea Leaf Diseases Instantly with AI</Text>
        <Text style={styles.heroSubtext}>Snap a photo of your tea leaves and get instant diagnosis and treatment recommendations.</Text>
        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Get Started</Text>
          </Pressable>
        </Link>
      </View>

      {/* 3. How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.stepCard}>
            <View style={styles.iconCircle}>
              <Camera size={32} color="#22C55E" />
            </View>
            <Text style={styles.stepTitle}>Capture</Text>
            <Text style={styles.stepText}>Take a clear photo of the leaf.</Text>
          </View>
          <View style={styles.stepCard}>
            <View style={styles.iconCircle}>
              <Zap size={32} color="#22C55E" />
            </View>
            <Text style={styles.stepTitle}>Analyze</Text>
            <Text style={styles.stepText}>AI detects the disease in seconds.</Text>
          </View>
          <View style={styles.stepCard}>
            <View style={styles.iconCircle}>
              <FileText size={32} color="#22C55E" />
            </View>
            <Text style={styles.stepTitle}>Recommend</Text>
            <Text style={styles.stepText}>Get treatment & pesticide tips.</Text>
          </View>
        </View>
      </View>

      {/* 4. Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Leaf size={24} color="#22C55E" />
            <Text style={styles.featureText}>Real-time disease detection</Text>
          </View>
          <View style={styles.featureCard}>
            <Leaf size={24} color="#22C55E" />
            <Text style={styles.featureText}>Offline & low-data mode</Text>
          </View>
          <View style={styles.featureCard}>
            <Leaf size={24} color="#22C55E" />
            <Text style={styles.featureText}>Tailored pesticide recommendations</Text>
          </View>
          <View style={styles.featureCard}>
            <Leaf size={24} color="#22C55E" />
            <Text style={styles.featureText}>Save & track past scans</Text>
          </View>
        </View>
      </View>
      
      {/* 5. Testimonials */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What Farmers Are Saying</Text>
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialText}>“AgroScan AI helped me save my tea crop by detecting blight early. It&apos;s a game-changer for my farm.”</Text>
          <Text style={styles.testimonialAuthor}>- A Local Farmer</Text>
        </View>
      </View>

      {/* 6. Call-to-Action */}
      <View style={styles.stickyFooter}>
        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.footerButton}>
            <Text style={styles.footerButtonText}>Start Scanning</Text>
          </Pressable>
        </Link>
      </View>

      {/* 7. Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by AI · Designed for Farmers</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingBottom: 100, // Added padding to push up footer content
  },
  header: {
    paddingTop: 50, // Added padding to push header down
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  heroSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ecfdf5',
    marginBottom: 20,
  },
  heroImage: {
    width: width * 0.8,
    height: width * 0.6,
    borderRadius: 16,
    marginBottom: 20,
  },
  heroTagline: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 10,
  },
  heroSubtext: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4b5563',
    marginBottom: 20,
  },
  heroButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 9999,
    backgroundColor: '#22C55E',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  heroButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stepCard: {
    alignItems: 'center',
    width: '30%',
  },
  iconCircle: {
    backgroundColor: '#dcfce7',
    padding: 15,
    borderRadius: 9999,
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  stepText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: 5,
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  testimonialCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#4b5563',
    marginBottom: 10,
  },
  testimonialAuthor: {
    fontSize: 14,
    textAlign: 'right',
    color: '#6b7280',
    fontWeight: 'bold',
  },
  stickyFooter: {
    padding: 20,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 9999,
    backgroundColor: '#22C55E',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    width: '90%',
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default LandingPage;
