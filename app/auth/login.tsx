import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Link, router } from 'expo-router';
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import NetInfo from '@react-native-community/netinfo';
import { auth } from '../../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const LogIn: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.replace('/Home');
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [key]: value });
    setErrorMsg('');
  };

  const handleSubmit = async () => {
    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setErrorMsg('⚠️ Please enter both email and password.');
      return;
    }

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      setErrorMsg('📡 No internet connection. Please check your network.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/Home');
    } catch (error: any) {
      console.error('Login error:', error.message);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrorMsg('❌ Invalid email or password.');
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMsg('🌐 Cannot connect to server. Please try again.');
      } else {
        setErrorMsg('⚠️ Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setErrorMsg('Please enter your email first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, formData.email.trim());
      setErrorMsg('✅ Password reset email sent.');
    } catch (err: any) {
      setErrorMsg('❌ Failed to send reset email.');
    }
  };

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#E6F2FF', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#E6F2FF" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Login</Text>

          <View style={styles.errorWrapper}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
            />

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>


          {/* Log In Button */}
          <LinearGradient
            colors={['#3B7CF5', '#5AD9D5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
            </TouchableOpacity>
          </LinearGradient>
          
           <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 25 }}>
            <Text style={styles.linkText}>If you don&apos;t have an account, please</Text>
            <Link href="/auth/signup" style={styles.link}>
              Register.
            </Link>
          </View>

          <Text style={{ textAlign: 'center', marginVertical: 20, color: '#555', fontSize: 16, marginTop: 40, }}>or login with</Text>

          {/* Dummy Google Login */}
          <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
            <View style={styles.googleContent}>
              <Image
                source={require('../../assets/images/google.png')} // Add Google logo here
                style={styles.googleLogo}
              />
              <Text style={styles.googleText}>Login with Google</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default LogIn;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3B7CF5',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    color: '#3B7CF5',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 52,
    borderColor: 'rgba(59,124,245,0.5)',
    borderWidth: 1.2,
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  forgotText: {
    color: '#0059ffff',
    fontWeight: '600',
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 12,
    marginRight: 5,
    fontStyle: 'italic',
  },
  buttonGradient: {
    borderRadius: 25,
    marginTop: 15,
    elevation: 3,
  },
  button: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  googleButton: {
    flexDirection: 'row',
    marginTop: -10,
    borderWidth: 2,
    borderColor: '#dadadaff',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowRadius: 3,
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  linkText: {
    fontSize: 16,
    color: '#444',
  },
  link: {
    fontWeight: 'bold',
    color: '#3B7CF5',
    fontSize: 16,
    marginLeft: 4,
  },
  errorWrapper: {
    minHeight: 22,
    marginBottom: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
