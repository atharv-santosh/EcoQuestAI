import React, { createContext, useContext, useState, useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
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
          setUser(parsed);
          console.log('[AuthContext] Set user from localStorage:', parsed);
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
            setUser(parsed);
            console.log('[AuthContext] Set user from AsyncStorage:', parsed);
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
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (isWeb) {
      // Web: Open Google OAuth in a popup to /auth-callback.html
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
    // Native/mobile logic goes here (unchanged)
    // ...
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

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}; 