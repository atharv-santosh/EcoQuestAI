import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import * as Location from 'expo-location';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {useAuth} from '../contexts/AuthContext';
import {getActiveHunt, createHunt, getUserHunts} from '../services/api';
import {useQuest} from '../contexts/QuestContext';
import {useBadge} from '../contexts/BadgeContext';
import {useLocation} from '../contexts/LocationContext';
import UserHeader from '../components/UserHeader';

const {width} = Dimensions.get('window');

interface Theme {
  id: string;
  title: string;
  description: string;
  image: string;
  gradient: string[];
  duration: string;
  difficulty: string;
  tags: string[];
}

const themes: Theme[] = [
  {
    id: 'urban-nature',
    title: 'Urban Nature Explorer',
    description: 'Discover hidden green spaces and wildlife in the city',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    gradient: ['#059669', '#065f46'],
    duration: '45 min',
    difficulty: 'Easy',
    tags: ['Parks', 'Wildlife', 'Photography'],
  },
  {
    id: 'sustainable-shopping',
    title: 'Sustainable Shopping Quest',
    description: 'Find eco-friendly stores and local sustainable products',
    image: 'https://images.unsplash.com/photo-1573821663912-6df460f9c684?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    gradient: ['#d97706', '#92400e'],
    duration: '60 min',
    difficulty: 'Medium',
    tags: ['Local', 'Eco-friendly', 'Community'],
  },
  {
    id: 'pollinator-hunt',
    title: 'Pollinator Discovery Hunt',
    description: 'Spot and photograph bees, butterflies, and flowering plants',
    image: 'https://images.unsplash.com/photo-1500740516770-92bd004b996e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    gradient: ['#fbbf24', '#f59e0b'],
    duration: '30 min',
    difficulty: 'Easy',
    tags: ['Flowers', 'Bees', 'Nature'],
  },
  {
    id: 'zero-waste-picnic',
    title: 'Zero Waste Picnic Challenge',
    description: 'Plan and execute the perfect eco-friendly outdoor meal',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    gradient: ['#0ea5e9', '#0284c7'],
    duration: '90 min',
    difficulty: 'Medium',
    tags: ['Picnic', 'Sustainable', 'Food'],
  },
];

const themeGradients: Record<string, [string, string]> = {
  'urban-nature': ['#a8e063', '#56ab2f'],
  'sustainable-shopping': ['#43cea2', '#185a9d'],
  'pollinator-hunt': ['#f7971e', '#ffd200'],
  'zero-waste-picnic': ['#00c6ff', '#0072ff'],
};

export default function HomeScreen({navigation}: any) {
  const {user, loading: userLoading} = useAuth();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hunts, setHunts] = useState<any[]>([]);
  const [loadingHunts, setLoadingHunts] = useState(true);
  const [showCompletedQuests, setShowCompletedQuests] = useState(false);
  const [dropdownAnimation] = useState(new Animated.Value(0));
  const {activeQuests, completedQuests, loading, generateNearbyQuests} = useQuest();
  const {unlockedBadges} = useBadge();
  const {requestPermission} = useLocation();

  useEffect(() => {
    if (user) {
      fetchUserHunts();
    }
  }, [user]);

  useEffect(() => {
    if (!location) {
      requestPermission();
    }
  }, []);

  const fetchUserHunts = async () => {
    setLoadingHunts(true);
    try {
      const response = await getUserHunts(user!.id);
      setHunts(response.data);
    } catch (err: any) {
      setHunts([]);
    } finally {
      setLoadingHunts(false);
    }
  };

  const handleGenerateQuest = async () => {
    if (!user) return;
    
    // Check if we have location permission and current location
    if (!location) {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        Alert.alert('Location Required', 'Please enable location services in your device settings to generate quests.');
        return;
      }
    }
    
    // Check if we can generate more quests
    if (activeQuests.length >= 3) {
      Alert.alert(
        'Quest Limit Reached',
        'You can only have 3 active quests at a time. Complete or delete some quests first.',
        [
          { text: 'OK' },
          { text: 'View Quests', onPress: () => navigation.navigate('Hunt') }
        ]
      );
      return;
    }
    
    setIsGenerating(true);
    try {
      // Generate quests using the QuestContext (random theme)
      await generateNearbyQuests();
      Alert.alert(
        'Quest Created!', 
        'Your eco-quest is ready!',
        [
          { text: 'OK' },
          { text: 'View Quest', onPress: () => navigation.navigate('Hunt') }
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create quest.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = async () => {
    if (location) {
      await generateNearbyQuests();
    }
  };

  const getProgressPercentage = () => {
    const total = activeQuests.length + completedQuests.length;
    return total > 0 ? Math.round((completedQuests.length / total) * 100) : 0;
  };

  if (userLoading || loadingHunts) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={{marginTop: 16}}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <UserHeader />

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>{user?.totalQuests || 0}</Text>
            <Text style={styles.statLabel}>Quests</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color="#8b5cf6" />
            <Text style={styles.statNumber}>{user?.totalBadges || 0}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#10b981" />
            <Text style={styles.statNumber}>{getProgressPercentage()}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>

        {/* Quest Generation */}
        <View style={styles.questSection}>
          <Text style={styles.sectionTitle}>Generate New Quest</Text>
          <Text style={styles.sectionSubtitle}>Discover a random eco-adventure near you</Text>
          
          <View style={styles.generateCard}>
            <LinearGradient
              colors={['#059669', '#065f46']}
              style={styles.generateCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="leaf" size={48} color="white" />
              <Text style={styles.generateCardTitle}>Ready for Adventure?</Text>
              <Text style={styles.generateCardDescription}>
                Generate a random quest based on your location and interests
              </Text>
            </LinearGradient>
          </View>

          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={handleGenerateQuest}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.generateButtonText}>Generate Random Quest</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Recent Hunts */}
        {hunts.length > 0 && (
          <View style={styles.huntsSection}>
            <Text style={styles.sectionTitle}>Recent Hunts</Text>
            {hunts.slice(0, 3).map((hunt) => (
              <TouchableOpacity
                key={hunt.id}
                style={styles.huntCard}
                onPress={() => navigation.navigate('Hunt', { huntId: hunt.id })}
              >
                <View style={styles.huntInfo}>
                  <Text style={styles.huntTitle}>{hunt.theme}</Text>
                  <Text style={styles.huntDate}>
                    {new Date(hunt.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  questSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  generateCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  generateCardGradient: {
    padding: 24,
    alignItems: 'center',
  },
  generateCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  generateCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  generateButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  huntsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  huntCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  huntInfo: {
    flex: 1,
  },
  huntTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  huntDate: {
    fontSize: 12,
    color: '#6b7280',
  },
});