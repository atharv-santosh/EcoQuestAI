import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useUser} from '../services/UserProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DevSettings} from 'react-native';

export default function ProfileScreen() {
  const {user} = useUser();

  const handleReset = () => {
    Alert.alert(
      'Reset Account',
      'Are you sure you want to delete all local data and restart?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            console.log('[ProfileScreen] Clearing AsyncStorage and reloading app...');
            await AsyncStorage.clear();
            DevSettings.reload();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {user?.firstName ? `${user.firstName}'s Profile` : 'Profile'}
          </Text>
          <Text style={styles.subtitle}>Your eco-adventure stats</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.comingSoon}>More stats coming soon!</Text>
          <Text style={styles.description}>
            View your profile, stats, and eco-adventure history here.
          </Text>
        </View>

        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Reset Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  resetButton: {
    marginTop: 32,
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 