import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
  Platform,
  RefreshControl,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {useRoute, useNavigation} from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { getActiveHunt, getHuntById } from '../services/api';
import { useQuest } from '../contexts/QuestContext';
import { useLocation } from '../contexts/LocationContext';
import UserHeader from '../components/UserHeader';

// Conditionally import MapView only on native platforms
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

const {width} = Dimensions.get('window');

interface Stop {
  id: string;
  title: string;
  description: string;
  location: {lat: number; lng: number};
  address: string;
  type: 'photo' | 'trivia' | 'task';
  challenge: any;
  completed: boolean;
  points: number;
}

export default function HuntScreen({ navigation }: any) {
  const route = useRoute<any>();
  const { activeQuests, completedQuests, loading, generateNearbyQuests, deleteQuest } = useQuest();
  const { location, requestPermission } = useLocation();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showCompletedQuests, setShowCompletedQuests] = useState(false);
  const [dropdownAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!location) {
      requestPermission();
    }
  }, []);

  const toggleCompletedQuests = () => {
    const toValue = showCompletedQuests ? 0 : 1;
    setShowCompletedQuests(!showCompletedQuests);
    
    Animated.timing(dropdownAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (location) {
      await generateNearbyQuests();
    }
    setRefreshing(false);
  };

  const handleQuestPress = (questId: string) => {
    navigation.navigate('QuestDetail', { questId });
  };

  const handleDeleteQuest = async (questId: string) => {
    if (!user) return;

    const gemCost = 5;
    
    if (user.gems < gemCost) {
      Alert.alert(
        'Insufficient Gems',
        `You need ${gemCost} gems to delete this quest. Would you like to visit the shop?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Shop', onPress: () => navigation.navigate('Shop') }
        ]
      );
      return;
    }

    Alert.alert(
      'Delete Quest',
      'Are you sure you want to delete this quest? This will cost 5 gems.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const success = await deleteQuest(questId);
            if (success) {
              Alert.alert('Quest Deleted', 'Quest has been removed and 5 gems deducted.');
            }
          }
        }
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nature':
        return 'leaf';
      case 'sustainability':
        return 'reload';
      case 'exploration':
        return 'map';
      case 'community':
        return 'people';
      default:
        return 'star';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nature':
        return '#10b981';
      case 'sustainability':
        return '#059669';
      case 'exploration':
        return '#3b82f6';
      case 'community':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'hard':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const QuestCard = ({ quest, isCompleted }: { quest: any; isCompleted: boolean }) => (
    <TouchableOpacity
      style={[styles.questCard, isCompleted && styles.questCardCompleted]}
      onPress={() => handleQuestPress(quest.id)}
    >
      <View style={styles.questHeader}>
        <View style={styles.questTitleContainer}>
          <Icon
            name={getCategoryIcon(quest.category)}
            size={24}
            color={getCategoryColor(quest.category)}
            style={styles.categoryIcon}
          />
          <View style={styles.questTitleWrapper}>
            <Text style={styles.questTitle}>{quest.title}</Text>
            <Text style={styles.questCategory}>{quest.category}</Text>
          </View>
        </View>
        <View style={styles.questBadges}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quest.difficulty) + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(quest.difficulty) }]}>
              {quest.difficulty}
            </Text>
          </View>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Icon name="checkmark-circle" size={16} color="#10b981" />
            </View>
          )}
          {!isCompleted && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteQuest(quest.id);
              }}
            >
              <Icon name="close-circle" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.questDescription}>{quest.description}</Text>

      <View style={styles.questFooter}>
        <View style={styles.questReward}>
          <Icon name="star" size={16} color="#f59e0b" />
          <Text style={styles.rewardText}>{quest.experience} XP</Text>
        </View>
        <View style={styles.questRequirements}>
          <Icon name="camera" size={16} color="#6b7280" />
          <Text style={styles.requirementsText}>{quest.requirements.description}</Text>
        </View>
      </View>

      {isCompleted && quest.completedAt && (
        <View style={styles.completionInfo}>
          <Text style={styles.completionText}>
            Completed {new Date(quest.completedAt).toLocaleDateString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading || !activeQuests.length) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading quest...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <UserHeader />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quest Hunt</Text>
        <Text style={styles.headerSubtitle}>
          {activeQuests.length} active quests
          {completedQuests.length > 0 && ` • ${completedQuests.length} completed`}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Active Quests */}
        {activeQuests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Quests</Text>
            {activeQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} isCompleted={false} />
            ))}
          </View>
        )}

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.dropdownHeader, showCompletedQuests && styles.dropdownHeaderExpanded]}
              onPress={toggleCompletedQuests}
              activeOpacity={0.7}
            >
              <View style={styles.dropdownHeaderContent}>
                <Text style={styles.sectionTitle}>Completed Quests</Text>
                <Text style={styles.completedCount}>({completedQuests.length})</Text>
              </View>
              <Animated.View
                style={[
                  styles.dropdownIcon,
                  {
                    transform: [{
                      rotate: dropdownAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      }),
                    }],
                  },
                ]}
              >
                <Icon name="chevron-down" size={20} color="#6b7280" />
              </Animated.View>
            </TouchableOpacity>
            
            <Animated.View
              style={[
                styles.dropdownContent,
                {
                  maxHeight: dropdownAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, completedQuests.length * 200], // Approximate height per quest
                  }),
                  opacity: dropdownAnimation,
                },
              ]}
            >
              {completedQuests.map((quest) => (
                <QuestCard key={quest.id} quest={quest} isCompleted={true} />
              ))}
            </Animated.View>
          </View>
        )}

        {/* Empty State */}
        {activeQuests.length === 0 && completedQuests.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="search-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No Quests Found</Text>
            <Text style={styles.emptyStateText}>
              {location
                ? 'No quests are available in your area right now. Pull to refresh to generate new quests!'
                : 'Enable location services to find quests near you.'}
            </Text>
            {!location && (
              <TouchableOpacity style={styles.locationButton} onPress={requestPermission}>
                <Icon name="location" size={20} color="#fff" />
                <Text style={styles.locationButtonText}>Enable Location</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Stats Summary */}
        {user && (activeQuests.length > 0 || completedQuests.length > 0) && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.totalQuests}</Text>
              <Text style={styles.statLabel}>Total Quests</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.experience}</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  questCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questCardCompleted: {
    opacity: 0.8,
    backgroundColor: '#f9fafb',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 12,
  },
  questTitleWrapper: {
    flex: 1,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  questCategory: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  questBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  completedBadge: {
    marginLeft: 4,
  },
  questDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
    marginLeft: 4,
  },
  questRequirements: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementsText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  completionInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  completionText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 20,
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
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  deleteButton: {
    marginLeft: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  dropdownHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedCount: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  dropdownContent: {
    overflow: 'hidden',
  },
  dropdownHeaderExpanded: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
});