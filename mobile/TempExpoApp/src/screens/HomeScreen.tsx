import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import {useNavigation} from '@react-navigation/native';
import {useUser} from '../services/UserProvider';
import {getActiveHunt, createHunt} from '../services/api';

const {width} = Dimensions.get('window');

interface Theme {
  id: string;
  title: string;
  description: string;
  image: string;
  gradient: string[];
  duration: string;
  difficulty: string;
  tags: string[];
}

const themes: Theme[] = [
  {
    id: 'urban-nature',
    title: 'Urban Nature Explorer',
    description: 'Discover hidden green spaces and wildlife in the city',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    gradient: ['#059669', '#065f46'],
    duration: '45 min',
    difficulty: 'Easy',
    tags: ['Parks', 'Wildlife', 'Photography'],
  },
  {
    id: 'sustainable-shopping',
    title: 'Sustainable Shopping Quest',
    description: 'Find eco-friendly stores and local sustainable products',
    image: 'https://images.unsplash.com/photo-1573821663912-6df460f9c684?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    gradient: ['#d97706', '#92400e'],
    duration: '60 min',
    difficulty: 'Medium',
    tags: ['Local', 'Eco-friendly', 'Community'],
  },
  {
    id: 'pollinator-hunt',
    title: 'Pollinator Discovery Hunt',
    description: 'Spot and photograph bees, butterflies, and flowering plants',
    image: 'https://images.unsplash.com/photo-1500740516770-92bd004b996e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    gradient: ['#fbbf24', '#f59e0b'],
    duration: '30 min',
    difficulty: 'Easy',
    tags: ['Flowers', 'Bees', 'Nature'],
  },
  {
    id: 'zero-waste-picnic',
    title: 'Zero Waste Picnic Challenge',
    description: 'Plan and execute the perfect eco-friendly outdoor meal',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    gradient: ['#0ea5e9', '#0284c7'],
    duration: '90 min',
    difficulty: 'Medium',
    tags: ['Picnic', 'Sustainable', 'Food'],
  },
];

const themeGradients: Record<string, string[]> = {
  'urban-nature': ['#a8e063', '#56ab2f'],
  'sustainable-shopping': ['#43cea2', '#185a9d'],
  'pollinator-hunt': ['#f7971e', '#ffd200'],
  'zero-waste-picnic': ['#00c6ff', '#0072ff'],
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const {user, isLoading: userLoading} = useUser();
  const [selectedTheme, setSelectedTheme] = useState<string>('urban-nature');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeHunt, setActiveHunt] = useState<any>(null);
  const [loadingHunt, setLoadingHunt] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActiveHunt();
    }
  }, [user]);

  const fetchActiveHunt = async () => {
    setLoadingHunt(true);
    try {
      console.log('Fetching active hunt for user:', user!.id);
      const response = await getActiveHunt(user!.id);
      setActiveHunt(response.data);
      console.log('Active hunt loaded:', response.data);
    } catch (err: any) {
      setActiveHunt(null); // No active hunt
      console.log('No active hunt found or error:', err);
    } finally {
      setLoadingHunt(false);
      console.log('Hunt loading finished');
    }
  };

  useEffect(() => {
    (async () => {
      console.log('Requesting location permissions...');
      let {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        console.error('Location permission denied');
        Alert.alert(
          'Permission Denied',
          'EcoQuestAI needs your location to create local adventures. Please enable it in your settings.',
        );
        return;
      }
      try {
        console.log('Fetching location...');
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        console.log('Location fetched:', location.coords);
      } catch (error) {
        setErrorMsg('Could not fetch location');
        console.error('Location fetch error:', error);
        Alert.alert(
          'Location Error',
          'Could not fetch your location. Please make sure location services are enabled.',
        );
      }
    })();
  }, []);

  const handleGenerateQuest = async () => {
    if (!user) return;
    if (!location) {
      Alert.alert('Location Required', 'Please enable location services to generate your quest.');
      return;
    }
    setIsGenerating(true);
    try {
      console.log('Using location:', location.coords);
      const response = await createHunt({
        theme: selectedTheme,
        location: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
        userId: user.id,
      });
      setActiveHunt(response.data);
      Alert.alert('Quest Created!', 'Your eco-quest is ready.');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create quest.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (userLoading || loadingHunt) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={{marginTop: 16}}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <Text style={styles.greeting}>Welcome{user?.firstName ? `, ${user.firstName}` : ''}!</Text>
        <Text style={styles.subtitle}>Ready for your next eco-adventure?</Text>

        {activeHunt ? (
          <View style={styles.activeQuestCard}>
            <Text style={styles.activeQuestTitle}>{activeHunt.title}</Text>
            <Text style={styles.activeQuestDesc}>{activeHunt.description}</Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('Hunt', {huntId: activeHunt.id})}>
              <Text style={styles.continueButtonText}>Continue Quest</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Choose a Theme</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical: 16}}>
              {themes.map(theme => (
                <TouchableOpacity
                  key={theme.id}
                  style={{marginRight: 16, borderRadius: 20, overflow: 'hidden'}}
                  onPress={() => setSelectedTheme(theme.id)}>
                  <LinearGradient
                    colors={themeGradients[theme.id]}
                    style={[styles.themeCard, selectedTheme === theme.id && styles.themeCardSelected]}
                  >
                    <Icon
                      name="leaf"
                      size={40}
                      color={selectedTheme === theme.id ? '#fff' : '#e0f2f1'}
                      style={{marginBottom: 12}}
                    />
                    <Text style={[styles.themeTitle, {color: '#fff'}]}>{theme.title}</Text>
                    <Text style={[styles.themeDesc, {color: '#e0f2f1'}]}>{theme.description}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.generateButton, (!location || isGenerating) && styles.generateButtonDisabled]}
              onPress={handleGenerateQuest}
              disabled={!location || isGenerating}>
              <LinearGradient 
                colors={(!location || isGenerating) ? ['#9ca3af', '#6b7280'] : ['#10B981', '#059669']} 
                style={styles.generateButtonGradient}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.generateButtonText}>Generate Eco-Quest</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 6,
  },
  welcomeSection: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  themeCard: {
    width: 180,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    padding: 18,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  themeCardSelected: {
    borderColor: '#fff',
    shadowColor: '#059669',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#059669',
  },
  themeDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  generateButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonDisabled: {
    shadowOpacity: 0.05,
    elevation: 1,
  },
  generateButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeQuestCard: {
    backgroundColor: '#e0f2f1',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  activeQuestTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  activeQuestDesc: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
});