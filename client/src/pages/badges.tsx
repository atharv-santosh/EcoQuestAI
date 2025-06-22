import React from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Medal, Star, Trophy, Camera, Leaf, MapPin, Users, Lock, Calendar, Target } from "lucide-react";

const badgeCategories = [
  { id: 'nature', label: 'Nature Explorer', icon: Leaf, color: 'from-eco-green to-forest-green' },
  { id: 'photography', label: 'Eco Photographer', icon: Camera, color: 'from-nature-amber to-orange-400' },
  { id: 'community', label: 'Community Leader', icon: Users, color: 'from-blue-500 to-purple-600' },
  { id: 'explorer', label: 'Urban Explorer', icon: MapPin, color: 'from-gray-600 to-gray-800' },
];

const allBadges = [
  {
    id: 1,
    title: "First Steps",
    description: "Complete your first eco quest",
    category: "nature",
    icon: Target,
    earned: true,
    earnedAt: "2024-01-15",
    progress: 100,
    requirement: "Complete 1 quest",
    rarity: "Common",
    points: 50
  },
  {
    id: 2,
    title: "Nature Photographer",
    description: "Capture 10 different plant species",
    category: "photography",
    icon: Camera,
    earned: true,
    earnedAt: "2024-01-20",
    progress: 100,
    requirement: "Photo capture: 10/10 species",
    rarity: "Rare",
    points: 100
  },
  {
    id: 3,
    title: "Urban Explorer",
    description: "Complete quests in 5 different neighborhoods",
    category: "explorer",
    icon: MapPin,
    earned: true,
    earnedAt: "2024-01-25",
    progress: 100,
    requirement: "Explore 5/5 neighborhoods",
    rarity: "Epic",
    points: 200
  },
  {
    id: 4,
    title: "Eco Scholar",
    description: "Answer 50 sustainability questions correctly",
    category: "nature",
    icon: Star,
    earned: false,
    earnedAt: null,
    progress: 72,
    requirement: "Answer 36/50 questions",
    rarity: "Rare",
    points: 150
  },
  {
    id: 5,
    title: "Community Champion",
    description: "Complete 5 group quests with friends",
    category: "community",
    icon: Users,
    earned: false,
    earnedAt: null,
    progress: 40,
    requirement: "Group quests: 2/5",
    rarity: "Epic",
    points: 250
  },
  {
    id: 6,
    title: "Pollinator Protector",
    description: "Complete all pollinator hunt quests",
    category: "nature",
    icon: Leaf,
    earned: false,
    earnedAt: null,
    progress: 0,
    requirement: "Complete 0/3 pollinator quests",
    rarity: "Legendary",
    points: 300
  },
];

export default function Badges() {
  const { data: userProfile } = useQuery({
    queryKey: ["/api/users/profile"],
    retry: false,
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements"],
    retry: false,
  });

  const earnedBadges = allBadges.filter(badge => badge.earned);
  const inProgressBadges = allBadges.filter(badge => !badge.earned && badge.progress > 0);
  const lockedBadges = allBadges.filter(badge => !badge.earned && badge.progress === 0);

  const totalPoints = earnedBadges.reduce((sum, badge) => sum + badge.points, 0);
  const completionRate = (earnedBadges.length / allBadges.length) * 100;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-600 bg-gray-100';
      case 'Rare': return 'text-blue-600 bg-blue-100';
      case 'Epic': return 'text-purple-600 bg-purple-100';
      case 'Legendary': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Layout userPoints={userProfile?.points || 0}>
      <div className="min-h-screen bg-gradient-to-br from-eco-green/5 to-forest-green/10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-eco-green/20">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-eco-green to-forest-green rounded-2xl mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievement Badges</h1>
              <p className="text-gray-600 mb-6">Track your eco-adventure progress and unlock rewards</p>
              
              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-eco-green">{earnedBadges.length}</div>
                  <div className="text-sm text-gray-600">Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-nature-amber">{totalPoints}</div>
                  <div className="text-sm text-gray-600">Badge Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(completionRate)}%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Badge Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {badgeCategories.map((category) => {
              const Icon = category.icon;
              const categoryBadges = allBadges.filter(badge => badge.category === category.id);
              const earnedInCategory = categoryBadges.filter(badge => badge.earned).length;
              
              return (
                <Card key={category.id} className="p-4 text-center hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.label}</h3>
                  <p className="text-sm text-gray-600">{earnedInCategory}/{categoryBadges.length} earned</p>
                </Card>
              );
            })}
          </div>

          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center mb-6">
                <Medal className="w-6 h-6 text-eco-green mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Earned Badges</h2>
                <Badge variant="secondary" className="ml-3 bg-eco-green/10 text-eco-green">
                  {earnedBadges.length}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {earnedBadges.map((badge) => {
                  const Icon = badge.icon;
                  const category = badgeCategories.find(cat => cat.id === badge.category);
                  
                  return (
                    <Card key={badge.id} className="p-6 hover:shadow-lg transition-shadow border-eco-green/20">
                      <div className="text-center">
                        <div className={`w-16 h-16 bg-gradient-to-r ${category?.color} rounded-2xl flex items-center justify-center mx-auto mb-4 relative`}>
                          <Icon className="w-8 h-8 text-white" />
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-nature-amber rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{badge.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={`text-xs ${getRarityColor(badge.rarity)}`}>
                            {badge.rarity}
                          </Badge>
                          <span className="text-sm font-medium text-eco-green">+{badge.points} pts</span>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Earned {new Date(badge.earnedAt!).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* In Progress Badges */}
          {inProgressBadges.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center mb-6">
                <Target className="w-6 h-6 text-nature-amber mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">In Progress</h2>
                <Badge variant="secondary" className="ml-3 bg-nature-amber/10 text-nature-amber">
                  {inProgressBadges.length}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressBadges.map((badge) => {
                  const Icon = badge.icon;
                  const category = badgeCategories.find(cat => cat.id === badge.category);
                  
                  return (
                    <Card key={badge.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="text-center">
                        <div className={`w-16 h-16 bg-gradient-to-r ${category?.color} opacity-70 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{badge.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium text-nature-amber">{badge.progress}%</span>
                          </div>
                          <Progress value={badge.progress} className="h-2" />
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-3">{badge.requirement}</p>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={`text-xs ${getRarityColor(badge.rarity)}`}>
                            {badge.rarity}
                          </Badge>
                          <span className="text-sm font-medium text-gray-400">+{badge.points} pts</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Locked Badges */}
          {lockedBadges.length > 0 && (
            <section>
              <div className="flex items-center mb-6">
                <Lock className="w-6 h-6 text-gray-400 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Locked Badges</h2>
                <Badge variant="secondary" className="ml-3 bg-gray-100 text-gray-600">
                  {lockedBadges.length}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lockedBadges.map((badge) => {
                  const Icon = badge.icon;
                  
                  return (
                    <Card key={badge.id} className="p-6 opacity-60 hover:opacity-80 transition-opacity">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                          <Icon className="w-8 h-8 text-gray-500" />
                          <Lock className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-400 text-white rounded-full p-1" />
                        </div>
                        
                        <h3 className="font-bold text-lg text-gray-700 mb-2">{badge.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">{badge.description}</p>
                        
                        <p className="text-xs text-gray-400 mb-3">{badge.requirement}</p>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={`text-xs ${getRarityColor(badge.rarity)} opacity-70`}>
                            {badge.rarity}
                          </Badge>
                          <span className="text-sm font-medium text-gray-400">+{badge.points} pts</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}