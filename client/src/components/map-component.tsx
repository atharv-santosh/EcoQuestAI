import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";

interface MapComponentProps {
  stops: Array<{
    id: string;
    title: string;
    location: { lat: number; lng: number };
    completed: boolean;
  }>;
  userLocation?: { lat: number; lng: number };
  onOpenFullMap?: () => void;
}

export default function MapComponent({ 
  stops = [], 
  userLocation,
  onOpenFullMap 
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize map with Google Maps or fallback to static image
    if (mapRef.current) {
      // For now, we'll use a placeholder since Google Maps requires API key
      // In production, this would initialize Google Maps with the stops as markers
      
      // Example of what would be implemented:
      // const map = new google.maps.Map(mapRef.current, {
      //   center: userLocation || stops[0]?.location,
      //   zoom: 15
      // });
      
      // Add markers for each stop
      // stops.forEach(stop => {
      //   new google.maps.Marker({
      //     position: stop.location,
      //     map: map,
      //     title: stop.title,
      //     icon: stop.completed ? completedIcon : pendingIcon
      //   });
      // });
    }
  }, [stops, userLocation]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Your Route</h4>
        {onOpenFullMap && (
          <Button variant="ghost" size="sm" onClick={onOpenFullMap}>
            <Maximize2 className="w-4 h-4 mr-1" />
            Full Map
          </Button>
        )}
      </div>
      
      <div 
        ref={mapRef}
        className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden"
      >
        {/* Placeholder map image - in production this would be Google Maps */}
        <img 
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
          alt="Map view of quest route"
          className="w-full h-full object-cover rounded-lg"
        />
        
        {/* Overlay with stop count */}
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium">
          {stops.filter(s => s.completed).length} of {stops.length} stops completed
        </div>
      </div>
    </Card>
  );
}
