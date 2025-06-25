import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal, TouchableOpacity, ActivityIndicator, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { getPOIs } from '../services/api';
import { useLocation } from '../contexts/LocationContext';

// Conditionally import MapView only on native platforms
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (error) {
    console.log('react-native-maps not available');
  }
}

const { width, height } = Dimensions.get('window');

// POI Types configuration
const POI_TYPES = [
  { key: 'all', label: 'All', icon: 'grid' },
  { key: 'park', label: 'Parks', icon: 'leaf' },
  { key: 'garden', label: 'Gardens', icon: 'flower' },
  { key: 'market', label: 'Markets', icon: 'basket' },
  { key: 'cafe', label: 'Cafes', icon: 'cafe' },
];

// Icon mapping for POI types
const typeIcons: { [key: string]: string } = {
  park: 'leaf',
  garden: 'flower',
  market: 'basket',
  cafe: 'cafe',
};

interface POI {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  type: string;
}

export default function ExploreScreen({ navigation }: any) {
  const { location, requestPermission, startLocationUpdates, stopLocationUpdates } = useLocation();
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const fetchPOIs = async () => {
      setLoading(true);
      try {
        // Try to fetch from backend
        const res = await getPOIs();
        if (res.data && Array.isArray(res.data)) {
          setPois(res.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.log('Using fallback POI data:', err);
        // Fallback to hardcoded data
        setPois([
          {
            id: '1',
            title: 'Central Park Conservatory Garden',
            description: 'A formal garden with beautiful flowers and fountains.',
            lat: 40.7945,
            lng: -73.9520,
            type: 'park',
          },
          {
            id: '2',
            title: 'Green Market',
            description: 'Local farmers market with organic produce.',
            lat: 40.7411,
            lng: -73.9897,
            type: 'market',
          },
          {
            id: '3',
            title: 'Eco-Friendly Cafe',
            description: 'A cafe using only compostable packaging.',
            lat: 40.7306,
            lng: -73.9866,
            type: 'cafe',
          },
          {
            id: '4',
            title: 'Urban Pollinator Garden',
            description: 'A small garden supporting bees and butterflies.',
            lat: 40.7505,
            lng: -73.9934,
            type: 'garden',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPOIs();
  }, []);

  useEffect(() => {
    if (!location) {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (isTracking) {
        stopLocationUpdates();
      }
    };
  }, [isTracking]);

  const handleLocationPermission = async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        'Location Permission Required',
        'This app needs location access to show nearby points of interest.',
        [{ text: 'OK' }]
      );
    }
  };

  const toggleLocationTracking = () => {
    if (isTracking) {
      stopLocationUpdates();
      setIsTracking(false);
    } else {
      startLocationUpdates();
      setIsTracking(true);
    }
  };

  // Ensure pois is always an array and filter properly
  const filteredPOIs = Array.isArray(pois) 
    ? (filter === 'all' ? pois : pois.filter(p => p.type === filter))
    : [];

  const MapPlaceholder = () => (
    <View style={styles.mapPlaceholder}>
      <Icon name="map-outline" size={64} color="#9ca3af" />
      <Text style={styles.mapPlaceholderTitle}>Interactive Map</Text>
      <Text style={styles.mapPlaceholderText}>
        {Platform.OS === 'web'
          ? 'Map view is available on mobile devices'
          : 'Loading map...'}
      </Text>
      {Platform.OS === 'web' && (
        <View style={styles.webFeatures}>
          <View style={styles.featureItem}>
            <Icon name="location" size={24} color="#059669" />
            <Text style={styles.featureText}>Discover nearby POIs</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="camera" size={24} color="#059669" />
            <Text style={styles.featureText}>Find photo opportunities</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="trophy" size={24} color="#059669" />
            <Text style={styles.featureText}>Explore green spaces</Text>
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading eco-spots...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#059669', '#065f46']} style={styles.header}>
        <Text style={styles.title}>Explore Adventures</Text>
        <Text style={styles.subtitle}>Discover eco-quests, green spaces, and sustainable spots near you</Text>
      </LinearGradient>
      
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        {POI_TYPES.map(type => (
          <TouchableOpacity
            key={type.key}
            style={[styles.filterButton, filter === type.key && styles.filterButtonActive]}
            onPress={() => setFilter(type.key)}
            activeOpacity={0.8}
          >
            <Icon name={type.icon} size={20} color={filter === type.key ? '#fff' : '#059669'} />
            <Text style={[styles.filterButtonText, filter === type.key && {color: '#fff'}]}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Map Container */}
      <View style={styles.mapContainer}>
        {MapView && location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
          >
          </MapView>
        ) : (
          <MapPlaceholder />
        )}
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleLocationPermission}
        >
          <Icon name="location" size={24} color="#059669" />
          <Text style={styles.controlButtonText}>Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isTracking && styles.controlButtonActive]}
          onPress={toggleLocationTracking}
        >
          <Icon
            name={isTracking ? 'stop-circle' : 'play-circle'}
            size={24}
            color={isTracking ? '#ef4444' : '#059669'}
          />
          <Text style={[styles.controlButtonText, isTracking && styles.controlButtonTextActive]}>
            {isTracking ? 'Stop' : 'Track'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => navigation.navigate('Hunt')}
        >
          <Icon name="search" size={24} color="#059669" />
          <Text style={styles.controlButtonText}>Quests</Text>
        </TouchableOpacity>
      </View>

      {/* Location Info */}
      {location && (
        <View style={styles.locationInfo}>
          <View style={styles.locationHeader}>
            <Icon name="location" size={16} color="#059669" />
            <Text style={styles.locationTitle}>Current Location</Text>
          </View>
          <Text style={styles.locationText}>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.accuracyText}>
            Accuracy: ±{Math.round(location.accuracy)}m
          </Text>
        </View>
      )}
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
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#bbf7d0',
    lineHeight: 22,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 6,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  mapPlaceholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  webFeatures: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
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
  controlButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  controlButtonActive: {
    backgroundColor: '#fef2f2',
  },
  controlButtonText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
    fontWeight: '600',
  },
  controlButtonTextActive: {
    color: '#ef4444',
  },
  locationInfo: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
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
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  accuracyText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
}); 