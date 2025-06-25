import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Badge } from '../types';

interface BadgeContextType {
  badges: Badge[];
  unlockedBadges: Badge[];
  lockedBadges: Badge[];
  loading: boolean;
  error: string | null;
  unlockBadge: (badgeId: string) => Promise<void>;
  checkBadgeProgress: () => Promise<void>;
  resetBadges: () => Promise<void>;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const useBadge = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error('useBadge must be used within a BadgeProvider');
  }
  return context;
};

interface BadgeProviderProps {
  children: React.ReactNode;
}

export const BadgeProvider: React.FC<BadgeProviderProps> = ({ children }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBadgesFromStorage();
  }, []);

  useEffect(() => {
    saveBadgesToStorage();
  }, [badges]);

  const loadBadgesFromStorage = async () => {
    try {
      const badgesData = await AsyncStorage.getItem('badges');
      if (badgesData) {
        setBadges(JSON.parse(badgesData));
      } else {
        // Initialize with default badges
        const defaultBadges = getDefaultBadges();
        setBadges(defaultBadges);
      }
    } catch (error) {
      console.error('Error loading badges from storage:', error);
      // Initialize with default badges as fallback
      const defaultBadges = getDefaultBadges();
      setBadges(defaultBadges);
    }
  };

  const saveBadgesToStorage = async () => {
    try {
      await AsyncStorage.setItem('badges', JSON.stringify(badges));
    } catch (error) {
      console.error('Error saving badges to storage:', error);
    }
  };

  const getDefaultBadges = (): Badge[] => {
    return [
      {
        id: 'nature_photographer',
        name: 'Nature Photographer',
        description: 'Captured beautiful natural scenes',
        icon: '🌿',
        category: 'nature',
        rarity: 'common',
        unlocked: false,
        requirements: {
          type: 'quests',
          value: 1,
          description: 'Complete 1 nature quest',
        },
      },
      {
        id: 'sustainability_scout',
        name: 'Sustainability Scout',
        description: 'Discovered eco-friendly initiatives',
        icon: '♻️',
        category: 'sustainability',
        rarity: 'rare',
        unlocked: false,
        requirements: {
          type: 'quests',
          value: 1,
          description: 'Complete 1 sustainability quest',
        },
      },
      {
        id: 'urban_explorer',
        name: 'Urban Explorer',
        description: 'Explored hidden city gems',
        icon: '🏙️',
        category: 'exploration',
        rarity: 'epic',
        unlocked: false,
        requirements: {
          type: 'quests',
          value: 1,
          description: 'Complete 1 exploration quest',
        },
      },
      {
        id: 'community_connector',
        name: 'Community Connector',
        description: 'Connected with local community initiatives',
        icon: '🤝',
        category: 'community',
        rarity: 'rare',
        unlocked: false,
        requirements: {
          type: 'quests',
          value: 1,
          description: 'Complete 1 community quest',
        },
      },
      {
        id: 'first_quest',
        name: 'First Steps',
        description: 'Completed your first quest',
        icon: '🎯',
        category: 'special',
        rarity: 'common',
        unlocked: false,
        requirements: {
          type: 'quests',
          value: 1,
          description: 'Complete your first quest',
        },
      },
      {
        id: 'quest_master',
        name: 'Quest Master',
        description: 'Completed 10 quests',
        icon: '👑',
        category: 'special',
        rarity: 'legendary',
        unlocked: false,
        requirements: {
          type: 'quests',
          value: 10,
          description: 'Complete 10 quests',
        },
      },
      {
        id: 'level_5',
        name: 'Level 5 Explorer',
        description: 'Reached level 5',
        icon: '⭐',
        category: 'special',
        rarity: 'rare',
        unlocked: false,
        requirements: {
          type: 'experience',
          value: 400,
          description: 'Reach level 5 (400 XP)',
        },
      },
      {
        id: 'level_10',
        name: 'Level 10 Master',
        description: 'Reached level 10',
        icon: '🌟',
        category: 'special',
        rarity: 'epic',
        unlocked: false,
        requirements: {
          type: 'experience',
          value: 900,
          description: 'Reach level 10 (900 XP)',
        },
      },
    ];
  };

  const unlockBadge = async (badgeId: string) => {
    try {
      setLoading(true);
      setError(null);

      const updatedBadges = badges.map(badge =>
        badge.id === badgeId
          ? {
              ...badge,
              unlocked: true,
              unlockedAt: Date.now(),
            }
          : badge
      );

      setBadges(updatedBadges);
    } catch (error) {
      console.error('Error unlocking badge:', error);
      setError('Failed to unlock badge');
    } finally {
      setLoading(false);
    }
  };

  const checkBadgeProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      // This would typically check against user progress
      // For now, we'll just ensure badges are properly loaded
      const currentBadges = badges.length > 0 ? badges : getDefaultBadges();
      setBadges(currentBadges);
    } catch (error) {
      console.error('Error checking badge progress:', error);
      setError('Failed to check badge progress');
    } finally {
      setLoading(false);
    }
  };

  const resetBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      const resetBadges = badges.map(badge => ({
        ...badge,
        unlocked: false,
        unlockedAt: undefined,
      }));

      setBadges(resetBadges);
    } catch (error) {
      console.error('Error resetting badges:', error);
      setError('Failed to reset badges');
    } finally {
      setLoading(false);
    }
  };

  const unlockedBadges = badges.filter(badge => badge.unlocked);
  const lockedBadges = badges.filter(badge => !badge.unlocked);

  const value: BadgeContextType = {
    badges,
    unlockedBadges,
    lockedBadges,
    loading,
    error,
    unlockBadge,
    checkBadgeProgress,
    resetBadges,
  };

  return (
    <BadgeContext.Provider value={value}>
      {children}
    </BadgeContext.Provider>
  );
}; 