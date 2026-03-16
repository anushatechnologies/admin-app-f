import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { verifyOtpAPI } from '../src/api/auth';
import { COLORS, SPACING, BORDER_RADIUS } from '@/src/constants/theme';

export default function VerifyOtpScreen() {

  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  
  const passwordRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [secure, setSecure] = useState(true);

  const handleVerifyOtp = async () => {

    if (!otp || !newPassword) {
      Alert.alert('Error', 'Please enter OTP and new password');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Missing email parameter');
      return;
    }

    try {
      await verifyOtpAPI(email, otp, newPassword);
      Alert.alert('Success', 'Password has been reset successfully. Please login.');
      Keyboard.dismiss();
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Error occurred while verifying OTP');
    }

  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >

            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <View style={styles.inner}>

              <Text style={styles.logo}>Verify OTP</Text>
              <Text style={styles.subtitle}>Enter OTP sent to {email}</Text>

              {/* OTP */}
              <View style={styles.inputContainer}>
                <Ionicons name="keypad-outline" size={20} color={COLORS.textSecondary} />

                <TextInput
                  placeholder="Enter OTP"
                  placeholderTextColor={COLORS.textSecondary}
                  style={styles.input}
                  keyboardType="numeric"
                  returnKeyType="next"
                  value={otp}
                  onChangeText={setOtp}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>

              {/* New Password */}
              <View style={styles.inputContainer}>

                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />

                <TextInput
                  ref={passwordRef}
                  placeholder="Enter new password"
                  placeholderTextColor={COLORS.textSecondary}
                  style={styles.input}
                  secureTextEntry={secure}
                  returnKeyType="done"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onSubmitEditing={handleVerifyOtp}
                />

                <TouchableOpacity onPress={() => setSecure(!secure)}>
                  <Ionicons
                    name={secure ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>

              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={styles.mainButton}
                onPress={handleVerifyOtp}
              >
                <Text style={styles.mainButtonText}>Verify & Reset</Text>
              </TouchableOpacity>

            </View>

          </ScrollView>

        </KeyboardAvoidingView>

      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg + 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  inner: {
    width: '100%',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl + 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md - 2,
    paddingVertical: SPACING.md - 2,
    marginBottom: SPACING.md + 4,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    marginLeft: SPACING.md - 6,
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm + 2,
  },
  mainButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.background,
  },
});
