import React, { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Layout from "@/components/layout";
import SimpleMap from "@/components/simple-map";
import AdventureChallenge from "@/components/adventure-challenge";
import { Camera, Lightbulb, CheckCircle, Clock, MapPin, Coins, Navigation, Star } from "lucide-react";

export default function Hunt() {
  const { id } = useParams();
  const huntId = parseInt(id || "0");
  const [selectedStop, setSelectedStop] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { toast } = useToast();

  // Get hunt data
  const { data: hunt, isLoading } = useQuery({
    queryKey: ['/api/hunts', huntId],
    enabled: !!huntId,
  });

  // Complete stop mutation
  const completeStopMutation = useMutation({
    mutationFn: async (data: { stopId: string; completed: boolean; photoData?: string }) => {
      const response = await apiRequest("PUT", `/api/hunts/${huntId}/stops/${data.stopId}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/hunts', huntId] });
      setSelectedStop(null);
      toast({
        title: "Challenge Completed!",
        description: "Great work! Keep exploring.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete challenge",
        variant: "destructive"
      });
    }
  });

  // Get hint mutation
  const getHintMutation = useMutation({
    mutationFn: async (stopId: string) => {
      const response = await apiRequest("POST", `/api/hunts/${huntId}/stops/${stopId}/hint`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Hint",
        description: data.hint,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hint",
        description: "Keep exploring! Look around for clues related to nature and sustainability.",
      });
    }
  });

  const handleStopComplete = (stopId: string, data?: any) => {
    completeStopMutation.mutate({
      stopId,
      completed: true,
      photoData: data?.photo
    });
  };

  const handleStopClick = (stop: any) => {
    setSelectedStop(stop);
  };

  const handleNavigate = (stop: any) => {
    const destination = `${stop.location.lat},${stop.location.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
  };

  // Get user location
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.warn('Could not get location:', error)
      );
    }
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  if (!hunt) {
    return (
      <Layout>
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Hunt Not Found</h2>
          <p className="text-gray-600">The requested hunt could not be found.</p>
        </Card>
      </Layout>
    );
  }

  if (!hunt.stops || !Array.isArray(hunt.stops)) {
    return (
      <Layout>
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Hunt Data</h2>
          <p className="text-gray-600">This hunt has invalid data. Please try creating a new adventure.</p>
        </Card>
      </Layout>
    );
  }

  const completedStops = hunt.stops.filter((stop: any) => stop.completed);
  const progressPercentage = hunt.stops.length > 0 ? (completedStops.length / hunt.stops.length) * 100 : 0;
  const totalPoints = hunt.stops.reduce((sum: number, stop: any) => sum + stop.points, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hunt Header */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{hunt.title}</h3>
            <Badge className="bg-emerald-600 text-white">
              {progressPercentage === 100 ? 'Completed' : 'Active'}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>
              <MapPin className="w-4 h-4 inline mr-1" />
              {hunt.location?.address || 'Adventure Location'}
            </span>
            <span>
              <Coins className="w-4 h-4 inline mr-1" />
              {totalPoints} points total
            </span>
          </div>
          <Progress value={progressPercentage} className="mb-2" />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{completedStops.length} of {hunt.stops.length} stops completed</span>
            <span>{Math.round(progressPercentage)}% complete</span>
          </div>
        </Card>

        {/* Map */}
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Adventure Map</h4>
          <SimpleMap 
            stops={hunt.stops} 
            userLocation={userLocation}
            onStopClick={handleStopClick}
            className="w-full"
          />
        </Card>

        {/* Selected Challenge */}
        {selectedStop && (
          <AdventureChallenge
            stop={selectedStop}
            onComplete={handleStopComplete}
            onNavigate={handleNavigate}
          />
        )}

        {/* All Stops */}
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Adventure Stops ({hunt.stops.length})</h4>
          <div className="space-y-3">
            {hunt.stops.map((stop: any, index: number) => (
              <div 
                key={stop.id} 
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  stop.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => handleStopClick(stop)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      stop.completed ? 'bg-green-600' : 'bg-gray-400'
                    }`}>
                      {stop.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{stop.title}</p>
                      <p className="text-xs text-gray-600">{stop.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {stop.points} pts
                    </Badge>
                    {stop.type === 'photo' && <Camera className="w-4 h-4 text-blue-600" />}
                    {stop.type === 'trivia' && <Star className="w-4 h-4 text-purple-600" />}
                    {stop.type === 'task' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    <Navigation className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}