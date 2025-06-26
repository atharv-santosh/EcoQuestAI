import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocation } from './LocationContext';
import { useAuth } from './AuthContext';
import { Quest, ImageAnalysisResult, QuestRequirement } from '../types';
import { aiService } from '../services/aiService';

interface QuestContextType {
  quests: Quest[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  loading: boolean;
  error: string | null;
  generateNearbyQuests: () => Promise<void>;
  completeQuest: (questId: string, photoData?: string) => Promise<boolean>;
  submitPhoto: (questId: string, imageBase64: string) => Promise<boolean>;
  resetQuests: () => Promise<void>;
  deleteQuest: (questId: string) => Promise<boolean>;
  canGenerateQuests: () => boolean;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export const useQuest = () => {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error('useQuest must be used within a QuestProvider');
  }
  return context;
};

interface QuestProviderProps {
  children: React.ReactNode;
}

export const QuestProvider: React.FC<QuestProviderProps> = ({ children }) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { location } = useLocation();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    loadQuestsFromStorage();
  }, []);

  useEffect(() => {
    if (user) {
      saveQuestsToStorage();
    }
  }, [quests, user]);

  // Generate quests when user and location are available
  useEffect(() => {
    if (user && location && quests.length === 0) {
      console.log('Generating quests for user:', user.id, 'at location:', location);
      generateNearbyQuests();
    }
  }, [user, location]);

  // Also generate quests when user changes (in case location was already available)
  useEffect(() => {
    if (user && location && quests.length === 0) {
      console.log('User changed, generating quests');
      generateNearbyQuests();
    }
  }, [user]);

  const loadQuestsFromStorage = async () => {
    try {
      const questsData = await AsyncStorage.getItem('quests');
      if (questsData) {
        setQuests(JSON.parse(questsData));
      }
    } catch (error) {
      console.error('Error loading quests from storage:', error);
    }
  };

  const saveQuestsToStorage = async () => {
    try {
      await AsyncStorage.setItem('quests', JSON.stringify(quests));
    } catch (error) {
      console.error('Error saving quests to storage:', error);
    }
  };

  const generateNearbyQuests = async () => {
    if (!location || !user) return;

    // Check if we already have 3 active quests
    if (activeQuests.length >= 3) {
      setError('You can only have 3 active quests at a time. Complete or delete some quests first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Generate mock quests for now
      const mockQuests = generateMockQuests(location);
      
      // Only add quests up to the limit of 3
      const questsToAdd = mockQuests.slice(0, 3 - activeQuests.length);
      setQuests([...quests, ...questsToAdd]);
    } catch (error) {
      console.error('Error generating nearby quests:', error);
      setError('Failed to generate quests');
    } finally {
      setLoading(false);
    }
  };

  const generateMockQuests = (userLocation: { latitude: number; longitude: number }): Quest[] => {
    const questTemplates = [
      {
        title: 'Nature Photographer',
        description: 'Find and photograph a beautiful tree or plant in your area. Look for interesting shapes, colors, or textures that make it unique.',
        category: 'nature' as const,
        difficulty: 'easy' as const,
        experience: 50,
        requirements: {
          type: 'photo' as const,
          description: 'Take a photo of a tree or plant',
        },
        rewards: {
          badges: ['nature_photographer'],
        },
      },
      {
        title: 'Sustainability Scout',
        description: 'Look for sustainable practices in your community. Find recycling bins, solar panels, or other eco-friendly initiatives.',
        category: 'sustainability' as const,
        difficulty: 'medium' as const,
        experience: 75,
        requirements: {
          type: 'photo' as const,
          description: 'Photograph a sustainable feature',
        },
        rewards: {
          badges: ['sustainability_scout'],
        },
      },
      {
        title: 'Urban Explorer',
        description: 'Discover a hidden gem in your city. Find a unique landmark, street art, or interesting architecture.',
        category: 'exploration' as const,
        difficulty: 'hard' as const,
        experience: 100,
        requirements: {
          type: 'photo' as const,
          description: 'Capture a unique urban feature',
        },
        rewards: {
          badges: ['urban_explorer'],
        },
      },
    ];

    return questTemplates.map((template, index) => ({
      id: `quest-${Date.now()}-${index}`,
      ...template,
      location: {
        latitude: userLocation.latitude + (Math.random() - 0.5) * 0.01,
        longitude: userLocation.longitude + (Math.random() - 0.5) * 0.01,
        radius: 500 + Math.random() * 500,
      },
      completed: false,
    }));
  };

  const completeQuest = async (questId: string, photoData?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const quest = quests.find(q => q.id === questId);
      if (!quest) {
        setError('Quest not found');
        return false;
      }

      // Update quest as completed
      const updatedQuests = quests.map(q =>
        q.id === questId
          ? {
              ...q,
              completed: true,
              completedAt: Date.now(),
              imageUrl: photoData,
            }
          : q
      );

      setQuests(updatedQuests);

      // Update user stats
      const newExperience = user.experience + quest.experience;
      const newLevel = Math.floor(newExperience / 100) + 1;
      const newTotalQuests = user.totalQuests + 1;

      updateUser({
        experience: newExperience,
        level: newLevel,
        totalQuests: newTotalQuests,
      });

      return true;
    } catch (error) {
      console.error('Error completing quest:', error);
      setError('Failed to complete quest');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitPhoto = async (questId: string, imageBase64: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const quest = quests.find(q => q.id === questId);
      if (!quest) {
        setError('Quest not found');
        return false;
      }

      // Analyze image using AI service
      const requirement: QuestRequirement = {
        type: 'photo',
        description: quest.requirements.description,
      };

      const analysis: ImageAnalysisResult = await aiService.analyzeImage(imageBase64, requirement);

      if (analysis.success && analysis.confidence > 70) {
        // Quest completed successfully
        return await completeQuest(questId, imageBase64);
      } else {
        setError('Photo does not match quest requirements. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error submitting photo:', error);
      setError('Failed to analyze photo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetQuests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Reset all quests to incomplete
      const resetQuests = quests.map(quest => ({
        ...quest,
        completed: false,
        completedAt: undefined,
        imageUrl: undefined,
      }));

      setQuests(resetQuests);

      // Reset user stats
      if (user) {
        updateUser({
          experience: 0,
          level: 1,
          totalQuests: 0,
        });
      }
    } catch (error) {
      console.error('Error resetting quests:', error);
      setError('Failed to reset quests');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuest = async (questId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const updatedQuests = quests.filter(q => q.id !== questId);
      setQuests(updatedQuests);

      // Update user stats - deduct 5 gems
      if (user) {
        updateUser({
          gems: user.gems - 5,
        });
      }

      return true;
    } catch (error) {
      console.error('Error deleting quest:', error);
      setError('Failed to delete quest');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const activeQuests = quests.filter(quest => !quest.completed);
  const completedQuests = quests.filter(quest => quest.completed);

  const canGenerateQuests = (): boolean => {
    return Boolean(user && location && activeQuests.length < 3);
  };

  const value: QuestContextType = {
    quests,
    activeQuests,
    completedQuests,
    loading,
    error,
    generateNearbyQuests,
    completeQuest,
    submitPhoto,
    resetQuests,
    deleteQuest,
    canGenerateQuests,
  };

  return (
    <QuestContext.Provider value={value}>
      {children}
    </QuestContext.Provider>
  );
}; 