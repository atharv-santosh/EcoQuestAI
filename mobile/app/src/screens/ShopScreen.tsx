import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Animated,
  Dimensions,
  Modal,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';
import UserHeader from '../components/UserHeader';

const { width } = Dimensions.get('window');

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  type: 'gems' | 'boost' | 'special' | 'roll';
}

interface ProfileIcon {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Randomize the order of icons for variety
const profileIcons: ProfileIcon[] = [
  { id: '1', name: 'Adventurer', icon: 'person', rarity: 'common' as const },
  { id: '2', name: 'Explorer', icon: 'compass', rarity: 'common' as const },
  { id: '3', name: 'Nature Lover', icon: 'leaf', rarity: 'common' as const },
  { id: '4', name: 'Eco Warrior', icon: 'shield', rarity: 'rare' as const },
  { id: '5', name: 'Forest Guardian', icon: 'leaf-outline', rarity: 'rare' as const },
  { id: '6', name: 'Ocean Protector', icon: 'water', rarity: 'rare' as const },
  { id: '7', name: 'Earth Defender', icon: 'planet', rarity: 'epic' as const },
  { id: '8', name: 'Climate Hero', icon: 'sunny', rarity: 'epic' as const },
  { id: '9', name: 'Sustainability Master', icon: 'refresh', rarity: 'legendary' as const },
  { id: '10', name: 'Eco Legend', icon: 'star', rarity: 'legendary' as const },
].sort(() => Math.random() - 0.5); // Randomize order

// Create a continuous loop by duplicating the array multiple times
const continuousProfileIcons = [...profileIcons, ...profileIcons, ...profileIcons, ...profileIcons, ...profileIcons];

const shopItems: ShopItem[] = [
  {
    id: 'gems-50',
    name: '50 Gems',
    description: 'Perfect for quest management',
    price: 0.99,
    icon: 'diamond',
    type: 'gems',
  },
  {
    id: 'gems-150',
    name: '150 Gems',
    description: 'Most popular choice',
    price: 2.99,
    icon: 'diamond',
    type: 'gems',
  },
  {
    id: 'gems-500',
    name: '500 Gems',
    description: 'Best value for money',
    price: 7.99,
    icon: 'diamond',
    type: 'gems',
  },
  {
    id: 'quest-boost',
    name: 'Quest Boost',
    description: 'Double XP for 1 hour',
    price: 25,
    icon: 'flash',
    type: 'boost',
  },
  {
    id: 'profile-icon-roll',
    name: 'Profile Icon',
    description: 'Roll for a random profile icon',
    price: 50,
    icon: 'person-circle',
    type: 'roll',
  },
];

export default function ShopScreen({ navigation }: any) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [showRollModal, setShowRollModal] = useState(false);
  const [currentIcon, setCurrentIcon] = useState(0);
  const [unlockedIcons, setUnlockedIcons] = useState<string[]>([]);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load unlocked icons from storage (placeholder for now)
    setUnlockedIcons(['1']); // Start with first icon unlocked
  }, []);

  const handleProfileIconRoll = () => {
    console.log('Roll button pressed!'); // Debug log
    if (!user || isRolling) {
      console.log('User not available or already rolling'); // Debug log
      return;
    }
    
    console.log('User gems:', user.gems); // Debug log
    
    if ((user.gems || 0) < 50) {
      Alert.alert('Insufficient Gems', 'You need 50 gems to roll for a profile icon.');
      return;
    }

    console.log('Starting roll animation...'); // Debug log
    setIsRolling(true);
    
    // Generate random result from the original profile icons
    const randomIndex = Math.floor(Math.random() * profileIcons.length);
    const resultIcon = profileIcons[randomIndex];
    
    // Calculate final position to center the result
    // Since we have 5 copies of the array, we can land on any copy
    const copyIndex = Math.floor(Math.random() * 5); // Random copy (0-4)
    const itemWidth = 80;
    const windowWidth = width - 40; // Modal content width
    const centerOffset = windowWidth / 2 - itemWidth / 2;
    const finalPosition = -((copyIndex * profileIcons.length + randomIndex) * itemWidth) + centerOffset;
    
    console.log('Final position:', finalPosition); // Debug log
    
    // Reset scroll position first
    scrollX.setValue(0);
    
    // Animate the rolling with longer duration and smoother animation
    Animated.sequence([
      // Initial fast scrolling phase
      Animated.timing(scrollX, {
        toValue: -4000, // Scroll far to the left
        duration: 3000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Continue scrolling in same direction
      Animated.timing(scrollX, {
        toValue: -6000, // Continue scrolling
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Slow down and stop at result
      Animated.timing(scrollX, {
        toValue: finalPosition,
        duration: 2000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('Animation complete!'); // Debug log
      // Roll complete
      setIsRolling(false);
      
      // Update user gems
      updateUser({
        gems: (user.gems || 0) - 50,
      });
      
      // Add to unlocked icons if not already unlocked
      if (!unlockedIcons.includes(resultIcon.id)) {
        setUnlockedIcons([...unlockedIcons, resultIcon.id]);
      }
      
      // Show result
      Alert.alert(
        'Roll Complete!',
        `You got: ${resultIcon.name} (${resultIcon.rarity})!`,
        [{ text: 'OK' }]
      );
    });
  };

  const handlePurchase = async (item: ShopItem) => {
    if (!user) return;

    if (item.type === 'roll') {
      setShowRollModal(true);
      return;
    }

    setLoading(true);
    try {
      // For now, simulate purchase success
      // Later this will integrate with payment system
      
      let newGems = user.gems;
      let newExperience = user.experience;
      let newLevel = user.level;

      switch (item.type) {
        case 'gems':
          // This would be a real purchase in production
          Alert.alert(
            'Coming Soon',
            'Payment system will be implemented soon!',
            [{ text: 'OK' }]
          );
          return;
        
        case 'boost':
          if (user.gems >= item.price) {
            newGems -= item.price;
            newExperience += 50; // Bonus XP
            newLevel = Math.floor(newExperience / 100) + 1;
            Alert.alert('Quest Boost Activated!', 'You have 1 hour of double XP!');
          } else {
            Alert.alert('Insufficient Gems', 'You need more gems to purchase this item.');
            return;
          }
          break;
      }

      updateUser({
        gems: newGems,
        experience: newExperience,
        level: newLevel,
      });

      Alert.alert('Purchase Successful!', `You bought ${item.name}!`);
    } catch (error) {
      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'diamond':
        return 'diamond';
      case 'flash':
        return 'flash';
      case 'trophy':
        return 'trophy';
      case 'person-circle':
        return 'person-circle';
      default:
        return 'star';
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'gems':
        return '#8b5cf6';
      case 'boost':
        return '#f59e0b';
      case 'special':
        return '#ef4444';
      case 'roll':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

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

  // Calculate opacity and scale based on position
  const getIconStyle = (index: number) => {
    const centerX = width / 2;
    const iconCenterX = index * 80 + 40; // Center of each icon
    const distanceFromCenter = Math.abs(centerX - iconCenterX);
    const maxDistance = width / 2;
    
    // Opacity: 0.3 at edges, 1.0 at center
    const opacity = Math.max(0.3, 1 - (distanceFromCenter / maxDistance) * 0.7);
    
    // Scale: 0.7 at edges, 1.3 at center (more dramatic scaling)
    const scale = 0.7 + (1 - (distanceFromCenter / maxDistance)) * 0.6;
    
    return {
      opacity,
      transform: [{ scale }],
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <UserHeader showBackButton={true} onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gem Packages</Text>
          <Text style={styles.sectionDescription}>
            Buy gems to manage your quests and unlock special features
          </Text>
        </View>

        {shopItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemCard}
            onPress={() => handlePurchase(item)}
            disabled={loading}
          >
            <View style={styles.itemHeader}>
              <View style={[styles.itemIcon, { backgroundColor: getItemColor(item.type) + '20' }]}>
                <Icon name={getItemIcon(item.icon)} size={24} color={getItemColor(item.type)} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
              <View style={styles.itemPrice}>
                {item.type === 'gems' ? (
                  <Text style={styles.priceText}>${item.price}</Text>
                ) : (
                  <View style={styles.gemPrice}>
                    <Icon name="diamond" size={16} color="#fbbf24" />
                    <Text style={styles.gemPriceText}>{item.price}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <View style={styles.infoItem}>
            <Icon name="diamond" size={16} color="#fbbf24" />
            <Text style={styles.infoText}>Use gems to delete unwanted quests</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="flash" size={16} color="#f59e0b" />
            <Text style={styles.infoText}>Boost your XP gain temporarily</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="person-circle" size={16} color="#10b981" />
            <Text style={styles.infoText}>Unlock unique profile icons</Text>
          </View>
        </View>
      </ScrollView>

      {/* Gacha Modal */}
      <Modal
        visible={showRollModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRollModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Icon Gacha</Text>
              <TouchableOpacity
                onPress={() => setShowRollModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.gachaContainer}>
              <View style={styles.gachaWindow}>
                {/* Red triangle indicator */}
                <View style={styles.triangleIndicator} />
                
                <Animated.View 
                  style={[
                    styles.gachaScroll,
                    {
                      transform: [{ translateX: scrollX }]
                    }
                  ]}
                >
                  {continuousProfileIcons.map((icon, index) => (
                    <View key={`${icon.id}-${index}`} style={[styles.gachaItem, getIconStyle(index)]}>
                      <View style={[
                        styles.iconContainer,
                        { borderColor: getRarityColor(icon.rarity) }
                      ]}>
                        <Icon 
                          name={icon.icon as any} 
                          size={32} 
                          color={getRarityColor(icon.rarity)} 
                        />
                      </View>
                      <Text style={styles.iconName}>{icon.name}</Text>
                      <Text style={[styles.rarityText, { color: getRarityColor(icon.rarity) }]}>
                        {icon.rarity}
                      </Text>
                    </View>
                  ))}
                </Animated.View>
              </View>

              <TouchableOpacity
                style={[styles.rollButton, isRolling && styles.rollButtonDisabled]}
                onPress={handleProfileIconRoll}
                disabled={isRolling || (user?.gems || 0) < 50}
              >
                <Icon name="diamond" size={20} color="white" />
                <Text style={styles.rollButtonText}>
                  {isRolling ? 'Rolling...' : 'Roll for Icon (50 Gems)'}
                </Text>
              </TouchableOpacity>

              <View style={styles.gachaInfo}>
                <Text style={styles.gachaInfoText}>
                  Unlocked Icons: {unlockedIcons.length}/{profileIcons.length}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  gemPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gemPriceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginLeft: 4,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: width - 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  closeButton: {
    padding: 4,
  },
  gachaContainer: {
    alignItems: 'center',
  },
  gachaWindow: {
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
    width: '100%',
  },
  triangleIndicator: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ef4444',
    zIndex: 10,
  },
  gachaScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: (width - 40) / 2 - 40,
  },
  gachaItem: {
    width: 80,
    alignItems: 'center',
    marginHorizontal: 0,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  rarityText: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  rollButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
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
  rollButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  rollButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  gachaInfo: {
    alignItems: 'center',
  },
  gachaInfoText: {
    fontSize: 12,
    color: '#6b7280',
  },
}); 