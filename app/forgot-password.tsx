import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
    Image,
} from 'react-native';
import { sendOtpAPI } from '../src/api/auth';
import { COLORS, SPACING, BORDER_RADIUS } from '@/src/constants/theme';

export default function ForgotPasswordScreen() {

  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSendOtp = async () => {

    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      await sendOtpAPI(email);
      Alert.alert('OTP Sent', 'An OTP has been sent to your email.');
      Keyboard.dismiss();
      router.push({ pathname: '/verify-otp', params: { email } });
    } catch (error: any) {
      Alert.alert('Failed', error.message || 'Error occurred while sending OTP');
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

              {/* Logo & Branding - Horizontal Layout */}
              <View style={styles.brandingContainer}>
                <View style={styles.logoWrapper}>
                  <Image
                    source={require('@/assets/images/logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.titleWrapper}>
                  <Text style={styles.brandTitle}>AnushaBazaar</Text>
                  <Text style={styles.adminText}>ADMIN APP</Text>
                  <View style={styles.titleUnderline} />
                </View>
              </View>

              <Text style={styles.subtitle}>Reset Password: Enter your email to receive an OTP</Text>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />

                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.textSecondary}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={handleSendOtp}
                />
              </View>

              {/* Send Button */}
              <TouchableOpacity
                style={styles.mainButton}
                onPress={handleSendOtp}
              >
                <Text style={styles.mainButtonText}>Send OTP</Text>
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
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.lg,
  },
  logoWrapper: {
    backgroundColor: COLORS.white,
    padding: 6,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  titleWrapper: {
    alignItems: 'flex-start',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 0,
  },
  adminText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  titleUnderline: {
    width: 30,
    height: 2,
    backgroundColor: COLORS.primary,
    marginTop: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    fontSize: 14,
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
