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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import {request, PERMISSIONS} from 'react-native-permissions';
import {useNavigation} from '@react-navigation/native';

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

export default function HomeScreen() {
  const navigation = useNavigation();
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userPoints, setUserPoints] = useState(2847);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const granted = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (granted === 'granted') {
        getCurrentLocation();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      error => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const generateHunt = async () => {
    if (!selectedTheme) {
      Alert.alert('Select Theme', 'Please choose an adventure theme first!');
      return;
    }

    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location services to generate your quest.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate API call - replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Navigate to hunt screen with generated hunt
      navigation.navigate('Hunt' as never, {huntId: 'generated-hunt-123'} as never);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate hunt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderThemeCard = (theme: Theme) => (
    <TouchableOpacity
      key={theme.id}
      style={[
        styles.themeCard,
        selectedTheme === theme.id && styles.selectedCard,
      ]}
      onPress={() => setSelectedTheme(theme.id)}
      activeOpacity={0.8}>
      <Image source={{uri: theme.image}} style={styles.themeImage} />
      <LinearGradient
        colors={[...theme.gradient, theme.gradient[0]]}
        style={styles.cardGradient}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Icon name="leaf" size={24} color="white" />
            </View>
            {selectedTheme === theme.id && (
              <Icon name="checkmark-circle" size={24} color="#fbbf24" />
            )}
          </View>
          
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{theme.title}</Text>
            <Text style={styles.cardDescription}>{theme.description}</Text>
          </View>
          
          <View style={styles.cardFooter}>
            <View style={styles.statContainer}>
              <Icon name="time-outline" size={16} color="white" />
              <Text style={styles.statText}>{theme.duration}</Text>
            </View>
            <View style={styles.difficultyContainer}>
              <Text style={styles.difficultyText}>{theme.difficulty}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#059669', '#065f46']} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <Icon name="leaf" size={24} color="white" />
              </View>
              <View>
                <Text style={styles.headerTitle}>EcoQuest AI</Text>
                <Text style={styles.headerSubtitle}>Good morning explorer!</Text>
              </View>
            </View>
            <View style={styles.pointsContainer}>
              <Icon name="diamond" size={16} color="#fbbf24" />
              <Text style={styles.pointsText}>{userPoints.toLocaleString()}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Ready for your next eco-adventure?</Text>
          <Text style={styles.welcomeDescription}>
            Choose a theme and let AI create a personalized treasure hunt in your area!
          </Text>
        </View>

        {/* Theme Selection */}
        <View style={styles.themesSection}>
          <Text style={styles.sectionTitle}>Choose Your Adventure</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themesContainer}>
            {themes.map(renderThemeCard)}
          </ScrollView>
        </View>

        {/* Generate Button */}
        <View style={styles.generateSection}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              !selectedTheme && styles.generateButtonDisabled,
            ]}
            onPress={generateHunt}
            disabled={isGenerating || !selectedTheme}>
            <LinearGradient
              colors={selectedTheme ? ['#059669', '#065f46'] : ['#9ca3af', '#6b7280']}
              style={styles.generateGradient}>
              {isGenerating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.generateButtonText}>Crafting Your Adventure...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Icon name="sparkles" size={20} color="white" />
                  <Text style={styles.generateButtonText}>Generate My EcoQuest</Text>
                  <Icon name="arrow-forward" size={20} color="white" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    paddingVertical: 20,
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
  themesSection: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  themesContainer: {
    paddingRight: 20,
  },
  themeCard: {
    width: width * 0.8,
    height: 200,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedCard: {
    shadowColor: '#059669',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  themeImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    flex: 1,
    padding: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
  },
  difficultyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  generateSection: {
    padding: 20,
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  generateButtonDisabled: {
    shadowOpacity: 0.05,
    elevation: 2,
  },
  generateGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 12,
  },
});