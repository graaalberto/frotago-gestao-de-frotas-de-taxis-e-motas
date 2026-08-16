import React from 'react';
import { useFleet } from '../../context/FleetContext';
import {
  Car,
  Navigation,
  Fuel,
  Droplets,
  Wrench,
  AlertTriangle,
  Coins,
} from 'lucide-react';

export const StatsOverview: React.FC = () => {
  const { vehicles, trips, breakdowns, stopReports } = useFleet();

  const inTripVehicles = vehicles.filter(v => v.status === 'in_trip');
  const idleVehicles = vehicles.filter(v => v.status === 'idle');
  const activeBreakdowns = breakdowns.filter(b => b.status !== 'repaired' && b.status !== 'closed');
  const pendingStops = stopReports.filter(s => s.status === 'pending_review');

  const criticalFuelCount = vehicles.filter(v => v.fuelLevel < 20).length;
  const criticalOilCount = vehicles.filter(v => v.oilHealth < 30).length;

  const totalEarningsAOA = trips
    .filter(t => t.status === 'completed' || t.status === 'in_progress')
    .reduce((sum, t) => sum + t.fareAOA, 0);

  const activePercent = vehicles.length > 0
    ? Math.round(((vehicles.length - activeBreakdowns.length) / vehicles.length) * 100)
    : 85;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* 1. Veículos Ativos */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Veículos Operacionais
            </p>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {activePercent}% Online
            </span>
          </div>
          <p className="text-3xl font-black tracking-tighter text-slate-50">
            {vehicles.length}
          </p>
        </div>
        <div className="mt-4">
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${activePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1.5">
            <span>{idleVehicles.length} livres</span>
            <span>{inTripVehicles.length} em rota</span>
          </div>
        </div>
      </div>

      {/* 2. Corridas em Curso */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Corridas em Curso
            </p>
            <span className="text-[10px] font-mono font-bold text-indigo-400">
              {totalEarningsAOA.toLocaleString('pt-PT')} Kz
            </span>
          </div>
          <p className="text-3xl font-black tracking-tighter text-indigo-400">
            {inTripVehicles.length}
          </p>
        </div>
        <div className="mt-4">
          <div className="flex gap-1">
            <div className="h-1 flex-1 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            <div className={`h-1 flex-1 rounded-full ${inTripVehicles.length > 1 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
            <div className={`h-1 flex-1 rounded-full ${inTripVehicles.length > 3 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
            <div className={`h-1 flex-1 rounded-full ${inTripVehicles.length > 5 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
          </div>
          <p className="text-[10px] mt-2 text-slate-400 truncate">
            {trips.length} corridas acumuladas hoje
          </p>
        </div>
      </div>

      {/* 3. Alertas de Óleo / Gás */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Alertas de Óleo / Gás
            </p>
            <span className="text-[10px] font-mono font-bold text-orange-400">
              Telemetria
            </span>
          </div>
          <p className="text-3xl font-black tracking-tighter text-orange-500">
            {String(criticalFuelCount + criticalOilCount + activeBreakdowns.length).padStart(2, '0')}
          </p>
        </div>
        <div className="mt-4">
          <p className="text-[10px] text-orange-400 font-medium flex items-center gap-1 truncate">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>
              {criticalFuelCount > 0
                ? `${criticalFuelCount} veículos em reserva crítica`
                : activeBreakdowns.length > 0
                ? `${activeBreakdowns.length} em avaria mecânica`
                : 'Parâmetros de combustível OK'}
            </span>
          </p>
        </div>
      </div>

      {/* 4. Feedback de Paragem */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Feedback de Paragem
            </p>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              Condutores
            </span>
          </div>
          <p className="text-3xl font-black tracking-tighter text-slate-50">
            {stopReports.length}
          </p>
        </div>
        <div className="mt-4">
          <p className="text-[10px] text-slate-500 truncate">
            {pendingStops.length > 0
              ? `⚠️ ${pendingStops.length} relatórios aguardam aprovação`
              : 'Relatórios de paragem técnica em dia'}
          </p>
        </div>
      </div>
    </div>
  );
};
