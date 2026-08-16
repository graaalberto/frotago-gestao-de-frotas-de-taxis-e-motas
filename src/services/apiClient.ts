import { ApiConfig, ApiLog, User, GolangAuthResponse } from '../types';

const CONFIG_STORAGE_KEY = 'fleetgo_api_config';
const LOGS_STORAGE_KEY = 'fleetgo_api_logs';
const TOKEN_KEY = 'fleetgo_access_token';
const REFRESH_TOKEN_KEY = 'fleetgo_refresh_token';
const USERS_DB_KEY = 'fleetgo_simulated_users';

// Default config
export const defaultApiConfig: ApiConfig = {
  baseUrl: 'http://localhost:8080',
  useMockSimulation: true,
  simulateLatencyMs: 350,
  healthStatus: 'connected',
  lastPingTimestamp: Date.now(),
};

// Initial simulated users for golang-auth-api
const initialUsers: User[] = [
  {
    id: 'usr_admin_01',
    name: 'Carlos Alberto Silva',
    email: 'admin@fleetgo.co',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    phone: '+244 923 456 789',
    createdAt: '2025-01-15T08:00:00Z',
    isEmailVerified: true,
    twoFactorEnabled: true,
  },
  {
    id: 'usr_mgr_02',
    name: 'Helena Mendes',
    email: 'gestor@fleetgo.co',
    role: 'fleet_manager',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
    phone: '+244 912 334 556',
    createdAt: '2025-02-01T10:30:00Z',
    isEmailVerified: true,
  },
  {
    id: 'usr_drv_03',
    name: 'Mateus Kipupa (Taxista)',
    email: 'taxista@fleetgo.co',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    phone: '+244 944 556 778',
    createdAt: '2025-03-10T14:15:00Z',
    isEmailVerified: true,
  }
];

export class ApiClient {
  private config: ApiConfig;
  private logs: ApiLog[] = [];
  private listeners: ((logs: ApiLog[]) => void)[] = [];

  constructor() {
    this.config = this.loadConfig();
    this.loadLogs();
    this.initSimulatedDb();
  }

  public getConfig(): ApiConfig {
    return { ...this.config };
  }

  public setConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    }
  }

  private loadConfig(): ApiConfig {
    if (typeof window === 'undefined') return defaultApiConfig;
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      return saved ? { ...defaultApiConfig, ...JSON.parse(saved) } : defaultApiConfig;
    } catch {
      return defaultApiConfig;
    }
  }

  private loadLogs(): void {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      this.logs = saved ? JSON.parse(saved).slice(0, 50) : [];
    } catch {
      this.logs = [];
    }
  }

  private initSimulatedDb(): void {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(USERS_DB_KEY)) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(initialUsers));
    }
  }

  public getSimulatedUsers(): User[] {
    if (typeof window === 'undefined') return initialUsers;
    try {
      const data = localStorage.getItem(USERS_DB_KEY);
      return data ? JSON.parse(data) : initialUsers;
    } catch {
      return initialUsers;
    }
  }

  public saveSimulatedUser(user: User): void {
    const users = this.getSimulatedUsers();
    const existingIndex = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    }
  }

  public getLogs(): ApiLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOGS_STORAGE_KEY);
    }
    this.notifyLogs();
  }

  public subscribeLogs(cb: (logs: ApiLog[]) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  public addLog(log: Omit<ApiLog, 'id' | 'timestamp'>): void {
    const fullLog: ApiLog = {
      ...log,
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
    this.logRequest(fullLog);
  }

  private logRequest(log: ApiLog): void {
    this.logs.unshift(log);
    if (this.logs.length > 60) this.logs.pop();
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(this.logs));
    }
    this.notifyLogs();
  }

  private notifyLogs(): void {
    this.listeners.forEach(cb => cb([...this.logs]));
  }

  public getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  public setToken(token: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  public clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  public async pingServer(): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const start = performance.now();
    if (this.config.useMockSimulation) {
      await new Promise(r => setTimeout(r, 120));
      this.setConfig({ healthStatus: 'connected', lastPingTimestamp: Date.now() });
      return { success: true, latencyMs: 120 };
    }

    try {
      const res = await fetch(`${this.config.baseUrl}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      const end = performance.now();
      const latencyMs = Math.round(end - start);
      if (res.ok) {
        this.setConfig({ healthStatus: 'connected', lastPingTimestamp: Date.now() });
        return { success: true, latencyMs };
      } else {
        this.setConfig({ healthStatus: 'disconnected', lastPingTimestamp: Date.now() });
        return { success: false, latencyMs, error: `HTTP ${res.status}: ${res.statusText}` };
      }
    } catch (err: any) {
      const end = performance.now();
      this.setConfig({ healthStatus: 'disconnected', lastPingTimestamp: Date.now() });
      return { success: false, latencyMs: Math.round(end - start), error: err.message || 'Falha de conexão com backend Golang' };
    }
  }

  // Generic Request Handler
  public async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    body?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const start = performance.now();
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...customHeaders,
    };

    // If Mock mode is enabled:
    if (this.config.useMockSimulation) {
      await new Promise(r => setTimeout(r, this.config.simulateLatencyMs));
      try {
        const responseData = this.handleMockRequest(method, endpoint, body, token);
        const duration = Math.round(performance.now() - start);

        this.logRequest({
          id: 'log_' + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          method,
          endpoint: `[SIMULATED] ${endpoint}`,
          status: 200,
          durationMs: duration,
          requestBody: body,
          responseBody: responseData,
        });

        return responseData as T;
      } catch (err: any) {
        const duration = Math.round(performance.now() - start);
        const statusCode = err.status || 400;

        this.logRequest({
          id: 'log_' + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          method,
          endpoint: `[SIMULATED] ${endpoint}`,
          status: statusCode,
          durationMs: duration,
          requestBody: body,
          error: err.message,
        });

        throw err;
      }
    }

    // Real HTTP Call to Golang Backend
    const url = `${this.config.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const duration = Math.round(performance.now() - start);
      let resJson: any = null;

      try {
        resJson = await response.json();
      } catch {
        resJson = { message: response.statusText };
      }

      this.logRequest({
        id: 'log_' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        method,
        endpoint,
        status: response.status,
        durationMs: duration,
        requestBody: body,
        responseBody: resJson,
        error: !response.ok ? resJson.message || `Erro HTTP ${response.status}` : undefined,
      });

      if (!response.ok) {
        const error = new Error(resJson.message || `Erro no servidor Golang (${response.status})`) as any;
        error.status = response.status;
        error.data = resJson;
        throw error;
      }

      return resJson as T;
    } catch (error: any) {
      if (error.status) throw error;
      const duration = Math.round(performance.now() - start);
      const networkError = new Error(`Falha de rede ao conectar à API Golang: ${error.message}`) as any;
      networkError.status = 503;

      this.logRequest({
        id: 'log_' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        method,
        endpoint,
        status: 503,
        durationMs: duration,
        requestBody: body,
        error: error.message,
      });

      throw networkError;
    }
  }

  // Simulated Golang Auth API mock dispatcher
  private handleMockRequest(method: string, endpoint: string, body: any, token: string | null): any {
    const users = this.getSimulatedUsers();

    // 1. POST /api/register or /auth/signup or /api/auth/register
    if (method === 'POST' && (endpoint.includes('/register') || endpoint.includes('/signup'))) {
      const { email, password, name, role = 'fleet_manager', phone } = body || {};

      if (!email || !password) {
        const err = new Error('E-mail e senha são campos obrigatórios.') as any;
        err.status = 400;
        throw err;
      }

      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        const err = new Error('Este endereço de e-mail já está cadastrado no sistema (409 Conflict).') as any;
        err.status = 409;
        throw err;
      }

      const newUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: name || email.split('@')[0],
        email,
        role: role as any,
        phone: phone || '+244 923 000 000',
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&q=80&w=256`,
        createdAt: new Date().toISOString(),
        isEmailVerified: true,
      };

      this.saveSimulatedUser(newUser);

      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(JSON.stringify({ sub: newUser.id, email: newUser.email, role: newUser.role, exp: Date.now() + 86400000 })) + '.mock_signature';

      return {
        status: 'success',
        code: 201,
        message: 'Usuário registrado com sucesso na golang-auth-api.',
        data: {
          user: newUser,
          token: fakeToken,
          tokens: {
            accessToken: fakeToken,
            refreshToken: 'ref_' + Math.random().toString(36).substring(2),
            tokenType: 'Bearer',
            expiresIn: 86400,
          },
        },
      };
    }

    // 2. POST /api/login or /auth/login or /api/auth/login
    if (method === 'POST' && endpoint.includes('/login')) {
      const { email, password } = body || {};

      if (!email || !password) {
        const err = new Error('Credenciais incompletas. Informe e-mail e palavra-passe.') as any;
        err.status = 400;
        throw err;
      }

      // Find user
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        const err = new Error('Credenciais inválidas: utilizador não encontrado ou senha incorrecta (401 Unauthorized).') as any;
        err.status = 401;
        throw err;
      }

      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(JSON.stringify({ sub: user.id, email: user.email, role: user.role, exp: Date.now() + 86400000 })) + '.mock_signature';

      return {
        status: 'success',
        code: 200,
        message: 'Autenticação bem-sucedida.',
        data: {
          user,
          token: fakeToken,
          tokens: {
            accessToken: fakeToken,
            refreshToken: 'ref_' + Math.random().toString(36).substring(2),
            tokenType: 'Bearer',
            expiresIn: 86400,
          },
        },
      };
    }

    // 3. GET /api/me or /api/user or /auth/me or /api/profile
    if (method === 'GET' && (endpoint.includes('/me') || endpoint.includes('/user') || endpoint.includes('/profile'))) {
      if (!token) {
        const err = new Error('Acesso negado: Cabeçalho Authorization ausente (401 Unauthorized).') as any;
        err.status = 401;
        throw err;
      }

      // Try decode token payload
      try {
        const parts = token.split('.');
        let payload: any = {};
        if (parts.length >= 2) {
          payload = JSON.parse(atob(parts[1]));
        }
        const user = users.find(u => u.id === payload.sub || u.email === payload.email) || users[0];

        return {
          status: 'success',
          code: 200,
          data: {
            user,
          },
        };
      } catch {
        return {
          status: 'success',
          code: 200,
          data: {
            user: users[0],
          },
        };
      }
    }

    // 4. POST /auth/logout or /api/logout
    if (method === 'POST' && endpoint.includes('/logout')) {
      return {
        status: 'success',
        code: 200,
        message: 'Sessão encerrada com sucesso na API Golang.',
      };
    }

    // 5. POST /auth/refresh or /api/refresh
    if (method === 'POST' && endpoint.includes('/refresh')) {
      const refreshedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(JSON.stringify({ sub: users[0].id, refreshed: true, exp: Date.now() + 86400000 })) + '.mock_signature';
      return {
        status: 'success',
        code: 200,
        data: {
          token: refreshedToken,
          accessToken: refreshedToken,
        },
      };
    }

    // 6. POST /auth/forgot-password or /api/forgot-password
    if (method === 'POST' && endpoint.includes('/forgot-password')) {
      return {
        status: 'success',
        code: 200,
        message: 'Instruções de redefinição de palavra-passe enviadas para o e-mail informado.',
      };
    }

    // 7. GET /api/health
    if (method === 'GET' && endpoint.includes('/health')) {
      return {
        status: 'healthy',
        uptime: '99.98%',
        version: 'v1.4.2-golang',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: 'success',
      code: 200,
      data: { ok: true, endpoint },
    };
  }
}

export const apiClient = new ApiClient();
