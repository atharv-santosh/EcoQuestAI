import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useBadge } from '../contexts/BadgeContext';
import { useQuest } from '../contexts/QuestContext';

export default function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { unlockedBadges } = useBadge();
  const { completedQuests, resetQuests } = useQuest();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Data',
      'This will reset all your quests and badges. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetQuests },
      ]
    );
  };

  const getLevelProgress = () => {
    if (!user) return 0;
    const currentLevelExp = (user.level - 1) * 100;
    const currentExp = user.experience - currentLevelExp;
    return Math.min((currentExp / 100) * 100, 100);
  };

  const getNextLevelExp = () => {
    if (!user) return 100;
    const currentLevelExp = (user.level - 1) * 100;
    return user.experience - currentLevelExp;
  };

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    showSwitch = false,
    switchValue = false,
    onSwitchChange = () => {},
    destructive = false 
  }: any) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, destructive && styles.menuIconDestructive]}>
          <Ionicons 
            name={icon} 
            size={24} 
            color={destructive ? '#ef4444' : '#059669'} 
          />
        </View>
        <View style={styles.menuText}>
          <Text style={[styles.menuTitle, destructive && styles.menuTitleDestructive]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.menuSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#e5e7eb', true: '#059669' }}
          thumbColor="#fff"
        />
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: user?.picture }} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>Level {user?.level || 1}</Text>
              <View style={styles.levelProgress}>
                <View
                  style={[styles.levelProgressFill, { width: `${getLevelProgress()}%` }]}
                />
              </View>
              <Text style={styles.levelExp}>{getNextLevelExp()}/100 XP</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#059669" />
            <Text style={styles.statValue}>{unlockedBadges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.statValue}>{completedQuests.length}</Text>
            <Text style={styles.statLabel}>Quests</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>{user?.experience || 0}</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="person"
              title="Edit Profile"
              subtitle="Update your information"
              onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon!')}
            />
            <MenuItem
              icon="shield-checkmark"
              title="Privacy Settings"
              subtitle="Manage your privacy"
              onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon!')}
            />
            <MenuItem
              icon="notifications"
              title="Notifications"
              subtitle="Manage push notifications"
              showSwitch={true}
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>App Settings</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="location"
              title="Location Services"
              subtitle="Enable location tracking"
              showSwitch={true}
              switchValue={locationEnabled}
              onSwitchChange={setLocationEnabled}
            />
            <MenuItem
              icon="help-circle"
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={() => Alert.alert('Coming Soon', 'Help & support will be available soon!')}
            />
            <MenuItem
              icon="information-circle"
              title="About"
              subtitle="App version and information"
              onPress={() => Alert.alert('About', 'EcoQuestAI v1.0.0\nYour eco-adventure companion')}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Data</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="download"
              title="Export Data"
              subtitle="Download your data"
              onPress={() => Alert.alert('Coming Soon', 'Data export will be available soon!')}
            />
            <MenuItem
              icon="refresh"
              title="Reset Progress"
              subtitle="Reset all quests and badges"
              onPress={handleResetData}
              destructive={true}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="log-out"
              title="Sign Out"
              subtitle="Sign out of your account"
              onPress={handleSignOut}
              destructive={true}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>EcoQuestAI v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>Your eco-adventure companion</Text>
        </View>
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
  profileHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  levelContainer: {
    alignItems: 'center',
    width: '100%',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  levelProgress: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  levelExp: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
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
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  menuSection: {
    marginTop: 24,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  menuContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIconDestructive: {
    backgroundColor: '#fef2f2',
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  menuTitleDestructive: {
    color: '#ef4444',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  appInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  appInfoSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
}); 