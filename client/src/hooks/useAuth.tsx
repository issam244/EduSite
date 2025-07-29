import { useState, useEffect, createContext, useContext } from 'react';
import { User } from 'firebase/auth';
import { authService } from '@/lib/firebase';
import { User as AppUser } from '@shared/schema';

interface AuthContextType {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, schoolLevel: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // Fetch user data from our backend
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firebaseUid: user.uid }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setAppUser(data.user);
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      } else {
        setAppUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string, schoolLevel: string) => {
    try {
      await authService.signUp(email, password, displayName, schoolLevel);
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      try {
        const response = await fetch(`/api/users/${appUser?.id}`);
        if (response.ok) {
          const data = await response.json();
          setAppUser(data.user);
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      appUser,
      loading,
      signUp,
      signIn,
      signOut,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
