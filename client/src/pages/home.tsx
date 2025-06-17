import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Layout from "@/components/layout";
import ThemeCard from "@/components/theme-card";
import { getCurrentLocation } from "@/lib/geolocation";
import { Wand2, Leaf, Route, Medal, MapPin, Users, Zap, TrendingUp, Star, Target, Award, Calendar } from "lucide-react";

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
      <div className="space-y-8">
        {/* Hero Section with Dynamic Stats */}
        <section className="relative">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400" 
              alt="Person exploring nature with smartphone" 
              className="w-full h-64 object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            
            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2 drop-shadow-lg">
                  Ready for your next eco-adventure?
                </h2>
                <p className="text-white/90 text-sm drop-shadow">
                  Choose a theme and let AI create a personalized treasure hunt in your area!
                </p>
              </div>
              
              {/* Live Stats */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <div className="glass px-3 py-2 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-nature-amber" />
                      <span className="text-sm font-medium">1.2k+ explorers</span>
                    </div>
                  </div>
                  <div className="glass px-3 py-2 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-eco-green" />
                      <span className="text-sm font-medium">500+ locations</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-nature-amber fill-current" />
                  ))}
                  <span className="text-sm ml-1">4.9</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Dashboard */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { icon: Target, label: 'Quests', value: userProfile?.stats?.totalHunts || 0, color: 'text-eco-green' },
            { icon: Award, label: 'Badges', value: userProfile?.achievements?.length || 0, color: 'text-nature-amber' },
            { icon: TrendingUp, label: 'Points', value: userProfile?.user?.points || 0, color: 'text-sunset-orange' }
          ].map((stat, index) => (
            <Card key={index} className="p-4 glass border-0 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-2xl bg-white bg-opacity-20 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</div>
                <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
              </div>
            </Card>
          ))}
        </section>

        {/* Theme Selection with Enhanced Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Choose Your Adventure
            </h3>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-nature-amber animate-pulse" />
              <span className="text-sm text-gray-600 font-medium">AI Powered</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {themes.map((theme, index) => (
              <div 
                key={theme.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <ThemeCard
                  theme={theme.id}
                  title={theme.title}
                  description={theme.description}
                  stops={theme.stops}
                  selected={selectedTheme === theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Progress & Achievements Section */}
        {userProfile?.achievements && userProfile.achievements.length > 0 && (
          <section>
            <Card className="p-6 bg-gradient-to-r from-eco-green/10 to-forest-green/10 border-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Achievements
                </h3>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">This week</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {userProfile.achievements.slice(0, 2).map((achievement: any, index: number) => (
                  <div 
                    key={achievement.id} 
                    className="flex items-center space-x-4 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-nature rounded-2xl flex items-center justify-center shadow-lg">
                        <Medal className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-nature-amber rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 mb-1">{achievement.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-nature-amber font-medium">+50 XP</span>
                        <span className="text-xs text-gray-500">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Progress value={85} className="w-16 h-2 mb-1" />
                      <span className="text-xs text-gray-500">Level 5</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        {/* Enhanced Generate Button */}
        <section className="pt-4">
          <div className="relative">
            <Button 
              onClick={handleGenerateHunt}
              disabled={generateHuntMutation.isPending || !selectedTheme}
              className={`w-full py-6 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 transform ${
                selectedTheme 
                  ? 'bg-gradient-to-r from-eco-green via-forest-green to-eco-green bg-gradient animate-gradient hover:scale-105' 
                  : 'bg-gray-400'
              }`}
            >
              {generateHuntMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  <span>Crafting Your Adventure...</span>
                  <div className="ml-3 flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </>
              ) : (
                <>
                  <Wand2 className="w-6 h-6 mr-3" />
                  <span>Generate My EcoQuest</span>
                  <Zap className="w-5 h-5 ml-3 animate-pulse" />
                </>
              )}
            </Button>
            
            {selectedTheme && (
              <div className="absolute -inset-1 bg-gradient-to-r from-eco-green to-forest-green rounded-2xl blur opacity-20 animate-pulse"></div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
