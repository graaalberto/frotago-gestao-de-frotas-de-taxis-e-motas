import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, ApiConfig, ApiLog, UserRole } from '../types';
import { apiClient } from '../services/apiClient';
import { AuthService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  apiConfig: ApiConfig;
  apiLogs: ApiLog[];
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: UserRole; phone?: string }) => Promise<void>;
  socialLogin: (provider: 'google' | 'github' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateApiConfig: (config: Partial<ApiConfig>) => void;
  testServerConnection: () => Promise<{ success: boolean; latencyMs: number; error?: string }>;
  clearApiLogs: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => apiClient.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiConfig, setApiConfigState] = useState<ApiConfig>(() => apiClient.getConfig());
  const [apiLogs, setApiLogs] = useState<ApiLog[]>(() => apiClient.getLogs());

  // Listen to API logs
  useEffect(() => {
    const unsubscribe = apiClient.subscribeLogs((logs) => {
      setApiLogs(logs);
    });
    return () => unsubscribe();
  }, []);

  // Initialize session on mount
  const initAuth = useCallback(async () => {
    setIsLoading(true);
    const existingToken = apiClient.getToken();
    if (!existingToken) {
      // Check if we have simulated users
      const simUsers = apiClient.getSimulatedUsers();
      if (simUsers.length > 0) {
        // Set default admin user for instant demo preview experience if no token
        const defaultUser = simUsers[0];
        setUser(defaultUser);
        const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(JSON.stringify({ sub: defaultUser.id, email: defaultUser.email, role: defaultUser.role })) + '.mock_signature';
        apiClient.setToken(fakeToken);
        setToken(fakeToken);
      }
      setIsLoading(false);
      return;
    }

    try {
      const profile = await AuthService.getProfile();
      setUser(profile);
      setToken(existingToken);
      setError(null);
    } catch (err: any) {
      console.warn('Failed to load profile with stored token:', err.message);
      // If token invalid, fallback to default simulated user in mock mode
      if (apiConfig.useMockSimulation) {
        const defaultUser = apiClient.getSimulatedUsers()[0];
        setUser(defaultUser);
        setToken(existingToken);
      } else {
        apiClient.clearTokens();
        setUser(null);
        setToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiConfig.useMockSimulation]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await AuthService.login({ email, password });
      setUser(result.user);
      setToken(result.token);
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar utilizador na golang-auth-api');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; role?: UserRole; phone?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await AuthService.register(data);
      setUser(result.user);
      setToken(result.token);
    } catch (err: any) {
      setError(err.message || 'Falha ao registrar novo utilizador');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'github' | 'apple') => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await AuthService.socialLogin(provider);
      setUser(result.user);
      setToken(result.token);
    } catch (err: any) {
      setError(err.message || `Falha no login com ${provider}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    try {
      const updated = await AuthService.updateProfile(userData);
      setUser(updated);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateApiConfig = (newConfig: Partial<ApiConfig>) => {
    apiClient.setConfig(newConfig);
    setApiConfigState(apiClient.getConfig());
  };

  const testServerConnection = async () => {
    const res = await apiClient.pingServer();
    setApiConfigState(apiClient.getConfig());
    return res;
  };

  const clearApiLogs = () => {
    apiClient.clearLogs();
    setApiLogs([]);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        apiConfig,
        apiLogs,
        login,
        register,
        socialLogin,
        logout,
        updateUser,
        updateApiConfig,
        testServerConnection,
        clearApiLogs,
        clearError,
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
