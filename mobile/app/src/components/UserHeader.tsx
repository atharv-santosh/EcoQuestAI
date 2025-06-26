import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

interface UserHeaderProps {
  onGemPress?: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
  title?: string;
}

export default function UserHeader({ 
  onGemPress, 
  showBackButton = false, 
  onBackPress,
  title 
}: UserHeaderProps) {
  const { user } = useAuth();
  const navigation = useNavigation();

  const getLevelProgress = () => {
    if (!user) return 0;
    
    // Ensure we have valid numbers for calculations
    const userLevel = user.level || 1;
    const userExperience = user.experience || 0;
    
    const currentLevelExp = (userLevel - 1) * 100;
    const currentExp = userExperience - currentLevelExp;
    const progress = Math.min((currentExp / 100) * 100, 100);
    
    // Return a valid number, not NaN
    return isNaN(progress) ? 0 : Math.max(0, progress);
  };

  const handleProfilePress = () => {
    // Navigate to the Profile tab
    navigation.navigate('Profile' as never);
  };

  return (
    <LinearGradient colors={['#059669', '#065f46']} style={styles.container}>
      <View style={styles.content}>
        {showBackButton ? (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
            {user?.picture ? (
              <Image 
                source={{ uri: user.picture }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.defaultProfileIcon}>
                <Icon name="person" size={20} color="#6b7280" />
              </View>
            )}
          </TouchableOpacity>
        )}
        
        <View style={styles.userInfo}>
          {title ? (
            <Text style={styles.title}>{title}</Text>
          ) : (
            <>
              <View style={styles.levelContainer}>
                <Icon name="star" size={14} color="#fbbf24" />
                <Text style={styles.levelText}>Level {user?.level || 1}</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${getLevelProgress()}%` }]} 
                  />
                </View>
                <Text style={styles.progressText}>{getLevelProgress()}%</Text>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity 
          style={styles.gemContainer} 
          onPress={onGemPress}
          disabled={!onGemPress}
        >
          <Icon name="diamond" size={18} color="#fbbf24" />
          <Text style={styles.gemText}>{user?.gems || 0}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50, // Account for status bar
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 12,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 160,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginRight: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    minWidth: 25,
  },
  gemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    minWidth: 50,
    justifyContent: 'center',
  },
  gemText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 3,
  },
  defaultProfileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 