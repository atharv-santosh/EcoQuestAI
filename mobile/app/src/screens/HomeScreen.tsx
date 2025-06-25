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
  const [selectedTheme, setSelectedTheme] = useState<string>('urban-nature');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hunts, setHunts] = useState<any[]>([]);
  const [loadingHunts, setLoadingHunts] = useState(true);
  const [headerAnim] = useState(new Animated.Value(0));
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

  // Animate header on mount
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleGenerateQuest = async () => {
    if (!user) return;
    if (!location) {
      Alert.alert('Location Required', 'Please enable location services to generate your quest.');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await createHunt({
        theme: selectedTheme,
        location: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
        userId: user.id,
      });
      setHunts([response.data, ...hunts]);
      Alert.alert('Quest Created!', 'Your eco-quest is ready.');
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

  const getNextLevelExp = () => {
    if (!user) return 100;
    const currentLevelExp = (user.level - 1) * 100;
    return user.experience - currentLevelExp;
  };

  const getLevelProgress = () => {
    const currentExp = getNextLevelExp();
    return Math.min((currentExp / 100) * 100, 100);
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
        <Animated.View style={[styles.header, { opacity: headerAnim }]}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Image source={{ uri: user?.picture }} style={styles.avatar} />
              <View style={styles.userText}>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.name}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="notifications-outline" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Level Progress */}
          <View style={styles.levelContainer}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelText}>Level {user?.level}</Text>
              <Text style={styles.expText}>{getNextLevelExp()}/100 XP</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getLevelProgress()}%` }]} />
            </View>
          </View>
        </Animated.View>

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
          <Text style={styles.sectionSubtitle}>Choose a theme and start exploring</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeScroll}>
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  selectedTheme === theme.id && styles.selectedThemeCard
                ]}
                onPress={() => setSelectedTheme(theme.id)}
              >
                <Image source={{ uri: theme.image }} style={styles.themeImage} />
                <LinearGradient
                  colors={theme.gradient as [string, string]}
                  style={styles.themeOverlay}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.themeTitle}>{theme.title}</Text>
                  <Text style={styles.themeDescription}>{theme.description}</Text>
                  <View style={styles.themeMeta}>
                    <Text style={styles.themeDuration}>{theme.duration}</Text>
                    <Text style={styles.themeDifficulty}>{theme.difficulty}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

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
                <Text style={styles.generateButtonText}>Generate Quest</Text>
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

        {/* Active Quests */}
        {activeQuests.length > 0 && (
          <View style={styles.questsSection}>
            <Text style={styles.sectionTitle}>Active Quests</Text>
            {activeQuests.slice(0, 2).map((quest) => (
              <TouchableOpacity
                key={quest.id}
                style={styles.questCard}
                onPress={() => navigation.navigate('QuestDetail', { questId: quest.id })}
              >
                <View style={styles.questHeader}>
                  <Ionicons name="leaf" size={24} color="#10b981" />
                  <Text style={styles.questTitle}>{quest.title}</Text>
                </View>
                <Text style={styles.questDescription}>{quest.description}</Text>
                <View style={styles.questFooter}>
                  <Text style={styles.questReward}>{quest.experience} XP</Text>
                  <Text style={styles.questCategory}>{quest.category}</Text>
                </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userText: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  notificationButton: {
    padding: 8,
  },
  levelContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  expText: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  themeScroll: {
    paddingHorizontal: 20,
  },
  themeCard: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  selectedThemeCard: {
    borderWidth: 2,
    borderColor: '#059669',
  },
  themeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  themeOverlay: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'flex-end',
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  themeDescription: {
    fontSize: 12,
    color: 'white',
  },
  themeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeDuration: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  themeDifficulty: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  generateButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  generateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  huntsSection: {
    marginBottom: 24,
  },
  huntCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  huntInfo: {
    flex: 1,
  },
  huntTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  huntDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  questsSection: {
    marginBottom: 24,
  },
  questCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
  },
  questDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questReward: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  questCategory: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});