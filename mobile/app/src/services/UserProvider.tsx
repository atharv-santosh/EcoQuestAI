import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Google OAuth configuration - Only web client ID needed for PWA
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '948397636120-7llqh0ubvkgtt36g7art7mgdmdrrs9se.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignIn(authentication);
    } else if (response?.type === 'error') {
      console.error('Google OAuth error:', response.error);
      // You might want to show an alert here
    }
  }, [response]);

  // Load user from storage on app start
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (authentication: any) => {
    try {
      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      });
      
      const userInfo = await userInfoResponse.json();
      
      // Create user object from Google profile
      const googleUser: User = {
        id: userInfo.id,
        name: userInfo.name,
        firstName: userInfo.given_name || userInfo.name.split(' ')[0],
        lastName: userInfo.family_name || userInfo.name.split(' ').slice(1).join(' '),
        email: userInfo.email,
        avatar: userInfo.picture,
        points: 0,
        level: 1,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('user', JSON.stringify(googleUser));
      setUser(googleUser);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      // Fallback to demo user for development
      const demoUser: User = {
        id: Date.now().toString(),
        name: 'Demo User',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@example.com',
        avatar: 'https://via.placeholder.com/150',
        points: 0,
        level: 1,
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
    }
  };

  const login = async () => {
    try {
      // Trigger Google OAuth flow
      const result = await promptAsync();
      if (result.type === 'success') {
        // The response will be handled by the useEffect above
        return;
      } else if (result.type === 'error') {
        console.error('Google OAuth failed:', result.error);
        // Fallback to demo user for development
        const demoUser: User = {
          id: Date.now().toString(),
          name: 'Demo User',
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@example.com',
          avatar: 'https://via.placeholder.com/150',
          points: 0,
          level: 1,
          createdAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem('user', JSON.stringify(demoUser));
        setUser(demoUser);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to demo user for development
      const demoUser: User = {
        id: Date.now().toString(),
        name: 'Demo User',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@example.com',
        avatar: 'https://via.placeholder.com/150',
        points: 0,
        level: 1,
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 