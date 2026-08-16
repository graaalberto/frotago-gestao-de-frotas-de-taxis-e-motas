import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { BreakdownReport, BreakdownSeverity } from '../../types';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coins,
  Search,
  Plus,
  Car,
  Navigation,
  UserCheck,
} from 'lucide-react';

interface BreakdownManagerProps {
  onOpenNewBreakdown: () => void;
}

export const BreakdownManager: React.FC<BreakdownManagerProps> = ({ onOpenNewBreakdown }) => {
  const { breakdowns, updateBreakdownStatus, vehicles } = useFleet();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | BreakdownSeverity>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'reported' | 'in_workshop' | 'repaired'>('all');

  const filteredBreakdowns = breakdowns.filter(b => {
    const matchSearch =
      b.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase()) ||
      b.driverName.toLowerCase().includes(search.toLowerCase());

    const matchSeverity = severityFilter === 'all' || b.severity === severityFilter;
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchSearch && matchSeverity && matchStatus;
  });

  const getSeverityBadge = (sev: BreakdownSeverity) => {
    switch (sev) {
      case 'critical':
        return { label: 'CRÍTICA / IMOBILIZADO', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-400' };
      case 'high':
        return { label: 'ALTA SEVERIDADE', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-400' };
      case 'medium':
        return { label: 'MÉDIA', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-400' };
      case 'low':
        return { label: 'LEVE / PREVENTIVA', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-400' };
      default:
        return { label: sev, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const totalCostAOA = breakdowns.reduce((sum, b) => sum + (b.estimatedCostAOA || 0), 0);
  const activeIssues = breakdowns.filter(b => b.status !== 'repaired' && b.status !== 'closed').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h2 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <span>Gestão de Avarias & Manutenção Mecânica da Frota</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              {activeIssues} Ativas
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Controlo de oficinas parceiras, custos em Kwanzas (AOA) e histórico de avarias.
          </p>
        </div>

        <button
          onClick={onOpenNewBreakdown}
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Reportar Nova Avaria</span>
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block">Total de Avarias Registadas</span>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white font-mono">
              {breakdowns.length}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block">Veículos em Oficina / Avariados</span>
            <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {activeIssues}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block">Despesa Acumulada em Peças</span>
            <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {totalCostAOA.toLocaleString('pt-PT')} Kz
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por matrícula ou descrição da avaria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none"
          >
            <option value="all">Todas as Gravidades</option>
            <option value="critical">🔴 Crítica / Imobilizado</option>
            <option value="high">🟠 Alta</option>
            <option value="medium">🟡 Média</option>
            <option value="low">🔵 Baixa / Preventiva</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none"
          >
            <option value="all">Todos os Status de Reparo</option>
            <option value="reported">Reportado</option>
            <option value="in_workshop">Em Oficina</option>
            <option value="repaired">Reparado & Liberado</option>
          </select>
        </div>
      </div>

      {/* Breakdowns List */}
      <div className="space-y-3">
        {filteredBreakdowns.map(bk => {
          const badge = getSeverityBadge(bk.severity);
          const isResolved = bk.status === 'repaired' || bk.status === 'closed';

          return (
            <div
              key={bk.id}
              className={`p-4 rounded-2xl border bg-white dark:bg-gray-900 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                !isResolved
                  ? 'border-rose-200 dark:border-rose-900/60 ring-1 ring-rose-500/10'
                  : 'border-gray-200 dark:border-gray-800 opacity-80'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-sm text-gray-900 dark:text-white font-mono">
                    {bk.vehiclePlate}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Categoria: <strong>{bk.category.toUpperCase()}</strong>
                  </span>
                </div>

                <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                  {bk.title}
                </h4>

                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {bk.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                  <span>Condutor: {bk.driverName}</span>
                  <span>• Mecânico: {bk.mechanicName || 'Oficina Geral'}</span>
                  <span>• Custo Est.: {bk.estimatedCostAOA?.toLocaleString('pt-PT')} Kz</span>
                  <span>• {new Date(bk.reportedAt).toLocaleDateString('pt-PT')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {!isResolved ? (
                  <button
                    onClick={() => updateBreakdownStatus(bk.id, 'repaired', 'Reparo concluído')}
                    className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Concluir Reparo & Liberar</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Reparado e Aprovado</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
