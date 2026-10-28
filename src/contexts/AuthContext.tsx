import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut as authSignOut } from '@/services/authService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  role?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    role?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@rentride.com';

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData) {
        // Add user_metadata for compatibility with existing code
        setUser({
          ...userData,
          user_metadata: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
          },
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for storage events (for multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'user') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signOut = async () => {
    try {
      // Call the auth service to handle server-side logout and clear storage
      await authSignOut();
      
      // Update local state
      setUser(null);
      
      // Force redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if logout fails, clear local state and redirect
      setUser(null);
      window.location.href = '/';
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const value = {
    user,
    loading,
    isAdmin,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};