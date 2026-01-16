import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native'; // Change this line

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#064e3b' },
  title: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  link: { marginTop: 15, paddingVertical: 15 },
  linkText: { fontSize: 14, color: '#22d3ee' },
});