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
import GoogleMap from "@/components/google-map";
import AdventureChallenge from "@/components/adventure-challenge";
import { Camera, Lightbulb, CheckCircle, Clock, MapPin, Coins, Navigation } from "lucide-react";

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-green"></div>
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
              <Clock className="w-4 h-4 inline mr-1" />
              45 min walk
            </span>
          </div>
          <Progress value={progressPercentage} className="mb-2" />
          <p className="text-xs text-gray-500">
            Progress: {hunt.completedStops} of {hunt.stops.length} stops completed
          </p>
        </Card>

        {/* Map */}
        <MapComponent 
          stops={hunt.stops}
          userLocation={hunt.location}
        />

        {/* Current Challenge */}
        {currentStop && hunt.status !== 'completed' && (
          <Card className="bg-gradient-to-r from-eco-green to-forest-green text-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Current Challenge</h4>
              <Badge className="bg-white bg-opacity-20 text-white">
                Stop {hunt.completedStops + 1} of {hunt.stops.length}
              </Badge>
            </div>
            <h5 className="text-lg font-semibold mb-2">{currentStop.title}</h5>
            <p className="text-sm opacity-90 mb-4">{currentStop.description}</p>
            
            {currentStop.type === 'photo' && (
              <div className="flex space-x-3">
                <Button 
                  onClick={() => handleTakePhoto(currentStop.id)}
                  className="bg-white text-eco-green hover:bg-gray-100 flex-1"
                  disabled={completeStopMutation.isPending}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <Button 
                  onClick={() => handleGetHint(currentStop.id)}
                  variant="ghost"
                  className="bg-white bg-opacity-20 text-white hover:bg-white hover:bg-opacity-30"
                  disabled={getHintMutation.isPending}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Hint
                </Button>
              </div>
            )}

            {currentStop.type === 'trivia' && currentStop.challenge.question && (
              <div className="space-y-3">
                <p className="font-medium">{currentStop.challenge.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {currentStop.challenge.options?.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => completeStopMutation.mutate({
                        stopId: currentStop.id,
                        answer: option
                      })}
                      className="bg-white bg-opacity-20 text-white hover:bg-white hover:bg-opacity-30"
                      disabled={completeStopMutation.isPending}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {currentStop.type === 'task' && (
              <div className="flex space-x-3">
                <Button 
                  onClick={() => completeStopMutation.mutate({ stopId: currentStop.id })}
                  className="bg-white text-eco-green hover:bg-gray-100 flex-1"
                  disabled={completeStopMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
                <Button 
                  onClick={() => handleGetHint(currentStop.id)}
                  variant="ghost"
                  className="bg-white bg-opacity-20 text-white hover:bg-white hover:bg-opacity-30"
                  disabled={getHintMutation.isPending}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Hint
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Completed Stops */}
        {completedStops.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Completed Stops</h4>
            
            {completedStops.map((stop) => (
              <Card key={stop.id} className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-sage-green rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{stop.title}</h5>
                    <p className="text-sm text-gray-600 mb-2">{stop.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-sage-green font-medium">
                          <Coins className="w-3 h-3 inline mr-1" />
                          +{stop.points} points
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-eco-green bg-opacity-20 flex items-center justify-center">
                        {stop.type === 'photo' ? (
                          <Camera className="w-5 h-5 text-eco-green" />
                        ) : stop.type === 'trivia' ? (
                          <Lightbulb className="w-5 h-5 text-eco-green" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-eco-green" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Completion Message */}
        {hunt.status === 'completed' && (
          <Card className="p-6 text-center bg-gradient-to-r from-eco-green to-forest-green text-white">
            <h3 className="text-xl font-bold mb-2">Quest Completed! 🎉</h3>
            <p className="mb-4">Congratulations on completing your eco-adventure!</p>
            <div className="text-lg font-semibold">
              Total Points Earned: {hunt.totalPoints}
            </div>
          </Card>
        )}
      </div>

      {/* Photo Capture Modal */}
      <PhotoCapture
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSubmit={handlePhotoSubmit}
        prompt="Capture Your Find"
      />
    </Layout>
  );
}
