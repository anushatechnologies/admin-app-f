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
} from 'react-native';

export default function LoginScreen() {

  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);

  const handleLogin = () => {

    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (email === 'admin@gmail.com' && password === '123456') {

      Keyboard.dismiss();

      // Navigate to home
      router.replace('/home');

    } else {
      Alert.alert('Invalid', 'Incorrect email or password');
    }

  };

  return (
    <>
      <StatusBar barStyle="light-content" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >

            <View style={styles.inner}>

              {/* Logo */}
              <Text style={styles.logo}>AnushaBazaar</Text>
              <Text style={styles.subtitle}>Online Shopping App</Text>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#aaa" />

                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />

              </View>

              {/* Password */}
              <View style={styles.inputContainer}>

                <Ionicons name="lock-closed-outline" size={20} color="#aaa" />

                <TextInput
                  ref={passwordRef}
                  placeholder="Enter your password"
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  secureTextEntry={secure}
                  returnKeyType="done"
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={handleLogin}
                />

                <TouchableOpacity onPress={() => setSecure(!secure)}>
                  <Ionicons
                    name={secure ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#aaa"
                  />
                </TouchableOpacity>

              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>

              <Text style={styles.footer}>
                © 2026 AnushaBazaar
              </Text>

            </View>

          </ScrollView>

        </KeyboardAvoidingView>

      </TouchableWithoutFeedback>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },

  inner: {
    width: '100%',
  },

  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd33d',
    textAlign: 'center',
  },

  subtitle: {
    textAlign: 'center',
    color: '#aaa',
    marginBottom: 40,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a3f47',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
  },

  loginButton: {
    backgroundColor: '#ffd33d',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  loginText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#25292e',
  },

  footer: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
    fontSize: 12,
  },

});