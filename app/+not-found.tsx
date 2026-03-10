import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />

      <View style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Oops! This page doesn’t exist.</Text>

        <Link href="/home" style={styles.button}>
          Go Back Home
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  title: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#ffd33d',
  },

  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 20,
  },

  button: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#3a3f47',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});