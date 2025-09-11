import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function MainLayout() {
  return (
    <View style={styles.container}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'AgroScan AI',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="explore"
          options={{
            title: 'Explore',
            headerShown: false,
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
