import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Maximize2, MapPin, Navigation, Target, CheckCircle, Clock, Route } from "lucide-react";

interface MapComponentProps {
  stops: Array<{
    id: string;
    title: string;
    location: { lat: number; lng: number };
    completed: boolean;
    type?: string;
    points?: number;
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
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setIsLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const completedStops = stops.filter(s => s.completed);
  const progressPercentage = stops.length > 0 ? (completedStops.length / stops.length) * 100 : 0;
  const currentStop = stops.find(stop => !stop.completed);

  // Generate mock route path for visual representation
  const generatePath = () => {
    if (stops.length < 2) return '';
    
    const points = stops.map((_, index) => {
      const x = 20 + (index * 60 / stops.length) + Math.random() * 10;
      const y = 30 + Math.sin(index * 0.5) * 20 + Math.random() * 10;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  return (
    <Card className="overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-nature p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Your EcoQuest Route</h4>
              <p className="text-sm text-white text-opacity-80">
                {stops.length} stops • ~{Math.round(stops.length * 8)} min walk
              </p>
            </div>
          </div>
          
          {onOpenFullMap && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onOpenFullMap}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              Expand
            </Button>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{completedStops.length}/{stops.length} completed</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-white bg-opacity-20"
          />
        </div>
      </div>

      {/* Interactive Map Container */}
      <div className="relative">
        <div 
          ref={mapRef}
          className="w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 relative overflow-hidden"
        >
          {/* Background Map Image */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
              alt="Map view of quest route"
              className={`w-full h-full object-cover transition-all duration-1000 ${
                isLoaded ? 'opacity-30 scale-100' : 'opacity-0 scale-110'
              }`}
            />
          </div>

          {/* Route Path Visualization */}
          {isLoaded && stops.length > 1 && (
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path
                d={generatePath()}
                stroke="url(#routeGradient)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
                filter="url(#glow)"
                className="animate-pulse"
              />
            </svg>
          )}

          {/* Stop Markers */}
          {stops.map((stop, index) => {
            const x = 20 + (index * 60 / stops.length) + Math.random() * 10;
            const y = 30 + Math.sin(index * 0.5) * 20 + Math.random() * 10;
            
            return (
              <div
                key={stop.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                  selectedStop === stop.id ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                } ${
                  isLoaded ? 'animate-scale-in' : 'opacity-0'
                }`}
                style={{ 
                  left: `${x}%`, 
                  top: `${y}%`,
                  animationDelay: `${index * 0.2}s`
                }}
                onClick={() => setSelectedStop(selectedStop === stop.id ? null : stop.id)}
              >
                {/* Marker Pin */}
                <div className={`w-8 h-8 rounded-full border-3 border-white shadow-lg flex items-center justify-center ${
                  stop.completed 
                    ? 'bg-eco-green animate-pulse-soft' 
                    : stop === currentStop
                      ? 'bg-nature-amber animate-pulse'
                      : 'bg-gray-400'
                }`}>
                  {stop.completed ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : stop === currentStop ? (
                    <Target className="w-4 h-4 text-white animate-pulse" />
                  ) : (
                    <MapPin className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Stop Number Badge */}
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700">{index + 1}</span>
                </div>

                {/* Tooltip */}
                {selectedStop === stop.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 animate-scale-in">
                    <div className="bg-white rounded-lg shadow-xl p-3 min-w-48 border">
                      <div className="font-semibold text-gray-900 mb-1">{stop.title}</div>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={stop.completed ? "default" : "secondary"}
                          className={stop.completed ? "bg-eco-green" : ""}
                        >
                          {stop.completed ? 'Completed' : 'Pending'}
                        </Badge>
                        {stop.points && (
                          <span className="text-xs text-nature-amber font-medium">
                            +{stop.points} pts
                          </span>
                        )}
                      </div>
                      <div className="w-3 h-3 bg-white transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b border-gray-200" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* User Location Marker */}
          {userLocation && isLoaded && (
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-float"
              style={{ left: '15%', top: '80%' }}
            >
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg">
                <div className="w-full h-full bg-blue-500 rounded-full animate-ping opacity-75" />
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-sm text-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Navigation className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {currentStop ? `Next: ${currentStop.title}` : 'Quest Complete!'}
                </span>
              </div>
              
              {currentStop && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">~5 min</span>
                </div>
              )}
            </div>
            
            <div className="text-xs font-medium">
              {Math.round(progressPercentage)}% Complete
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-green mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading route...</p>
          </div>
        </div>
      )}
    </Card>
  );
}
