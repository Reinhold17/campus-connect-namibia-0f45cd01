import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from './types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const demoUsers: Record<string, User> = {
  'student@unam.na': {
    id: 'st1', name: 'Tusnelde Hamunyela', email: 'student@unam.na',
    role: 'student', status: 'approved', university: 'University of Namibia', createdAt: '2024-01-01',
  },
  'tutor@unam.na': {
    id: '1', name: 'Selma Nangolo', email: 'tutor@unam.na',
    role: 'tutor', status: 'approved', university: 'University of Namibia',
    subjects: ['Mathematics', 'Physics'], rating: 4.8, reviewCount: 24, createdAt: '2024-08-01',
  },
  'admin@campusconnect.na': {
    id: 'a1', name: 'Admin User', email: 'admin@campusconnect.na',
    role: 'admin', status: 'approved', createdAt: '2024-01-01',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, _password: string) => {
    const found = demoUsers[email];
    if (found) {
      setUser(found);
    } else {
      // Default to student for demo
      setUser({
        id: 'demo', name: 'Demo User', email, role: 'student',
        status: 'approved', createdAt: new Date().toISOString(),
      });
    }
  };

  const signup = async (name: string, email: string, _password: string, role: UserRole) => {
    setUser({
      id: 'new-' + Date.now(), name, email, role,
      status: role === 'tutor' ? 'pending' : 'approved', createdAt: new Date().toISOString(),
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
