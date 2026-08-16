import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Shield,
  Key,
  AlertCircle,
  CheckCircle2,
  Car,
  Server,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, socialLogin, error, clearError, isLoading, apiConfig } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('fleet_manager');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [localErr, setLocalErr] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalErr(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        await login(email, password);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        onClose();
      } else if (mode === 'register') {
        if (!name) {
          setLocalErr('Por favor informe o nome completo.');
          return;
        }
        await register({ name, email, password, role, phone });
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
        onClose();
      } else {
        // Forgot password
        setSuccessMsg('Instruções de recuperação enviadas para ' + email);
      }
    } catch (err: any) {
      setLocalErr(err.message || 'Erro durante a autenticação.');
    }
  };

  const handleSocial = async (provider: 'google' | 'github' | 'apple') => {
    clearError();
    setLocalErr(null);
    try {
      await socialLogin(provider);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      onClose();
    } catch (err: any) {
      setLocalErr(err.message || `Falha na autenticação via ${provider}`);
    }
  };

  const fillQuickDemo = (roleChoice: 'admin' | 'manager' | 'driver') => {
    if (roleChoice === 'admin') {
      setEmail('admin@fleetgo.co');
      setPassword('admin123456');
    } else if (roleChoice === 'manager') {
      setEmail('gestor@fleetgo.co');
      setPassword('gestor123456');
    } else {
      setEmail('taxista@fleetgo.co');
      setPassword('taxista123456');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-gray-950 font-bold">
              <Car className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-gray-900 dark:text-white">
                {mode === 'login' && 'Entrar no FleetGo'}
                {mode === 'register' && 'Cadastrar Nova Conta'}
                {mode === 'forgot' && 'Recuperar Palavra-passe'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Autenticação via Golang Auth API JWT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Backend Info Pill */}
        <div className="px-6 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/50 dark:border-amber-900/30 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Server className="w-3.5 h-3.5" />
            <span>Endpoint: {apiConfig.baseUrl}</span>
          </div>
          <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-950 dark:text-amber-200">
            {apiConfig.useMockSimulation ? 'SIMULAÇÃO GOLANG' : 'SERVIDOR REAL'}
          </span>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Error Banner */}
          {(localErr || error) && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erro retornado pela API Golang:</p>
                <p>{localErr || error}</p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{successMsg}</p>
            </div>
          )}

          {/* Social Logins */}
          {mode !== 'forgot' && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center">
                Entrar com Serviço Social
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSocial('google')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocial('github')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocial('apple')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.83.93-2.89-.91.04-2.02.61-2.67 1.37-.58.67-1.08 1.74-.95 2.78 1.02.08 2.06-.5 2.69-1.26z" />
                  </svg>
                  <span>Apple</span>
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                <span className="flex-shrink mx-3 text-[11px] text-gray-400 uppercase">ou com e-mail</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mateus Kipupa"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+244 923 000 000"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Função no Sistema
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as UserRole)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none"
                    >
                      <option value="fleet_manager">Gestor de Frota</option>
                      <option value="driver">Taxista / Motorista</option>
                      <option value="dispatcher">Despachante de Tráfego</option>
                      <option value="admin">Administrador Geral</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Endereço de E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="utilizador@fleetgo.co"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Palavra-passe
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Esqueceu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>A processar requisição...</span>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>
                    {mode === 'login' && 'Entrar na Conta'}
                    {mode === 'register' && 'Criar Conta (POST /api/register)'}
                    {mode === 'forgot' && 'Enviar E-mail de Recuperação'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fillers */}
          {mode === 'login' && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center mb-1.5 font-medium">
                ⚡ Preenchimento Rápido de Demonstração:
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => fillQuickDemo('admin')}
                  className="py-1 px-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-[11px] truncate transition-colors"
                >
                  Admin Geral
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('manager')}
                  className="py-1 px-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-[11px] truncate transition-colors"
                >
                  Gestor Frota
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('driver')}
                  className="py-1 px-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-[11px] truncate transition-colors"
                >
                  Taxista Mota
                </button>
              </div>
            </div>
          )}

          {/* Footer toggle */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
            {mode === 'login' ? (
              <p>
                Não tem uma conta de gestor ou taxista?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Cadastre-se aqui
                </button>
              </p>
            ) : (
              <p>
                Já possui uma conta registrada?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Faça login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
