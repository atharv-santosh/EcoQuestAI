import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Users, Star, Filter, Compass, Zap } from "lucide-react";

const categories = [
  { id: 'all', label: 'All Adventures', icon: Compass },
  { id: 'urban-nature', label: 'Urban Nature', icon: MapPin },
  { id: 'sustainable-shopping', label: 'Eco Shopping', icon: Zap },
  { id: 'pollinator-hunt', label: 'Pollinator Hunt', icon: Star },
  { id: 'zero-waste-picnic', label: 'Zero Waste', icon: Users },
];

const featuredAdventures = [
  {
    id: 1,
    title: "Downtown Green Spaces",
    category: "urban-nature",
    description: "Discover hidden parks and green corridors in the city center",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    duration: "45 min",
    difficulty: "Easy",
    rating: 4.8,
    participants: 234,
    distance: "2.3 km",
    tags: ["Parks", "Wildlife", "Photography"]
  },
  {
    id: 2,
    title: "Sustainable Market Tour",
    category: "sustainable-shopping",
    description: "Explore local farmers markets and eco-friendly shops",
    image: "https://images.unsplash.com/photo-1573821663912-6df460f9c684?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    duration: "60 min",
    difficulty: "Medium",
    rating: 4.6,
    participants: 187,
    distance: "1.8 km",
    tags: ["Local", "Organic", "Community"]
  },
  {
    id: 3,
    title: "Butterfly Garden Quest",
    category: "pollinator-hunt",
    description: "Find and photograph native pollinators in botanical gardens",
    image: "https://images.unsplash.com/photo-1500740516770-92bd004b996e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    duration: "30 min",
    difficulty: "Easy",
    rating: 4.9,
    participants: 312,
    distance: "1.2 km",
    tags: ["Flowers", "Bees", "Nature"]
  },
  {
    id: 4,
    title: "Zero Waste Picnic Setup",
    category: "zero-waste-picnic",
    description: "Learn to create the perfect eco-friendly outdoor meal",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    duration: "90 min",
    difficulty: "Medium",
    rating: 4.7,
    participants: 156,
    distance: "0.5 km",
    tags: ["Picnic", "Sustainable", "Food"]
  },
];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const { data: userProfile } = useQuery({
    queryKey: ["/api/users/profile"],
    retry: false,
  });

  const filteredAdventures = featuredAdventures.filter(adventure => {
    const matchesSearch = adventure.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         adventure.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || adventure.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedAdventures = [...filteredAdventures].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "duration":
        return parseInt(a.duration) - parseInt(b.duration);
      case "difficulty":
        const difficultyOrder = { "Easy": 1, "Medium": 2, "Hard": 3 };
        return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
               difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
      default:
        return b.participants - a.participants;
    }
  });

  return (
    <Layout userPoints={userProfile?.points || 0}>
      <div className="min-h-screen bg-gradient-to-br from-eco-green/5 to-forest-green/10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-eco-green/20 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Explore Adventures
                </h1>
                <p className="text-gray-600">
                  Discover eco-friendly quests in your area
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-eco-green/10 text-eco-green">
                  {filteredAdventures.length} adventures
                </Badge>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search adventures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-eco-green"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="duration">Shortest Duration</option>
                  <option value="difficulty">Easiest First</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? "bg-eco-green hover:bg-eco-green/90"
                      : "hover:bg-eco-green/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Adventures Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedAdventures.map((adventure) => (
              <Card key={adventure.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={adventure.image}
                    alt={adventure.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant="secondary"
                      className={`${
                        adventure.difficulty === "Easy"
                          ? "bg-eco-green/90 text-white"
                          : adventure.difficulty === "Medium"
                          ? "bg-nature-amber/90 text-white"
                          : "bg-coral-red/90 text-white"
                      }`}
                    >
                      {adventure.difficulty}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-xl text-gray-900">{adventure.title}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-nature-amber fill-current" />
                      <span className="text-sm font-medium">{adventure.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{adventure.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{adventure.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{adventure.distance}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{adventure.participants}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {adventure.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button className="w-full bg-eco-green hover:bg-eco-green/90">
                    Start Adventure
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {sortedAdventures.length === 0 && (
            <div className="text-center py-12">
              <Compass className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No adventures found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}