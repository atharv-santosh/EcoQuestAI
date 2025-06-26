// TypeScript type definitions for EcoQuestAI

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  level: number;
  experience: number;
  totalQuests: number;
  totalBadges: number;
  gems: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'nature' | 'sustainability' | 'exploration' | 'community';
  difficulty: 'easy' | 'medium' | 'hard';
  experience: number;
  location: {
    latitude: number;
    longitude: number;
    radius: number; // meters
  };
  requirements: {
    type: 'photo' | 'location' | 'action';
    description: string;
    targetImage?: string; // For photo quests
    targetLocation?: {
      latitude: number;
      longitude: number;
      radius: number;
    };
  };
  rewards: {
    badges: string[];
  };
  completed: boolean;
  completedAt?: number;
  imageUrl?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'nature' | 'sustainability' | 'exploration' | 'community' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: number;
  requirements: {
    type: 'quests' | 'experience' | 'location' | 'special';
    value: number;
    description: string;
  };
}

export interface POI {
  id: string;
  title: string;
  description: string;
  type: 'park' | 'garden' | 'landmark' | 'museum' | 'restaurant' | 'shop';
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  rating?: number;
  imageUrl?: string;
}

export interface ImageAnalysisResult {
  success: boolean;
  confidence: number;
  detectedObjects: string[];
  error?: string;
}

export interface QuestRequirement {
  type: 'photo' | 'location' | 'action';
  targetImage?: string;
  targetObjects?: string[];
  targetLocation?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  description: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  QuestDetail: { questId: string; capturedImage?: string };
  Camera: { questId: string };
  Shop: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Hunt: undefined;
  Explore: undefined;
  Badges: undefined;
  Profile: undefined;
};

// Context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export interface LocationContextType {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  startLocationUpdates: () => void;
  stopLocationUpdates: () => void;
  getCurrentLocation: () => Promise<LocationData | null>;
}

export interface QuestContextType {
  quests: Quest[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  loading: boolean;
  error: string | null;
  generateNearbyQuests: () => Promise<void>;
  completeQuest: (questId: string, photoData?: string) => Promise<boolean>;
  submitPhoto: (questId: string, imageBase64: string) => Promise<boolean>;
  resetQuests: () => Promise<void>;
}

export interface BadgeContextType {
  badges: Badge[];
  unlockedBadges: Badge[];
  lockedBadges: Badge[];
  loading: boolean;
  error: string | null;
  unlockBadge: (badgeId: string) => Promise<void>;
  checkBadgeProgress: () => Promise<void>;
  resetBadges: () => Promise<void>;
}

// Component prop types
export interface ScreenProps {
  navigation: any;
  route: any;
}

export interface QuestCardProps {
  quest: Quest;
  onPress: (questId: string) => void;
  isCompleted?: boolean;
}

export interface BadgeCardProps {
  badge: Badge;
  onPress?: (badgeId: string) => void;
}

export interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  destructive?: boolean;
}

// Utility types
export type QuestCategory = Quest['category'];
export type QuestDifficulty = Quest['difficulty'];
export type BadgeCategory = Badge['category'];
export type BadgeRarity = Badge['rarity'];
export type POIType = POI['type']; 