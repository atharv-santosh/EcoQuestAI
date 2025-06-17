import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Compass, Trophy, User, Coins } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  userPoints?: number;
}

export default function Layout({ children, userPoints = 0 }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-eco-green rounded-full flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EcoQuest AI</h1>
                <p className="text-sm text-gray-500">Discover & Explore</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-nature-amber text-white px-3 py-1 rounded-full text-sm font-medium">
                <Coins className="w-4 h-4 inline mr-1" />
                <span>{userPoints}</span>
              </div>
              <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-lg mx-auto">
        <div className="flex items-center justify-around py-2">
          <Link href="/">
            <button className={`flex flex-col items-center py-2 px-4 ${location === '/' ? 'text-eco-green' : 'text-gray-400'}`}>
              <Home className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Home</span>
            </button>
          </Link>
          <Link href="/explore">
            <button className={`flex flex-col items-center py-2 px-4 ${location === '/explore' ? 'text-eco-green' : 'text-gray-400'}`}>
              <Compass className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Explore</span>
            </button>
          </Link>
          <Link href="/achievements">
            <button className={`flex flex-col items-center py-2 px-4 ${location === '/achievements' ? 'text-eco-green' : 'text-gray-400'}`}>
              <Trophy className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Badges</span>
            </button>
          </Link>
          <Link href="/profile">
            <button className={`flex flex-col items-center py-2 px-4 ${location === '/profile' ? 'text-eco-green' : 'text-gray-400'}`}>
              <User className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
