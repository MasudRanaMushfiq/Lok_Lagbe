import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { db } from '../../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

export default function AllPostsScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const router = useRouter();

  const fetchPosts = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      const postsSnap = await getDocs(collection(db, 'worked'));
      const postsList: any[] = [];
      const userIdSet = new Set<string>();

      postsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        postsList.push({ id: docSnap.id, ...data });
        if (data.userId) userIdSet.add(data.userId);
        if (data.completedBy) userIdSet.add(data.completedBy);
      });

      const userDocs = await Promise.all(
        Array.from(userIdSet).map(async (uid) => {
          const userDoc = await getDoc(doc(db, 'users', uid));
          return userDoc.exists() ? { uid, fullName: userDoc.data().fullName } : null;
        })
      );

      const namesMap: Record<string, string> = {};
      userDocs.forEach((u) => {
        if (u) namesMap[u.uid] = u.fullName;
      });

      setUserNames(namesMap);
      setPosts(postsList);
      setFilteredPosts(postsList.filter((p) => p.status === 'accepted'));
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.background}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Gradient Header */}
      <LinearGradient
        colors={['#4A8FF0', '#65D4C9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 20) + 8 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Posts</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B7CF5']} />
        }
      >
        {filteredPosts.length === 0 ? (
          <Text style={styles.noWorksText}>No pending posts found</Text>
        ) : (
          filteredPosts.map((post) => (
            <LinearGradient
              key={post.id}
              colors={['#3B7CF5', '#5AD9D5']}
              style={styles.gradientBorder}
            >
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/works/[work]', params: { work: post.id } })}
                style={styles.workCard}
              >
                <Text style={styles.workTitle}>{post.jobTitle || post.title || 'No Title'}</Text>
                <Text style={styles.workCategory}>{post.category}</Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.detailValue}>৳{post.price ?? 'N/A'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>{post.location ?? 'N/A'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Posted by:</Text>
                  <Text style={styles.detailValue}>{userNames[post.userId] || 'Loading...'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>End Time:</Text>
                  <Text style={styles.detailValue}>
                    {post.endTime ? new Date(post.endTime.seconds * 1000).toLocaleString() : 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description:</Text>
                  <Text style={styles.detailValue}>{post.description || 'No description'}</Text>
                </View>

                <View style={styles.statusContainer}>
                  <Text style={[styles.statusText, styles.activeStatus]}>{post.status}</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#E6F2FF' },
  background: { flex: 1, backgroundColor: '#E6F2FF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6F2FF' },
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
  backButton: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 12 },
  noWorksText: {
    fontSize: 18,
    color: '#544d4d',
    textAlign: 'center',
    marginTop: 20,
  },
  gradientBorder: {
    borderRadius: 20,
    marginBottom: 16,
    padding: 2,
  },
  workCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
  },
  workTitle: { fontSize: 18, fontWeight: 'bold', color: '#3B7CF5', marginBottom: 4 },
  workCategory: { fontSize: 14, color: '#19A7CE', marginBottom: 12, fontStyle: 'italic' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  detailLabel: { fontSize: 14, fontWeight: '600', color: '#3B7CF5' },
  detailValue: { fontSize: 14, color: '#544d4d', maxWidth: '70%' },
  statusContainer: { marginTop: 10, alignItems: 'flex-end' },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatus: { backgroundColor: '#e8f5e9', color: '#4CAF50' },
});
