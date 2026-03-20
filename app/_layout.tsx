import { Stack } from 'expo-router';
import { COLORS } from '@/src/constants/theme';
import { Provider } from 'react-redux';
import { store } from '@/src/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </Provider>
  );
}
