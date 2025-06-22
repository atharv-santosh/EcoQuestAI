import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, MapPin, Camera, Star, Users, Smartphone } from "lucide-react";

export default function Landing() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EcoQuest AI</span>
            </div>
            <Button 
              onClick={handleGetStarted}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">
              AI-Powered Adventures
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Turn Your City Into an
              <span className="text-emerald-600"> Eco-Adventure</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover hidden green spaces, sustainable businesses, and eco-friendly activities 
              in your local area with AI-generated treasure hunts designed for environmental exploration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6"
              >
                Start Your Adventure
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 border-emerald-200 hover:bg-emerald-50"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore. Learn. Protect.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Four unique adventure themes designed to connect you with nature and sustainability
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">Urban Nature</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Discover hidden parks, urban gardens, and wildlife habitats in your city
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Sustainable Shopping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Find eco-friendly stores, farmers markets, and zero-waste businesses
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Pollinator Hunt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Document pollinators and their favorite plants in community gardens
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Zero-Waste Picnic</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Plan and execute completely waste-free outdoor dining experiences
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How EcoQuest AI Works
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps to start your eco-adventure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Your Theme</h3>
              <p className="text-gray-600">
                Select from four eco-adventure themes based on your interests and location
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Generates Your Route</h3>
              <p className="text-gray-600">
                Our AI creates a personalized treasure hunt with 5-7 stops in your area
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Explore & Learn</h3>
              <p className="text-gray-600">
                Complete photo challenges, trivia, and tasks while discovering your city
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-16 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-emerald-100 text-emerald-700 mb-4">
                Mobile-First Experience
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Install on Your Phone
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                EcoQuest AI works as a Progressive Web App. Install it directly from your 
                browser for a native app-like experience with offline capabilities.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Works offline for basic features</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">GPS navigation to adventure stops</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Camera integration for challenges</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-2xl shadow-lg p-8 inline-block">
                <Smartphone className="w-32 h-32 text-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Tap "Add to Home Screen" in your browser
                </p>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Install Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Join the Eco-Adventure Community
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">1,000+</div>
                <p className="text-gray-600">Adventures Completed</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">50+</div>
                <p className="text-gray-600">Cities Explored</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">500+</div>
                <p className="text-gray-600">Eco-Adventurers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Eco-Adventure?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of eco-adventurers discovering sustainable treasures in their cities
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-emerald-600 hover:bg-emerald-50 text-lg px-12 py-6"
          >
            Begin Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">EcoQuest AI</span>
              </div>
              <p className="text-gray-400">
                Transforming cities into eco-adventure playgrounds through AI-powered treasure hunts.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Adventures</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Urban Nature</li>
                <li>Sustainable Shopping</li>
                <li>Pollinator Hunt</li>
                <li>Zero-Waste Picnic</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>AI Route Generation</li>
                <li>GPS Navigation</li>
                <li>Photo Challenges</li>
                <li>Achievement System</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EcoQuest AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}