import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useBadge } from '../contexts/BadgeContext';
import { useAuth } from '../contexts/AuthContext';
import UserHeader from '../components/UserHeader';

const { width } = Dimensions.get('window');

export default function BadgesScreen() {
  const { badges, unlockedBadges, lockedBadges } = useBadge();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All', icon: 'trophy' },
    { id: 'nature', name: 'Nature', icon: 'leaf' },
    { id: 'sustainability', name: 'Sustainability', icon: 'reload' },
    { id: 'exploration', name: 'Exploration', icon: 'map' },
    { id: 'community', name: 'Community', icon: 'people' },
    { id: 'special', name: 'Special', icon: 'star' },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#6b7280';
      case 'rare':
        return '#3b82f6';
      case 'epic':
        return '#8b5cf6';
      case 'legendary':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getRarityBackground = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#f3f4f6';
      case 'rare':
        return '#eff6ff';
      case 'epic':
        return '#f3f4ff';
      case 'legendary':
        return '#fffbeb';
      default:
        return '#f3f4f6';
    }
  };

  const filteredBadges = selectedCategory === 'all'
    ? badges
    : badges.filter(badge => badge.category === selectedCategory);

  const unlockedCount = unlockedBadges.length;
  const totalCount = badges.length;
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  const BadgeCard = ({ badge }: { badge: any }) => (
    <View style={[
      styles.badgeCard,
      { backgroundColor: getRarityBackground(badge.rarity) },
      !badge.unlocked && styles.badgeCardLocked
    ]}>
      <View style={styles.badgeIconContainer}>
        <Text style={[styles.badgeIcon, !badge.unlocked && styles.badgeIconLocked]}>
          {badge.unlocked ? badge.icon : '🔒'}
        </Text>
        {badge.unlocked && (
          <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(badge.rarity) }]}>
            <Text style={styles.rarityText}>{badge.rarity}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.badgeInfo}>
        <Text style={[styles.badgeName, !badge.unlocked && styles.badgeNameLocked]}>
          {badge.unlocked ? badge.name : 'Locked Badge'}
        </Text>
        <Text style={[styles.badgeDescription, !badge.unlocked && styles.badgeDescriptionLocked]}>
          {badge.unlocked ? badge.description : 'Complete requirements to unlock'}
        </Text>
        
        {badge.unlocked && badge.unlockedAt && (
          <Text style={styles.unlockDate}>
            Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
          </Text>
        )}
        
        {!badge.unlocked && (
          <View style={styles.requirementsContainer}>
            <Icon name="information-circle" size={16} color="#9ca3af" />
            <Text style={styles.requirementsText}>{badge.requirements.description}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <UserHeader />
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Collection Progress</Text>
            <Text style={styles.progressText}>{Math.round(progressPercentage)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
            />
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Icon
                name={category.icon as any}
                size={20}
                color={selectedCategory === category.id ? '#059669' : '#6b7280'}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Badges Grid */}
      <ScrollView style={styles.badgesContainer} showsVerticalScrollIndicator={false}>
        {filteredBadges.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="trophy-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No Badges Found</Text>
            <Text style={styles.emptyStateText}>
              {selectedCategory === 'all'
                ? 'Complete quests to earn your first badges!'
                : `No ${selectedCategory} badges available yet.`}
            </Text>
          </View>
        ) : (
          <View style={styles.badgesGrid}>
            {filteredBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Stats Summary */}
      {user && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.experience}</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalQuests}</Text>
            <Text style={styles.statLabel}>Quests</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  filterContainer: {
    padding: 16,
  },
  progressContainer: {
    backgroundColor: 'white',
    marginTop: 16,
    padding: 16,
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
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
  categoryContainer: {
    marginTop: 16,
  },
  categoryContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryButtonActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#059669',
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#059669',
  },
  badgesContainer: {
    flex: 1,
    marginTop: 16,
  },
  badgesGrid: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  badgeCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
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
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeIconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  badgeIcon: {
    fontSize: 48,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  rarityBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: '#9ca3af',
  },
  badgeDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  badgeDescriptionLocked: {
    color: '#9ca3af',
  },
  unlockDate: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  requirementsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  requirementsText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
    flex: 1,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
}); 