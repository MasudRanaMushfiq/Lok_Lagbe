import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ContactScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const handleSend = () => {
    if (!name || !email || !message) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setSending(true);
    // TODO: integrate with Firebase or backend API
    setTimeout(() => {
      setSending(false);
      Alert.alert('Success', 'Your message has been sent!');
      setName('');
      setEmail('');
      setMessage('');
    }, 1500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#E6F2FF' }}>
      <StatusBar backgroundColor="#4A8FF0" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4A8FF0', '#65D4C9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.header,
          { paddingTop: (Platform.OS === 'android' ?  StatusBar.currentHeight || 0 : 20) + 8 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient
          colors={['#3B7CF5', '#5AD9D5']}
          style={styles.formCardGradient}
        >
          <View style={styles.formCard}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Your Email"
              keyboardType="email-address"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message..."
              multiline
              placeholderTextColor="#999"
            />

            <LinearGradient
              colors={['#3B7CF5', '#5AD9D5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendButton}
            >
              <TouchableOpacity
                onPress={handleSend}
                style={{ width: '100%', alignItems: 'center' }}
                disabled={sending}
              >
                <Text style={styles.sendButtonText}>
                  {sending ? 'Sending...' : 'Send Message'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 12 },

  container: { padding: 16, alignItems: 'center' },

  formCardGradient: { borderRadius: 20, width: '95%', padding: 2, marginTop: 30 },
  formCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#3a125d', marginTop: 12 },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#333',
    fontSize: 14,
  },

  sendButton: { borderRadius: 24, marginTop: 20, paddingVertical: 12 },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ContactScreen;
