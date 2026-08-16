import { apiClient } from './apiClient';
import { User, GolangAuthResponse, UserRole } from '../types';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user on golang-auth-api
   */
  public static async register(input: RegisterInput): Promise<{ user: User; token: string }> {
    // Standard endpoint used in golang-auth-api: /api/auth/register or /auth/signup or /api/register
    const response = await apiClient.request<GolangAuthResponse>('POST', '/api/register', {
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role || 'fleet_manager',
      phone: input.phone,
    });

    const user = response.data?.user || response.user;
    const token = response.data?.token || response.data?.tokens?.accessToken || response.token || response.access_token;

    if (!user || !token) {
      throw new Error('Resposta de autenticação Golang inválida.');
    }

    apiClient.setToken(token, response.data?.tokens?.refreshToken || response.refresh_token);
    return { user, token };
  }

  /**
   * Log in user
   */
  public static async login(input: LoginInput): Promise<{ user: User; token: string }> {
    // Standard endpoint: /api/login or /auth/login or /api/auth/login
    const response = await apiClient.request<GolangAuthResponse>('POST', '/api/login', {
      email: input.email,
      password: input.password,
    });

    const user = response.data?.user || response.user;
    const token = response.data?.token || response.data?.tokens?.accessToken || response.token || response.access_token;

    if (!user || !token) {
      throw new Error('Credenciais aceites, mas nenhum token foi retornado pelo servidor Golang.');
    }

    apiClient.setToken(token, response.data?.tokens?.refreshToken || response.refresh_token);
    return { user, token };
  }

  /**
   * Social Authentication (Google, GitHub, Apple OAuth flow)
   */
  public static async socialLogin(provider: 'google' | 'github' | 'apple'): Promise<{ user: User; token: string }> {
    // In live OAuth, standard flow exchanges authorization code via /api/auth/social/{provider}
    const simulatedProviderAccounts: Record<string, { email: string; name: string; avatar: string }> = {
      google: {
        email: 'gestor.google@fleetgo.co',
        name: 'Carlos Google Partner',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
      },
      github: {
        email: 'dev.admin@github.fleetgo.co',
        name: 'Admin GitHub Dev',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256',
      },
      apple: {
        email: 'apple.fleet@icloud.com',
        name: 'Gestor Apple Enterprise',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
      }
    };

    const provData = simulatedProviderAccounts[provider] || simulatedProviderAccounts.google;

    // Call /api/auth/social/provider
    const response = await apiClient.request<GolangAuthResponse>('POST', `/api/auth/oauth/${provider}`, {
      provider,
      providerToken: 'mock_oauth_bearer_' + Math.random().toString(36).substring(2),
      email: provData.email,
      name: provData.name,
    });

    const user: User = response.data?.user || {
      id: 'usr_social_' + provider + '_' + Math.random().toString(36).substring(2, 6),
      name: provData.name,
      email: provData.email,
      role: 'fleet_manager',
      avatar: provData.avatar,
      createdAt: new Date().toISOString(),
      isEmailVerified: true,
    };

    const token = response.data?.token || 'oauth_jwt_' + Math.random().toString(36).substring(2);
    apiClient.setToken(token);
    apiClient.saveSimulatedUser(user);

    return { user, token };
  }

  /**
   * Get Current User Profile from /api/me
   */
  public static async getProfile(): Promise<User> {
    const response = await apiClient.request<GolangAuthResponse>('GET', '/api/me');
    const user = response.data?.user || response.user;
    if (!user) {
      throw new Error('Sessão expirada ou utilizador não encontrado no backend.');
    }
    return user;
  }

  /**
   * Update Profile
   */
  public static async updateProfile(user: Partial<User>): Promise<User> {
    const response = await apiClient.request<GolangAuthResponse>('PUT', '/api/me', user);
    const updated = response.data?.user || response.user;
    if (updated) {
      apiClient.saveSimulatedUser(updated);
      return updated;
    }
    throw new Error('Não foi possível atualizar o perfil.');
  }

  /**
   * Send Password Reset
   */
  public static async forgotPassword(email: string): Promise<string> {
    const response = await apiClient.request<{ message: string }>('POST', '/api/forgot-password', { email });
    return response.message || 'E-mail de recuperação enviado com sucesso.';
  }

  /**
   * Logout user
   */
  public static async logout(): Promise<void> {
    try {
      await apiClient.request('POST', '/api/logout');
    } catch (e) {
      console.warn('Silent logout error:', e);
    } finally {
      apiClient.clearTokens();
    }
  }
}
