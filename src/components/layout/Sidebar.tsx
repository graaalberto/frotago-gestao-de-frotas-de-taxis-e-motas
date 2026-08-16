import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Car,
  Navigation,
  Users,
  Camera,
  Wrench,
  BarChart3,
  Sliders,
  Terminal,
  FileSpreadsheet,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { useAuth } from '../../context/AuthContext';

export type TabType =
  | 'dashboard'
  | 'map'
  | 'vehicles'
  | 'trips'
  | 'drivers'
  | 'stops'
  | 'breakdowns'
  | 'analytics'
  | 'rules'
  | 'api_debugger';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenNewTrip: () => void;
  onOpenNewStop: () => void;
  onOpenReportBreakdown: () => void;
  onOpenExport?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewTrip,
  onOpenNewStop,
  onOpenReportBreakdown,
}) => {
  const { vehicles, trips, stopReports, breakdowns, exportFleetData } = useFleet();
  const { user } = useAuth();

  const activeBreakdownsCount = breakdowns.filter(b => b.status !== 'repaired' && b.status !== 'closed').length;
  const pendingStopsCount = stopReports.filter(s => s.status === 'pending_review').length;
  const inTripCount = vehicles.filter(v => v.status === 'in_trip').length;

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Painel Geral',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'map' as TabType,
      label: 'Monitoramento GPS',
      icon: MapPin,
      badge: inTripCount > 0 ? `${inTripCount} live` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'vehicles' as TabType,
      label: 'Frota: Carros & Motas',
      icon: Car,
      badge: `${vehicles.length}`,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'trips' as TabType,
      label: 'Corridas & Despacho',
      icon: Navigation,
      badge: `${trips.length}`,
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'drivers' as TabType,
      label: 'Gestão de Motoristas',
      icon: Users,
      badge: null,
    },
    {
      id: 'stops' as TabType,
      label: 'Relatórios de Paragem',
      icon: Camera,
      badge: pendingStopsCount > 0 ? `${pendingStopsCount}` : null,
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    },
    {
      id: 'breakdowns' as TabType,
      label: 'Avarias & Manutenção',
      icon: Wrench,
      badge: activeBreakdownsCount > 0 ? `${activeBreakdownsCount}` : null,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    {
      id: 'analytics' as TabType,
      label: 'Relatórios & Gráficos',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'rules' as TabType,
      label: 'Regras de Alerta',
      icon: Sliders,
      badge: null,
    },
    {
      id: 'api_debugger' as TabType,
      label: 'Configurações API',
      icon: Terminal,
      badge: 'JWT',
      badgeColor: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#0F0F12] border-r border-slate-800 flex flex-col justify-between select-none text-slate-50 min-h-[calc(100vh-5rem)]">
      <div>
        {/* Brand Block */}
        <div className="p-6 border-b border-slate-800/80">
          <h1 className="text-2xl font-black tracking-tighter text-indigo-500">
            FROTA<span className="text-white">GO</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Management Systems
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="p-4 space-y-2">
          <button
            onClick={onOpenNewTrip}
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Despachar Corrida</span>
          </button>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onOpenNewStop}
              className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Camera className="w-3 h-3 text-indigo-400" />
              <span>Paragem</span>
            </button>
            <button
              onClick={onOpenReportBreakdown}
              className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-orange-400 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3 h-3 text-orange-400" />
              <span>Avaria</span>
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1.5 pb-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left transition-all ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 px-3.5 py-2.5 rounded-xl border border-indigo-500/20 flex items-center justify-between font-semibold text-xs shadow-sm'
                    : 'text-slate-400 px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-800/60 hover:text-slate-200 rounded-xl text-xs'
                }`}
                id={`sidebar-tab-${item.id}`}
              >
                <div className="flex items-center gap-3 truncate">
                  {isActive ? (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] shrink-0" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                      isActive
                        ? 'bg-indigo-950 text-indigo-300 border-indigo-500/40'
                        : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Session Card (Artistic Flair Footer) */}
      <div className="p-4 mt-auto border-t border-slate-800 bg-[#0A0A0B]/60 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0">
            {user ? user.name.slice(0, 2).toUpperCase() : 'JD'}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-200 truncate">
              {user ? user.name : 'João Dos Santos'}
            </p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              {user ? (user.role === 'admin' ? 'Admin Principal' : user.role) : 'Admin Principal'}
            </p>
          </div>
        </div>

        <button
          onClick={() => exportFleetData('csv')}
          className="w-full mt-2 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
        >
          <FileSpreadsheet className="w-3 h-3 text-indigo-400" />
          <span>Exportar Dados Frota</span>
        </button>
      </div>
    </aside>
  );
};
