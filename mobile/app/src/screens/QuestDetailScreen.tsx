import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuest } from '../contexts/QuestContext';
import { useLocation } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext';

export default function QuestDetailScreen({ route, navigation }: any) {
  const { questId } = route.params;
  const { quests, submitPhoto, loading } = useQuest();
  const { location } = useLocation();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const quest = quests.find(q => q.id === questId);

  useEffect(() => {
    if (!quest) {
      Alert.alert('Error', 'Quest not found');
      navigation.goBack();
    }
  }, [quest]);

  const handleTakePhoto = () => {
    navigation.navigate('Camera', { questId });
  };

  const handleSubmitPhoto = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please take a photo first');
      return;
    }

    try {
      const success = await submitPhoto(questId, selectedImage);
      if (success) {
        Alert.alert(
          'Success!',
          'Quest completed! You earned ' + quest?.experience + ' XP',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        Alert.alert(
          'Try Again',
          'The photo doesn\'t match the quest requirements. Please try again.',
          [
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit photo. Please try again.');
    }
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

  const calculateDistance = () => {
    if (!location || !quest) return null;
    
    const R = 6371e3; // Earth's radius in meters
    const φ1 = location.latitude * Math.PI / 180;
    const φ2 = quest.location.latitude * Math.PI / 180;
    const Δφ = (quest.location.latitude - location.latitude) * Math.PI / 180;
    const Δλ = (quest.location.longitude - location.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return Math.round(R * c);
  };

  const distance = calculateDistance();
  const isInRange = distance !== null && distance <= quest?.location.radius;

  if (!quest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading quest...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{quest.title}</Text>
            <View style={styles.headerBadges}>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(quest.category) + '20' }]}>
                <Ionicons name={getCategoryIcon(quest.category)} size={16} color={getCategoryColor(quest.category)} />
                <Text style={[styles.categoryText, { color: getCategoryColor(quest.category) }]}>
                  {quest.category}
                </Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quest.difficulty) + '20' }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(quest.difficulty) }]}>
                  {quest.difficulty}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quest Image */}
        {quest.imageUrl && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: quest.imageUrl }} style={styles.questImage} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>Completed</Text>
            </View>
          </View>
        )}

        {/* Quest Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.description}>{quest.description}</Text>
          
          <View style={styles.requirementsSection}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <View style={styles.requirementItem}>
              <Ionicons name="camera" size={20} color="#059669" />
              <Text style={styles.requirementText}>{quest.requirements.description}</Text>
            </View>
          </View>

          <View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>Rewards</Text>
            <View style={styles.rewardItem}>
              <Ionicons name="star" size={20} color="#f59e0b" />
              <Text style={styles.rewardText}>{quest.experience} Experience Points</Text>
            </View>
            {quest.rewards.badges.map((badgeId: string) => (
              <View key={badgeId} style={styles.rewardItem}>
                <Ionicons name="trophy" size={20} color="#8b5cf6" />
                <Text style={styles.rewardText}>Badge: {badgeId.replace('_', ' ')}</Text>
              </View>
            ))}
          </View>

          {/* Location Info */}
          {distance !== null && (
            <View style={styles.locationSection}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={20} color="#059669" />
                <View style={styles.locationDetails}>
                  <Text style={styles.distanceText}>
                    {distance}m away
                  </Text>
                  <Text style={[styles.rangeText, { color: isInRange ? '#10b981' : '#ef4444' }]}>
                    {isInRange ? 'In range' : 'Out of range'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {!quest.completed ? (
          <View style={styles.actionContainer}>
            {selectedImage ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.photoPreview} />
                <View style={styles.photoActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleTakePhoto}
                  >
                    <Ionicons name="camera" size={20} color="#059669" />
                    <Text style={styles.actionButtonText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.submitButton]}
                    onPress={handleSubmitPhoto}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={20} color="#fff" />
                        <Text style={[styles.actionButtonText, styles.submitButtonText]}>Submit</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, !isInRange && styles.primaryButtonDisabled]}
                onPress={handleTakePhoto}
                disabled={!isInRange}
              >
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.primaryButtonText}>
                  {isInRange ? 'Take Photo' : 'Get Closer'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.completedContainer}>
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={48} color="#10b981" />
              <Text style={styles.completedText}>Quest Completed!</Text>
              <Text style={styles.completedSubtext}>
                You earned {quest.experience} XP
              </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginBottom: 12,
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  imageContainer: {
    position: 'relative',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  questImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlayText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  requirementsSection: {
    marginBottom: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  requirementText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  rewardsSection: {
    marginBottom: 24,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  locationSection: {
    marginBottom: 24,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  locationDetails: {
    marginLeft: 12,
  },
  distanceText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  rangeText: {
    fontSize: 14,
    marginTop: 2,
  },
  actionContainer: {
    padding: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  photoPreviewContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#059669',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#fff',
  },
  completedContainer: {
    padding: 20,
  },
  completedBadge: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 32,
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
  completedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 16,
  },
  completedSubtext: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
}); 