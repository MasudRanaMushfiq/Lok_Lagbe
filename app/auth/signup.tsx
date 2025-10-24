import React, { useState } from 'react';
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
} from 'react-native';
import { Link, router } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [nid, setNid] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setErrorMsg('');

    if (!fullName || !nid || !phone || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Set display name
      await updateProfile(user, { displayName: fullName });

      // 3. Add user to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName,
        nid,
        phone,
        email,
        rating: 1,
        verified: false,
        createdAt: serverTimestamp(),
        work: [],
        acceptedWorks: [],
      });

      // 4. Sign out user immediately to prevent auto-login
      await signOut(auth);

      // 5. Immediately route to login page
      router.replace('/auth/login');

      // 6. Send verification email asynchronously
      sendEmailVerification(user)
        .then(() => {
          alert(`Verification email sent to ${user.email}. Please verify your email before logging in.`);
        })
        .catch((err) => {
          console.error('Failed to send verification email:', err);
        });

    } catch (error: any) {
      let message = 'Something went wrong. Please try again.';
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            message = 'The email address is invalid.';
            break;
          case 'auth/weak-password':
            message = 'The password is too weak. Use at least 6 characters.';
            break;
          case 'auth/network-request-failed':
            message = 'No Internet. Please check your internet connection.';
            break;
          default:
            message = error.message || message;
        }
      }
      setErrorMsg(`${message}`);
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us by filling in your details</Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#8b8686"
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
            />
            <TextInput
              placeholder="NID Number"
              placeholderTextColor="#8b8686"
              value={nid}
              onChangeText={setNid}
              style={styles.input}
              keyboardType="number-pad"
            />
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#8b8686"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              keyboardType="phone-pad"
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#8b8686"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#8b8686"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />
          </View>

          <LinearGradient
            colors={['#3B7CF5', '#5AD9D5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
            </TouchableOpacity>
          </LinearGradient>

          <Text style={styles.linkText}>
            Already have an account?{' '}
            <Link href="/auth/login" style={styles.link}>
              Sign In
            </Link>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3B7CF5',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#555',
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    height: 52,
    borderColor: 'rgba(59,124,245,0.5)',
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonGradient: {
    borderRadius: 14,
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
  linkText: {
    marginTop: 25,
    textAlign: 'center',
    color: '#444',
    fontSize: 16,
  },
  link: {
    color: '#3B7CF5',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#b91c1c',
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});



