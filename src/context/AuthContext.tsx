// src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { User, AuthContextType } from '../types';

// Create a context (using undefined as the initial value is common)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storedUser = localStorage.getItem('user');
  const [user, setUser] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );

  const login = (username: string, api_key: string, authType: 'github' | 'password' = 'password') => {
    const userData: User = { username, api_key, authType };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export useAuth as a named export
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
