import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Home, Compass, Trophy, User, Coins, Leaf, Zap, Globe, Star } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  userPoints?: number;
}

export default function Layout({ children, userPoints = 0 }: LayoutProps) {
  const [location] = useLocation();
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [pointsAnimation, setPointsAnimation] = useState(false);
  const [previousPoints, setPreviousPoints] = useState(userPoints);

  // Dynamic time-based theming
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
    else if (hour >= 17 && hour < 21) setTimeOfDay('evening');
    else setTimeOfDay('night');
  }, []);

  // Points animation effect
  useEffect(() => {
    if (userPoints !== previousPoints) {
      setPointsAnimation(true);
      setPreviousPoints(userPoints);
      setTimeout(() => setPointsAnimation(false), 1000);
    }
  }, [userPoints, previousPoints]);

  const getThemeClass = () => {
    switch (timeOfDay) {
      case 'morning': return 'bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50';
      case 'afternoon': return 'bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50';
      case 'evening': return 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50';
      default: return 'bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900';
    }
  };

  const getHeaderGradient = () => {
    switch (timeOfDay) {
      case 'morning': return 'bg-gradient-nature';
      case 'afternoon': return 'bg-gradient-sunset';
      case 'evening': return 'bg-gradient-earth';
      default: return 'bg-gradient-ocean';
    }
  };

  const floatingElements = [
    { icon: Leaf, color: 'text-eco-green', delay: '0s' },
    { icon: Globe, color: 'text-ocean-blue', delay: '1s' },
    { icon: Star, color: 'text-nature-amber', delay: '2s' },
    { icon: Zap, color: 'text-sunset-orange', delay: '0.5s' },
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden ${getThemeClass()}`}>
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {floatingElements.map((element, index) => {
          const Icon = element.icon;
          return (
            <div
              key={index}
              className={`absolute animate-float ${element.color} opacity-10`}
              style={{
                top: `${20 + (index * 20)}%`,
                left: `${10 + (index * 25)}%`,
                animationDelay: element.delay,
                fontSize: '2rem',
              }}
            >
              <Icon className="w-8 h-8" />
            </div>
          );
        })}
      </div>

      {/* Dynamic Header */}
      <header className={`relative ${getHeaderGradient()} shadow-lg`}>
        {/* Header overlay pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="max-w-lg mx-auto px-4 py-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-30 animate-pulse-soft">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-nature-amber rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">EcoQuest AI</h1>
                <p className="text-sm text-white text-opacity-80 font-medium">
                  {timeOfDay === 'morning' && '🌅 Good morning explorer!'}
                  {timeOfDay === 'afternoon' && '☀️ Afternoon adventures await!'}
                  {timeOfDay === 'evening' && '🌅 Evening discoveries!'}
                  {timeOfDay === 'night' && '🌙 Night owl explorer!'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Points with animation */}
              <div className={`glass px-4 py-2 rounded-2xl text-white font-bold text-lg transition-all duration-300 ${
                pointsAnimation ? 'animate-scale-in bg-nature-amber bg-opacity-30' : ''
              }`}>
                <Coins className="w-5 h-5 inline mr-2 animate-pulse" />
                <span className="font-mono">{userPoints.toLocaleString()}</span>
              </div>
              
              {/* Profile button with status indicator */}
              <div className="relative">
                <button className="w-10 h-10 rounded-full glass text-white flex items-center justify-center hover:bg-white hover:bg-opacity-20 transition-all duration-200">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-eco-green rounded-full border-2 border-white animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with slide-up animation */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24 animate-slide-up">
        {children}
      </main>

      {/* Enhanced Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white border-opacity-20 max-w-lg mx-auto backdrop-blur-xl">
        <div className="flex items-center justify-around py-3">
          {[
            { href: '/', icon: Home, label: 'Home', color: 'text-eco-green' },
            { href: '/explore', icon: Compass, label: 'Explore', color: 'text-ocean-blue' },
            { href: '/achievements', icon: Trophy, label: 'Badges', color: 'text-nature-amber' },
            { href: '/profile', icon: User, label: 'Profile', color: 'text-sunset-orange' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <button className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? `${item.color} bg-white bg-opacity-10 transform scale-110` 
                    : 'text-white text-opacity-60 hover:text-white hover:bg-white hover:bg-opacity-5'
                }`}>
                  <div className="relative">
                    <Icon className="w-6 h-6 mb-1" />
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
