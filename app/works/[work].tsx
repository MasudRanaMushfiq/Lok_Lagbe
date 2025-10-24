import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

export default function WorkDetails() {
  const { work: id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [workData, setWorkData] = useState<any>(null);
  const [posterName, setPosterName] = useState<string>('Loading...');
  const [accepting, setAccepting] = useState(false);

  const currentUser = getAuth().currentUser;

  const formatDate = (ts: Timestamp | string | number | null | undefined) => {
    if (!ts) return 'N/A';
    if (ts instanceof Timestamp) {
      return ts.toDate().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return ts.toString();
  };

  useEffect(() => {
    const fetchWorkAndUser = async () => {
      if (!id) return;

      try {
        const workRef = doc(db, 'worked', id as string);
        const workSnap = await getDoc(workRef);

        if (!workSnap.exists()) {
          Alert.alert('Not Found', 'This work does not exist.');
          setLoading(false);
          return;
        }

        const work = workSnap.data();
        setWorkData(work);

        if (work?.userId) {
          const userRef = doc(db, 'users', work.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const user = userSnap.data();
            setPosterName(user?.fullName || 'Unknown User');
          } else {
            setPosterName('Unknown User');
          }
        } else {
          setPosterName('Unknown User');
        }
      } catch (error) {
        console.error('Error fetching work or user:', error);
        Alert.alert('Error', 'Failed to load work details.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkAndUser();
  }, [id]);

  const handleAccept = async () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'You must be logged in to accept work.');
      return;
    }

    if (!workData || !id) {
      Alert.alert('Error', 'Work data not loaded.');
      return;
    }

    if (workData.userId === currentUser.uid) {
      Alert.alert('Cannot Apply', 'You cannot apply for your own work.');
      return;
    }

    if (workData?.status !== 'active') {
      Alert.alert('Unavailable', 'This work is not available for acceptance.');
      return;
    }

    setAccepting(true);

    try {
      const acceptingUserId = currentUser.uid;
      const workRef = doc(db, 'worked', id as string);
      const userRef = doc(db, 'users', acceptingUserId);

      await updateDoc(workRef, {
        acceptedBy: acceptingUserId,
        acceptedAt: Timestamp.now(),
        status: 'accepted_sent',
      });

      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentAccepted: string[] = userData?.acceptedWorks || [];
        if (!currentAccepted.includes(id as string)) {
          await updateDoc(userRef, {
            acceptedWorks: [...currentAccepted, id as string],
          });
        }
      }

      if (workData?.userId) {
        const notifRef = await addDoc(collection(db, 'notifications'), {
          toUserId: workData.userId,
          fromUserId: acceptingUserId,
          workId: id,
          type: 'accepted_sent',
          message: `Will you allow to do "${workData?.jobTitle || 'Untitled'}" work done by him?`,
          createdAt: Timestamp.now(),
          read: false,
        });
        await updateDoc(notifRef, { notificationId: notifRef.id });
      }

      Alert.alert('Success', 'You have applied for this work!');
      router.push('/Home/(tabs)');
    } catch (error) {
      console.error('Error accepting work:', error);
      Alert.alert('Error', 'Failed to accept the work. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  if (!workData) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#F44336' }}>No data found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E6F2FF' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Gradient Header */}
      <LinearGradient
        colors={['#4A8FF0', '#65D4C9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 20) + 8 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Work Details</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient colors={['#3B7CF5', '#5AD9D5']} style={styles.cardGradient}>
          <View style={styles.card}>
            <Text style={styles.title}>{workData?.jobTitle || 'Untitled Work'}</Text>
            <Text style={styles.postedBy}>
              Posted by: <Text style={styles.postedByName}>{posterName}</Text>
            </Text>

            <LinearGradient colors={['#E0F7FA', '#B2EBF2']} style={styles.miniCard}>
              <View style={styles.row}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Start Date</Text>
                  <Text style={styles.infoValue}>{formatDate(workData?.startDate)}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>End Date</Text>
                  <Text style={styles.infoValue}>{formatDate(workData?.endDate)}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{workData?.location || 'N/A'}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Price</Text>
                  <Text style={[styles.infoValue, styles.price]}>
                    ৳{workData?.price || 0}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionContent}>
                {workData?.description || 'No description provided.'}
              </Text>
            </View>

            {workData?.status === 'active' ? (
              <LinearGradient
                colors={['#3B7CF5', '#5AD9D5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.acceptButton, accepting && styles.disabledButton]}
              >
                <TouchableOpacity
                  onPress={handleAccept}
                  disabled={accepting}
                  style={{ width: '100%', alignItems: 'center' }}
                >
                  <Text style={styles.acceptButtonText}>
                    {accepting ? 'Accepting...' : 'Apply For Work'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={['#636060', '#636060']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.acceptButton, { opacity: 0.7 }]}
              >
                <TouchableOpacity disabled style={{ width: '100%', alignItems: 'center' }}>
                  <Text style={styles.acceptButtonText}>Work Not Available</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#E6F2FF', flexGrow: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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

  cardGradient: {
    borderRadius: 14,
    padding: 2,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#3a125d',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  miniCard: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },

  title: { fontSize: 26, fontWeight: 'bold', color: '#3a125d', marginBottom: 8 },
  postedBy: { fontSize: 14, color: '#636060', marginBottom: 14 },
  postedByName: { fontWeight: '600', color: '#e89d07' },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#3a125d', marginBottom: 6 },
  sectionContent: { fontSize: 16, color: '#544d4d', lineHeight: 22 },

  row: { flexDirection: 'row', justifyContent: 'space-between' },
  infoBox: { flex: 1, alignItems: 'flex-start', padding: 8 },
  infoLabel: { fontSize: 14, fontWeight: '600', color: '#3a125d', marginBottom: 4 },
  infoValue: { fontSize: 16, color: '#544d4d' },
  price: { fontWeight: 'bold', color: '#e89d07' },

  acceptButton: {
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  disabledButton: { opacity: 0.6 },
  acceptButtonText: { color: '#fff', fontWeight: '700', fontSize: 20 },
});
