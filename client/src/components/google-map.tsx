import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation, Camera, CheckCircle } from "lucide-react";

interface MapStop {
  id: string;
  title: string;
  description: string;
  location: { lat: number; lng: number };
  address: string;
  type: 'photo' | 'trivia' | 'task';
  challenge: any;
  completed: boolean;
  points: number;
}

interface GoogleMapProps {
  stops: MapStop[];
  userLocation?: { lat: number; lng: number };
  onStopClick?: (stop: MapStop) => void;
  onNavigate?: (stop: MapStop) => void;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export default function GoogleMap({ 
  stops, 
  userLocation, 
  onStopClick, 
  onNavigate,
  className = ""
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(userLocation);

  // Load Google Maps API
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    window.initGoogleMaps = () => {
      setIsLoaded(true);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyBdVl-cTICSwYKrZ-TT9hK6LbOTMWu7T7w'}&callback=initGoogleMaps&libraries=places`;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const center = userLocation || stops[0]?.location || { lat: 40.7128, lng: -74.0060 };
    
    const newMap = new window.google.maps.Map(mapRef.current, {
      zoom: 14,
      center,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMap(newMap);
  }, [isLoaded, userLocation, stops]);

  // Add markers
  useEffect(() => {
    if (!map || !stops.length) return;

    const markers: any[] = [];

    // User location marker
    if (currentLocation) {
      const userMarker = new window.google.maps.Marker({
        position: currentLocation,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        title: 'Your Location'
      });
      markers.push(userMarker);
    }

    // Stop markers
    stops.forEach((stop, index) => {
      const marker = new window.google.maps.Marker({
        position: stop.location,
        map,
        title: stop.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: stop.completed ? '#10B981' : '#F59E0B',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold'
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${stop.title}</h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${stop.description}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="background: ${stop.completed ? '#10B981' : '#F59E0B'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                ${stop.type}
              </span>
              <span style="color: #059669; font-weight: bold;">${stop.points} pts</span>
            </div>
            <button onclick="window.selectStop('${stop.id}')" style="background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px;">
              ${stop.completed ? 'View Details' : 'Start Challenge'}
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markers.push(marker);
    });

    // Set up global callback for stop selection
    (window as any).selectStop = (stopId: string) => {
      const stop = stops.find(s => s.id === stopId);
      if (stop && onStopClick) {
        onStopClick(stop);
      }
    };

    // Fit bounds to show all markers
    if (stops.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      if (currentLocation) bounds.extend(currentLocation);
      stops.forEach(stop => bounds.extend(stop.location));
      map.fitBounds(bounds);
    }

    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [map, stops, currentLocation, onStopClick]);

  // Get current location
  useEffect(() => {
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
        },
        (error) => {
          console.warn('Could not get current location:', error);
        }
      );
    }
  }, [userLocation]);

  if (!isLoaded) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button
          onClick={() => {
            if (currentLocation && map) {
              map.setCenter(currentLocation);
              map.setZoom(16);
            }
          }}
          size="sm"
          className="bg-white text-gray-700 hover:bg-gray-50 shadow-lg"
        >
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Available Stop</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Completed Stop</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}