import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { LoginRequest, RegisterRequest, UpdateProfileRequest, User } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('agri_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('agri_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('agri_token');
      localStorage.removeItem('agri_user');
      setToken(null);
      setUser(null);
    }
  }, [token]);

  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem('agri_token')) {
      setLoading(false);
      return;
    }
    try {
      const res = await authService.getProfile();
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('agri_user', JSON.stringify(res.user));
      }
    } catch {
      // If profile fetch fails, session might be invalid
      localStorage.removeItem('agri_token');
      localStorage.removeItem('agri_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleAuthLogout = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth_logout', handleAuthLogout);
    refreshProfile();

    return () => {
      window.removeEventListener('auth_logout', handleAuthLogout);
    };
  }, [refreshProfile]);

  const login = async (data: LoginRequest) => {
    const res = await authService.login(data);
    if (res.access_token && res.user) {
      localStorage.setItem('agri_token', res.access_token);
      localStorage.setItem('agri_user', JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);
    }
  };

  const register = async (data: RegisterRequest) => {
    await authService.register(data);
    // Automatically log in after registration
    await login({ email: data.email, password: data.password });
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    const res = await authService.updateProfile(data);
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('agri_user', JSON.stringify(res.user));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
