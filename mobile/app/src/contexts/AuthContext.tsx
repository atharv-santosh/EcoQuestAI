import React, { createContext, useContext, useState, useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  resetUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

const isWeb = Platform.OS === 'web';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isWeb) {
      const stored = localStorage.getItem('user');
      console.log('[AuthContext] Loaded from localStorage:', stored);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Ensure the user has all required properties including gems
          const userWithDefaults = {
            ...parsed,
            level: parsed.level || 1,
            experience: parsed.experience || 0,
            totalQuests: parsed.totalQuests || 0,
            totalBadges: parsed.totalBadges || 0,
            gems: parsed.gems || 1000, // Default to 1000 gems if not present
          };
          setUser(userWithDefaults);
          console.log('[AuthContext] Set user from localStorage:', userWithDefaults);
        } catch (e) {
          console.error('[AuthContext] Failed to parse user from localStorage:', e);
        }
      } else {
        console.log('[AuthContext] No user found in localStorage');
      }
      setLoading(false);
      console.log('[AuthContext] Loading set to false (web)');
    } else {
      AsyncStorage.getItem('user').then(data => {
        console.log('[AuthContext] Loaded from AsyncStorage:', data);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            // Ensure the user has all required properties including gems
            const userWithDefaults = {
              ...parsed,
              level: parsed.level || 1,
              experience: parsed.experience || 0,
              totalQuests: parsed.totalQuests || 0,
              totalBadges: parsed.totalBadges || 0,
              gems: parsed.gems || 1000, // Default to 1000 gems if not present
            };
            setUser(userWithDefaults);
            console.log('[AuthContext] Set user from AsyncStorage:', userWithDefaults);
          } catch (e) {
            console.error('[AuthContext] Failed to parse user from AsyncStorage:', e);
          }
        } else {
          console.log('[AuthContext] No user found in AsyncStorage');
        }
        setLoading(false);
        console.log('[AuthContext] Loading set to false (native)');
      });
    }
  }, []);

  const signIn = async () => {
    setLoading(true);
    console.log('[AuthContext] Starting sign in process...');
    
    if (isWeb) {
      // Web: Open Google OAuth in a popup to /auth-callback.html
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const redirectUri = window.location.origin + '/auth-callback.html';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token` +
        `&scope=openid%20profile%20email`;
      const popup = window.open(authUrl, 'oauth', 'width=500,height=600');
      if (!popup) {
        Alert.alert('Popup Blocked', 'Please allow popups for this site to sign in with Google.');
        setLoading(false);
        return;
      }
      // Listen for the OAuth result
      const listener = (event: MessageEvent) => {
        if (event.data && event.data.type === 'OAUTH_RESULT') {
          const { access_token } = event.data.params;
          if (access_token) {
            fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`)
              .then(res => res.json())
              .then(userInfo => {
                if (userInfo.id && userInfo.email) {
                  setUser(userInfo);
                  localStorage.setItem('user', JSON.stringify(userInfo));
                  setLoading(false);
                  window.removeEventListener('message', listener);
                } else {
                  Alert.alert('Sign In Failed', 'Could not get user information.');
                  setLoading(false);
                  window.removeEventListener('message', listener);
                }
              });
          } else {
            Alert.alert('Sign In Failed', 'No access token received.');
            setLoading(false);
            window.removeEventListener('message', listener);
          }
        }
      };
      window.addEventListener('message', listener);
      return;
    }

    // Native/mobile logic using Expo AuthSession
    try {
      console.log('[AuthContext] Setting up AuthSession for native...');
      
      // Get the appropriate client ID based on platform
      const clientId = Platform.select({
        ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      }) || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

      console.log('[AuthContext] Using client ID:', clientId);
      
      if (!clientId) {
        console.error('[AuthContext] No client ID found for platform:', Platform.OS);
        Alert.alert('Configuration Error', 'Google OAuth client ID not configured for this platform.');
        setLoading(false);
        return;
      }

      // For simulator testing, use web OAuth flow which is more reliable
      if (Platform.OS === 'ios' && __DEV__) {
        console.log('[AuthContext] Using development bypass for iOS simulator...');
        
        // Temporary development bypass - creates a mock user for testing
        const mockUser: User = {
          id: 'dev-user-123',
          email: 'test@ecoquestai.com',
          name: 'Test User',
          picture: 'https://via.placeholder.com/150',
          level: 1,
          experience: 0,
          totalQuests: 0,
          totalBadges: 0,
          gems: 1000
        };
        
        console.log('[AuthContext] Creating mock user for development:', mockUser);
        
        // Store mock user data
        await AsyncStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        console.log('[AuthContext] Mock user signed in successfully');
        setLoading(false);
        
        Alert.alert(
          'Development Mode',
          'Signed in with test account for development purposes.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Create the redirect URI
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'ecoquestai',
        path: 'auth'
      });

      console.log('[AuthContext] Redirect URI:', redirectUri);

      // Create the auth request
      const request = new AuthSession.AuthRequest({
        clientId: clientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri: redirectUri,
        responseType: AuthSession.ResponseType.Token,
      });

      console.log('[AuthContext] Auth request created, starting authentication...');
      
      // Start the authentication
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      console.log('[AuthContext] Auth result:', result);

      if (result.type === 'success' && result.authentication?.accessToken) {
        console.log('[AuthContext] Authentication successful, fetching user info...');
        
        // Fetch user information using the access token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${result.authentication.accessToken}`,
          },
        });

        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          console.log('[AuthContext] User info received:', userInfo);
          
          if (userInfo.id && userInfo.email) {
            // Store user data
            await AsyncStorage.setItem('user', JSON.stringify(userInfo));
            setUser(userInfo);
            console.log('[AuthContext] User signed in successfully');
          } else {
            console.error('[AuthContext] Invalid user info received:', userInfo);
            Alert.alert('Sign In Failed', 'Could not get user information from Google.');
          }
        } else {
          console.error('[AuthContext] Failed to fetch user info:', userInfoResponse.status);
          Alert.alert('Sign In Failed', 'Could not get user information from Google.');
        }
      } else if (result.type === 'cancel') {
        console.log('[AuthContext] Authentication cancelled by user');
        Alert.alert('Sign In Cancelled', 'You cancelled the sign in process.');
      } else {
        console.error('[AuthContext] Authentication failed:', result);
        Alert.alert('Sign In Failed', 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('[AuthContext] Error during sign in:', error);
      Alert.alert('Sign In Error', 'An error occurred during sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isWeb) {
      localStorage.removeItem('user');
      console.log('User info removed from localStorage');
    } else {
      await AsyncStorage.removeItem('user');
      console.log('User info removed from AsyncStorage');
    }
    setUser(null);
  };

  const resetUserData = async () => {
    // Clear existing data and recreate with proper gems
    if (isWeb) {
      localStorage.removeItem('user');
    } else {
      await AsyncStorage.removeItem('user');
    }
    
    // Recreate user with proper data
    const mockUser: User = {
      id: 'dev-user-123',
      email: 'test@ecoquestai.com',
      name: 'Test User',
      picture: 'https://via.placeholder.com/150',
      level: 1,
      experience: 0,
      totalQuests: 0,
      totalBadges: 0,
      gems: 1000
    };
    
    if (isWeb) {
      localStorage.setItem('user', JSON.stringify(mockUser));
    } else {
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    }
    
    setUser(mockUser);
    console.log('[AuthContext] User data reset with 1000 gems');
  };

  const updateUser = async (updates: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...updates } as User;
      
      // Save to storage
      if (isWeb) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateUser, resetUserData }}>
      {children}
    </AuthContext.Provider>
  );
}; 