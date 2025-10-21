import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function MainLayout() {
  return (
    <View style={styles.container}>
      {/* FIX: Set general screen options to suppress group name and apply global styling */}
      <Stack 
        screenOptions={{ 
          headerTitle: '', // This suppresses the directory name (main)
          headerTintColor: '#16a34a', // Consistent primary color
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            // We want the header visible now for the dashboard look
            headerShown: true, 
            title: 'Smart Plant Health Dashboard', // Custom title for the dashboard screen
          }}
        />
        <Stack.Screen
          name="explore"
          options={{
            title: 'Learn More',
            headerShown: true,
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
