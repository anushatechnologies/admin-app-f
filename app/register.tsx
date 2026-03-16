import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
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
    Image,
} from 'react-native';
import { registerAPI } from '../src/api/auth';
import { COLORS, SPACING, BORDER_RADIUS } from '@/src/constants/theme';

export default function RegisterScreen() {

  const router = useRouter();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);

  const handleRegister = async () => {

    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await registerAPI(name, email, password);
      Alert.alert('Success', 'Account created successfully! Please login.', [
        { text: 'OK', onPress: () => router.replace('/login') }
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong');
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

              <Text style={styles.subtitle}>Create Account: Join AnushaBazaar Admin</Text>

              {/* Name */}
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor={COLORS.textSecondary}
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  ref={emailRef}
                  placeholder="Email Address"
                  placeholderTextColor={COLORS.textSecondary}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  ref={passwordRef}
                  placeholder="Password"
                  placeholderTextColor={COLORS.textSecondary}
                  style={styles.input}
                  secureTextEntry={secure}
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity onPress={() => setSecure(!secure)}>
                  <Ionicons
                    name={secure ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
              >
                <Text style={styles.registerText}>Sign Up</Text>
              </TouchableOpacity>

              <View style={styles.footerLinks}>
                <Text style={{ color: COLORS.textSecondary }}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.linkText}>Login</Text>
                </TouchableOpacity>
              </View>

            </View>

          </ScrollView>

        </KeyboardAvoidingView>

      </TouchableWithoutFeedback>
    </View>
  );
}

/* ================= STYLES ================= */

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

  registerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm + 2,
  },

  registerText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.background,
  },

  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg + 6,
  },

  linkText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

});
