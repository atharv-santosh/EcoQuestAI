import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Layout from "@/components/layout";
import ThemeCard from "@/components/theme-card";
import { getCurrentLocation } from "@/lib/geolocation";
import { Wand2, Leaf, Route, Medal } from "lucide-react";

const themes = [
  {
    id: 'urban-nature',
    title: 'Urban Nature',
    description: 'Discover hidden green spaces in the city',
    stops: '5-7 stops'
  },
  {
    id: 'sustainable-shopping',
    title: 'Sustainable Shopping',
    description: 'Find eco-friendly local businesses',
    stops: '6-8 stops'
  },
  {
    id: 'pollinator-hunt',
    title: 'Pollinator Hunt',
    description: 'Spot bees, butterflies & native flowers',
    stops: '5-6 stops'
  },
  {
    id: 'zero-waste-picnic',
    title: 'Zero-Waste Picnic',
    description: 'Create the perfect sustainable picnic',
    stops: '4-6 stops'
  }
];

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  // Create or get demo user
  useEffect(() => {
    const createDemoUser = async () => {
      try {
        const response = await apiRequest("POST", "/api/users/demo");
        const user = await response.json();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error creating demo user:", error);
      }
    };

    createDemoUser();
  }, []);

  // Get user location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation({
          lat: location.latitude,
          lng: location.longitude
        });
      } catch (error) {
        console.error("Location error:", error);
        toast({
          title: "Location Access",
          description: "Please enable location services for the best experience.",
          variant: "destructive"
        });
      }
    };

    getLocation();
  }, [toast]);

  // Check for active hunt
  const { data: activeHunt } = useQuery({
    queryKey: ['/api/hunts/active', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  // Get user profile
  const { data: userProfile } = useQuery({
    queryKey: ['/api/users', currentUser?.id, 'profile'],
    enabled: !!currentUser?.id,
  });

  // Generate hunt mutation
  const generateHuntMutation = useMutation({
    mutationFn: async (data: { theme: string; location: { lat: number; lng: number }; userId: number }) => {
      const response = await apiRequest("POST", "/api/hunts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hunts/active'] });
      toast({
        title: "Quest Generated!",
        description: "Your eco-adventure is ready to begin.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate your quest. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleGenerateHunt = () => {
    if (!selectedTheme) {
      toast({
        title: "Select a Theme",
        description: "Please choose an adventure theme first!",
        variant: "destructive"
      });
      return;
    }

    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Please enable location services to generate your quest.",
        variant: "destructive"
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "User Error",
        description: "Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }

    generateHuntMutation.mutate({
      theme: selectedTheme,
      location: userLocation,
      userId: currentUser.id
    });
  };

  if (activeHunt) {
    return (
      <Layout userPoints={userProfile?.user?.points || 0}>
        <div className="text-center space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              You have an active quest!
            </h2>
            <p className="text-gray-600 mb-4">
              Continue your {activeHunt.title} adventure
            </p>
            <Link href={`/hunt/${activeHunt.id}`}>
              <Button className="w-full">
                Continue Quest
              </Button>
            </Link>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userPoints={userProfile?.user?.points || 0}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <section className="text-center mb-8">
          <div className="mb-4">
            <img 
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400" 
              alt="Person exploring nature with smartphone" 
              className="w-full h-48 object-cover rounded-2xl shadow-lg" 
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ready for your next eco-adventure?
          </h2>
          <p className="text-gray-600 text-sm">
            Choose a theme and let AI create a personalized treasure hunt in your area!
          </p>
        </section>

        {/* Theme Selection */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Choose Your Adventure Theme
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {themes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme.id}
                title={theme.title}
                description={theme.description}
                stops={theme.stops}
                selected={selectedTheme === theme.id}
                onClick={() => setSelectedTheme(theme.id)}
              />
            ))}
          </div>
        </section>

        {/* Recent Achievements */}
        {userProfile?.achievements && userProfile.achievements.length > 0 && (
          <section>
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Achievements
              </h3>
              <div className="space-y-3">
                {userProfile.achievements.slice(0, 2).map((achievement: any) => (
                  <div key={achievement.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-nature-amber bg-opacity-20 rounded-full flex items-center justify-center">
                      <Medal className="w-5 h-5 text-nature-amber" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        {/* Generate Hunt Button */}
        <section className="pt-6">
          <Button 
            onClick={handleGenerateHunt}
            disabled={generateHuntMutation.isPending}
            className="w-full bg-gradient-to-r from-eco-green to-forest-green text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            {generateHuntMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Your EcoQuest...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generate My EcoQuest
              </>
            )}
          </Button>
          <p className="text-center text-xs text-gray-500 mt-2">
            AI will create a personalized route based on your location
          </p>
        </section>
      </div>
    </Layout>
  );
}
