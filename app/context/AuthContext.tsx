'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'guest' | 'business' | 'admin';
  businessId?: string;
  businessName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  businessName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const stored = localStorage.getItem('user');
      let baseUser: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || '',
        avatar: session.user.image || undefined,
        role: (session.user.role?.toLowerCase() as 'guest' | 'business' | 'admin') || 'business',
        businessId: session.user.businessId || undefined,
        businessName: session.user.businessName || undefined,
      };

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.email === session.user.email) {
            baseUser = { ...baseUser, ...parsed };
          }
        } catch (e) {
          console.error('Error parsing stored user', e);
        }
      }
      
      setUser(baseUser);
      localStorage.setItem('user', JSON.stringify(baseUser));
    } else if (status === 'unauthenticated') {
      setUser(null);
      localStorage.removeItem('user');
    }
    
    setIsLoading(false);
  }, [session, status]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    window.location.href = '/api/auth/signin?provider=google';
  };

  const loginWithFacebook = async () => {
    window.location.href = '/api/auth/signin?provider=facebook';
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      localStorage.setItem('user', JSON.stringify(result));
      setUser(result);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('Logging out...');
    localStorage.removeItem('user');
    setUser(null);
    try {
      await signOut({ callbackUrl: '/' });
    } catch (e) {
      console.error('Logout failed', e);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, loginWithFacebook, register, logout }}>
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