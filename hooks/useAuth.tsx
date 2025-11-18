import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User } from '../types.ts';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, pass: string) => boolean;
  signup: (username: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserRaw = localStorage.getItem('gemini-creative-suite-user');
    if (storedUserRaw) {
      try {
        const parsed = JSON.parse(storedUserRaw);
        // Check if the stored user has the correct structure (username)
        if (parsed && parsed.username) {
          setUser(parsed);
        } else {
          localStorage.removeItem('gemini-creative-suite-user');
        }
      } catch (e) {
        localStorage.removeItem('gemini-creative-suite-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, pass: string): boolean => {
    const storedCreds = localStorage.getItem(`user_${username}`);
    if (storedCreds) {
      const creds = JSON.parse(storedCreds);
      if (creds.password === pass) {
        const loggedInUser = { username };
        setUser(loggedInUser);
        localStorage.setItem('gemini-creative-suite-user', JSON.stringify(loggedInUser));
        return true;
      }
    }
    return false;
  };

  const signup = (username: string, pass: string): boolean => {
    if (localStorage.getItem(`user_${username}`)) {
      return false; // User already exists
    }
    const newUserCreds = { password: pass };
    localStorage.setItem(`user_${username}`, JSON.stringify(newUserCreds));
    const newUser = { username };
    setUser(newUser);
    localStorage.setItem('gemini-creative-suite-user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gemini-creative-suite-user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};