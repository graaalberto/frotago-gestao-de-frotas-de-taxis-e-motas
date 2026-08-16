import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useFleet } from '../../context/FleetContext';
import {
  Bell,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Server,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Search,
  Key,
  Menu,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenProfile: () => void;
  onOpenApiConfig: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLogin,
  onOpenRegister,
  onOpenProfile,
  onOpenApiConfig,
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const { user, isAuthenticated, logout, apiConfig } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    isSimulating,
    toggleSimulation,
    soundEnabled,
    toggleSound,
    unreadNotificationsCount,
    exportFleetData,
  } = useFleet();

  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-20 border-b border-slate-800 bg-[#0A0A0B]/90 backdrop-blur-md text-slate-50 transition-colors">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & System Status */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-indigo-500">
                FROTA<span className="text-white">GO</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                ANGOLA
              </span>
            </div>
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold hidden sm:block">
              Management Systems
            </p>
          </div>

          {/* Theme Mode Toggle (Artistic Flair Twin Squares) */}
          <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              title="Modo Dia (Claro)"
              className={`h-7 w-7 rounded flex items-center justify-center text-xs transition-all ${
                theme === 'light'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => theme === 'light' && toggleTheme()}
              title="Modo Noite (Escuro)"
              className={`h-7 w-7 rounded flex items-center justify-center text-xs transition-all ${
                theme === 'dark'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Search Pill (Artistic Flair Rounded Full) */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="h-10 w-full bg-slate-900 rounded-full border border-slate-800 px-4 flex items-center gap-2.5 text-slate-400 text-xs focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Pesquisar por matrícula, ID ou motorista..."
              className="w-full bg-transparent border-none text-slate-200 placeholder-slate-500 text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Telemetry stream, Golang API, Notifications & Export Button */}
        <div className="flex items-center gap-3">
          {/* Live Telemetry Indicator */}
          <button
            onClick={toggleSimulation}
            title={isSimulating ? 'Pausar Telemetria' : 'Retomar Telemetria'}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              isSimulating
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.7)]' : 'bg-slate-600'}`} />
            <span className="text-[11px] font-bold">{isSimulating ? 'LIVE GPS' : 'PAUSADO'}</span>
            {isSimulating ? <Pause className="w-3 h-3 ml-0.5 opacity-70" /> : <Play className="w-3 h-3 ml-0.5 opacity-70" />}
          </button>

          {/* Golang API Pill */}
          <button
            onClick={onOpenApiConfig}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/40 transition-colors"
            title="Golang Auth API & Request Inspector"
          >
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-semibold">
              {apiConfig.useMockSimulation ? 'Golang API (Demo)' : 'Golang API (Live)'}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Silenciar alertas sonoros' : 'Ativar alertas sonoros'}
            className="h-8 w-8 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={onOpenApiConfig}
              className="relative h-8 w-8 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Alertas do Sistema"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0A0A0B] shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              )}
            </button>
          </div>

          {/* Export Report Action (Design Specific White Button) */}
          <button
            onClick={() => exportFleetData('csv')}
            className="hidden sm:flex items-center gap-1.5 bg-white text-black hover:bg-slate-200 px-3.5 py-2 rounded-md text-xs font-black uppercase tracking-tight shadow-md active:scale-95 transition-all"
            title="Exportar Relatório Geral de Corridas"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar Relatório</span>
          </button>

          {/* User Account / Auth trigger */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-black text-xs text-white">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-200 truncate max-w-[90px]">
                    {user.name.split(' ')[0]}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold">
                    {user.role === 'admin' ? 'Admin' : 'Gestor'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0F0F12] border border-slate-800 shadow-2xl z-50 py-2 text-xs">
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="font-extrabold text-slate-100 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                        {user.role.toUpperCase()}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenProfile();
                        }}
                        className="w-full px-4 py-2 text-left flex items-center gap-2 text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-indigo-400" />
                        <span>Perfil & Segurança (Golang /api/me)</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenApiConfig();
                        }}
                        className="w-full px-4 py-2 text-left flex items-center gap-2 text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        <Key className="w-4 h-4 text-indigo-400" />
                        <span>Configurações API & Logs</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-left flex items-center gap-2 text-rose-400 hover:bg-rose-950/40 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Terminar Sessão</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 rounded-md text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={onOpenRegister}
                className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
              >
                Criar Conta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
