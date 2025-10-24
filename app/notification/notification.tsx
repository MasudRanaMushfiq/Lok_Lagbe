import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Notification = {
  id: string;
  message: string;
  createdAt: any;
  read: boolean;
  workId?: string;
  complainId?: string;
  type: string;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getAuth().currentUser;
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('toUserId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notifList: Notification[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          notifList.push({
            id: doc.id,
            message: data.message,
            createdAt: data.createdAt,
            read: data.read,
            workId: data.workId,
            complainId: data.complainId,
            type: data.type,
          });
        });
        setNotifications(notifList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleNotificationPress = (item: Notification) => {
    switch (item.type) {
      case 'general':
        // Forward the clicked notification id
        router.push({ pathname: '/notification/general', params: { id: item.id } });
        break;
      case 'accepted':
        router.push({ pathname: '/notification/accepted', params: { id: item.id } });
        break;
      case 'accepted_sent':
        router.push({ pathname: '/notification/acceptedsent', params: { id: item.id } });
        break;
      case 'completed_sent':
        router.push({ pathname: '/notification/completesent', params: { id: item.id } });
        break;
      case 'completed':
        router.push({ pathname: '/notification/completed', params: { id: item.id } });
        break;
      default:
        router.push({ pathname: '/notification/general', params: { id: item.id } });
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const date = item.createdAt?.toDate ? item.createdAt.toDate() : new Date();

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.notificationCard, item.read ? styles.read : styles.unread]}
        onPress={() => handleNotificationPress(item)}
      >
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.timestamp}>{date.toLocaleString()}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.background}>
      <StatusBar backgroundColor="#transparent" barStyle="light-content" />

      <LinearGradient
        colors={['#4A8FF0', '#65D4C9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.header,
          { paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20) + 8 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B7CF5" />
        </View>
      ) : !currentUser ? (
        <View style={styles.centered}>
          <Text style={styles.infoText}>Please log in to view notifications.</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.infoText}>No notifications found.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#E6F2FF',
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: '#606770',
    fontSize: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  unread: {
    borderLeftWidth: 5,
    borderLeftColor: '#3B7CF5',
  },
  read: {
    opacity: 0.7,
    borderLeftWidth: 5,
    borderLeftColor: '#ccc',
  },
  message: {
    fontSize: 15,
    color: '#122f5dff',
    marginBottom: 6,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#544d4d',
  },
  header: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },
  backButton: {
    padding: 4,
  },
});
