import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, {Marker} from 'react-native-maps';
import {useRoute, useNavigation} from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../services/UserProvider';

const {width} = Dimensions.get('window');

interface Stop {
  id: string;
  title: string;
  description: string;
  location: {lat: number; lng: number};
  address: string;
  type: 'photo' | 'trivia' | 'task';
  challenge: any;
  completed: boolean;
  points: number;
}

export default function HuntScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [currentStop, setCurrentStop] = useState(0);
  const [completedStops, setCompletedStops] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [photos, setPhotos] = useState<Record<string, {id: number; uri: string}>>(
    {},
  );
  const { user } = useUser();

  // Mock hunt data - replace with actual data from route params
  const huntData = {
    id: 'demo-hunt',
    title: 'Urban Nature Discovery',
    theme: 'urban-nature',
    description: 'Explore hidden green spaces in downtown',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: 'New York, NY'
    },
    stops: [
      {
        id: 'stop-1',
        title: 'Central Park Conservatory Garden',
        description: 'Find the secret entrance to this formal garden',
        location: {lat: 40.7945, lng: -73.9520},
        address: '105th St & 5th Ave',
        type: 'photo',
        challenge: {
          photoPrompt: 'Take a photo of the ornamental fountain'
        },
        completed: false,
        points: 100
      },
      {
        id: 'stop-2',
        title: 'The High Line Wildflowers',
        description: 'Identify native plants along the elevated park',
        location: {lat: 40.7480, lng: -74.0048},
        address: 'High Line Park',
        type: 'trivia',
        challenge: {
          question: 'Which of these plants is native to New York?',
          options: ['Purple Coneflower', 'English Ivy', 'Japanese Knotweed'],
          correctAnswer: 'Purple Coneflower'
        },
        completed: false,
        points: 150
      }
    ] as Stop[]
  };

  // Log user and hunt IDs for debugging
  useEffect(() => {
    console.log('[HuntScreen] Current user ID:', user?.id);
    // If huntData has a userId, log it too (real data only)
    // (Mock huntData does not have userId)
    // if (huntData.userId) {
    //   console.log('[HuntScreen] Quest user ID:', huntData.userId);
    // }
  }, [user]);

  const handleStopComplete = (stopId: string, points: number) => {
    if (!completedStops.includes(stopId)) {
      setCompletedStops([...completedStops, stopId]);
      setTotalPoints(totalPoints + points);
      
      Alert.alert(
        'Stop Completed!',
        `You earned ${points} points!`,
        [
          {
            text: 'Continue',
            onPress: () => {
              if (currentStop < huntData.stops.length - 1) {
                setCurrentStop(currentStop + 1);
              } else {
                Alert.alert(
                  'Quest Complete!',
                  `Congratulations! You earned ${totalPoints + points} total points.`,
                  [{text: 'Return Home', onPress: () => navigation.goBack()}]
                );
              }
            }
          }
        ]
      );
    }
  };

  const handleTakePhoto = async (locationId: string) => {
    const {status} = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'You need to grant camera access to complete photo challenges.',
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      const newPhoto = {
        id: Date.now(),
        uri: result.assets[0].uri,
      };
      setPhotos(prev => ({
        ...prev,
        [locationId]: newPhoto,
      }));
      handleStopComplete(locationId, huntData.stops[currentStop].points);
    }
  };

  const handleTriviaAnswer = (answer: string) => {
    const stop = huntData.stops[currentStop];
    if (answer === stop.challenge.correctAnswer) {
      handleStopComplete(stop.id, stop.points);
    } else {
      Alert.alert('Incorrect', 'Try again!');
    }
  };

  const currentStopData = huntData.stops[currentStop];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#059669', '#065f46']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{huntData.title}</Text>
            <Text style={styles.headerSubtitle}>
              Stop {currentStop + 1} of {huntData.stops.length}
            </Text>
          </View>
          <View style={styles.pointsContainer}>
            <Icon name="diamond" size={16} color="#fbbf24" />
            <Text style={styles.pointsText}>{totalPoints}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: currentStopData.location.lat,
              longitude: currentStopData.location.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}>
            {huntData.stops.map((stop, index) => (
              <Marker
                key={stop.id}
                coordinate={{
                  latitude: stop.location.lat,
                  longitude: stop.location.lng,
                }}
                pinColor={
                  completedStops.includes(stop.id)
                    ? '#059669'
                    : index === currentStop
                    ? '#fbbf24'
                    : '#6b7280'
                }
              />
            ))}
          </MapView>
        </View>

        {/* Current Stop Info */}
        <View style={styles.stopCard}>
          <View style={styles.stopHeader}>
            <View style={styles.stopIconContainer}>
              <Icon
                name={
                  currentStopData.type === 'photo'
                    ? 'camera'
                    : currentStopData.type === 'trivia'
                    ? 'help-circle'
                    : 'checkmark-circle'
                }
                size={24}
                color="#059669"
              />
            </View>
            <View style={styles.stopInfo}>
              <Text style={styles.stopTitle}>{currentStopData.title}</Text>
              <Text style={styles.stopAddress}>{currentStopData.address}</Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>{currentStopData.points}pts</Text>
            </View>
          </View>
          
          <Text style={styles.stopDescription}>{currentStopData.description}</Text>
        </View>

        {/* Challenge Section */}
        <View style={styles.challengeCard}>
          <Text style={styles.challengeTitle}>Your Challenge</Text>
          
          {currentStopData.type === 'photo' && (
            <View style={styles.photoChallenge}>
              <Text style={styles.challengeText}>
                {currentStopData.challenge.photoPrompt}
              </Text>
              {photos[currentStopData.id] ? (
                <Image
                  source={{uri: photos[currentStopData.id].uri}}
                  style={styles.previewImage}
                />
              ) : (
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => handleTakePhoto(currentStopData.id)}>
                  <LinearGradient colors={['#059669', '#065f46']} style={styles.buttonGradient}>
                    <Icon name="camera" size={20} color="white" />
                    <Text style={styles.buttonText}>Take Photo</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

          {currentStopData.type === 'trivia' && (
            <View style={styles.triviaChallenge}>
              <Text style={styles.challengeText}>
                {currentStopData.challenge.question}
              </Text>
              <View style={styles.optionsContainer}>
                {currentStopData.challenge.options.map((option: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionButton}
                    onPress={() => handleTriviaAnswer(option)}>
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Quest Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {width: `${(completedStops.length / huntData.stops.length) * 100}%`}
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedStops.length} of {huntData.stops.length} stops completed
          </Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
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
    paddingVertical: 6,
    borderRadius: 16,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 200,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  stopCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stopIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopInfo: {
    flex: 1,
  },
  stopTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  stopAddress: {
    fontSize: 14,
    color: '#6b7280',
  },
  pointsBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d97706',
  },
  stopDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  challengeCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  photoChallenge: {
    alignItems: 'center',
  },
  challengeText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  cameraButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  triviaChallenge: {},
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
});