import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createDemoUser} from './api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  points: number;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('Loading user from AsyncStorage...');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('[UserProvider] User loaded from storage:', parsedUser.id);
          setUser(parsedUser);
        } else {
          console.log('[UserProvider] No user found in storage. Creating new demo user...');
          const response = await createDemoUser();
          const newUser = response.data;
          await AsyncStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
          console.log('[UserProvider] New demo user created:', newUser.id);
        }
      } catch (error) {
        console.error('[UserProvider] Failed to load or create user:', error);
      } finally {
        setIsLoading(false);
        console.log('[UserProvider] User loading finished');
      }
    };

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{user, isLoading}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 