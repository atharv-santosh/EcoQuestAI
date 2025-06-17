import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  MapPin, 
  Calendar, 
  Trophy, 
  Target, 
  Camera, 
  Settings, 
  Edit3, 
  Star,
  Medal,
  Leaf,
  Clock,
  CheckCircle,
  TrendingUp,
  Award
} from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const { data: userProfile } = useQuery({
    queryKey: ["/api/users/profile"],
    retry: false,
  });

  const { data: userHunts } = useQuery({
    queryKey: ["/api/hunts"],
    retry: false,
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements"],
    retry: false,
  });

  // Mock user data for demonstration
  const mockUser = userProfile || {
    id: "demo_user_123",
    email: "eco.explorer@example.com",
    firstName: "Eco",
    lastName: "Explorer",
    points: 2840,
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: "New York, NY"
    },
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=eco-explorer",
    createdAt: "2024-01-01",
    level: 8,
    totalQuests: 15,
    completedQuests: 12,
    streakDays: 7
  };

  const mockStats = {
    totalDistance: "47.2 km",
    totalTime: "18.5 hours",
    photosCapture: 89,
    plantsDiscovered: 34,
    co2Saved: "12.4 kg",
    treesPlanted: 3
  };

  const recentAchievements = achievements?.slice(0, 3) || [
    {
      id: 1,
      title: "Nature Photographer",
      description: "Captured 10 different plant species",
      earnedAt: "2024-01-25",
      type: "photography",
      points: 100
    },
    {
      id: 2,
      title: "Urban Explorer",
      description: "Completed quests in 5 neighborhoods",
      earnedAt: "2024-01-20",
      type: "exploration",
      points: 200
    },
    {
      id: 3,
      title: "Eco Scholar",
      description: "Answered 25 sustainability questions",
      earnedAt: "2024-01-15",
      type: "education",
      points: 150
    }
  ];

  const nextLevelPoints = (mockUser.level + 1) * 200;
  const currentLevelProgress = (mockUser.points % 200) / 200 * 100;

  return (
    <Layout userPoints={mockUser.points}>
      <div className="min-h-screen bg-gradient-to-br from-eco-green/5 to-forest-green/10">
        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-eco-green/20">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={mockUser.profileImageUrl} alt="Profile" />
                  <AvatarFallback className="text-2xl bg-gradient-to-r from-eco-green to-forest-green text-white">
                    {mockUser.firstName[0]}{mockUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-eco-green to-forest-green rounded-full flex items-center justify-center text-white font-bold">
                  {mockUser.level}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    {isEditing ? (
                      <div className="flex items-center space-x-2 mb-2">
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder={`${mockUser.firstName} ${mockUser.lastName}`}
                          className="text-lg font-bold"
                        />
                        <Button size="sm" onClick={() => setIsEditing(false)}>Save</Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">
                          {displayName || `${mockUser.firstName} ${mockUser.lastName}`}
                        </h1>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <p className="text-gray-600 mb-2">{mockUser.email}</p>
                    <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{mockUser.location?.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(mockUser.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4 md:mt-0">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>

                {/* Level Progress */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Level {mockUser.level}</span>
                    <span className="text-sm text-gray-500">{mockUser.points} / {nextLevelPoints} XP</span>
                  </div>
                  <Progress value={currentLevelProgress} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">
                    {nextLevelPoints - mockUser.points} XP to next level
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-eco-green">{mockUser.points}</div>
                    <div className="text-xs text-gray-600">Total XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-nature-amber">{mockUser.completedQuests}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{recentAchievements.length}</div>
                    <div className="text-xs text-gray-600">Badges</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-coral-red">{mockUser.streakDays}</div>
                    <div className="text-xs text-gray-600">Day Streak</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Activity Stats */}
              <Card className="p-6">
                <div className="flex items-center mb-6">
                  <TrendingUp className="w-6 h-6 text-eco-green mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Activity Overview</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-eco-green/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <MapPin className="w-6 h-6 text-eco-green" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{mockStats.totalDistance}</div>
                    <div className="text-sm text-gray-600">Distance Traveled</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-nature-amber/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-6 h-6 text-nature-amber" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{mockStats.totalTime}</div>
                    <div className="text-sm text-gray-600">Time Exploring</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Camera className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{mockStats.photosCapture}</div>
                    <div className="text-sm text-gray-600">Photos Captured</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{mockStats.plantsDiscovered}</div>
                    <div className="text-sm text-gray-600">Plants Discovered</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{mockStats.co2Saved}</div>
                    <div className="text-sm text-gray-600">CO₂ Saved</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-600/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Award className="w-6 h-6 text-green-700" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{mockStats.treesPlanted}</div>
                    <div className="text-sm text-gray-600">Trees Planted</div>
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Quests</h2>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
                
                <div className="space-y-4">
                  {userHunts?.slice(0, 3).map((hunt: any, index: number) => (
                    <div key={hunt.id || index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        hunt.status === 'completed' ? 'bg-eco-green text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {hunt.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Clock className="w-6 h-6" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{hunt.title || "Urban Nature Quest"}</h3>
                        <p className="text-sm text-gray-600">{hunt.description || "Explore local parks and green spaces"}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {hunt.createdAt ? new Date(hunt.createdAt).toLocaleDateString() : "Recent"}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {hunt.theme || "urban-nature"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-eco-green">+{hunt.totalPoints || 150}</div>
                        <div className="text-xs text-gray-500">XP earned</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No quests completed yet</p>
                      <p className="text-sm">Start your first eco-adventure!</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Achievements */}
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Trophy className="w-5 h-5 text-nature-amber mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Latest Badges</h3>
                </div>
                
                <div className="space-y-4">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-nature-amber to-orange-400 rounded-xl flex items-center justify-center">
                        <Medal className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{achievement.title}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-nature-amber font-medium">+{achievement.points} XP</span>
                          <span className="text-xs text-gray-500">
                            {new Date(achievement.earnedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All Badges
                </Button>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Update Location
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}