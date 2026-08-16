import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Vehicle, VehicleType, VehicleStatus } from '../../types';
import {
  Car,
  Navigation,
  Fuel,
  Droplets,
  Thermometer,
  Gauge,
  Plus,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Clock,
  MoreVertical,
  QrCode,
} from 'lucide-react';

interface VehicleListProps {
  onOpenNewVehicle: () => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onDispatchTrip: (vehicle: Vehicle) => void;
  onReportBreakdown: (vehicle: Vehicle) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  onOpenNewVehicle,
  onSelectVehicle,
  onDispatchTrip,
  onReportBreakdown,
}) => {
  const { vehicles } = useFleet();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | VehicleType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | VehicleStatus>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredVehicles = vehicles.filter(v => {
    const matchSearch =
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      (v.driverName && v.driverName.toLowerCase().includes(search.toLowerCase()));

    const matchType = typeFilter === 'all' || v.type === typeFilter;
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'in_trip':
        return { label: 'Em Corrida', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' };
      case 'idle':
        return { label: 'Livre / Disponível', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800' };
      case 'stopped':
        return { label: 'Em Paragem', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800' };
      case 'maintenance':
        return { label: 'Em Manutenção', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800' };
      case 'critical_breakdown':
        return { label: 'Avaria Crítica', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h2 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <span>Frota de Veículos: Carros Táxis & Moto-Táxis</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
              {filteredVehicles.length} de {vehicles.length}
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Monitorização de telemetria, combustível, óleo e estado mecânico em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-0.5 border border-gray-200 dark:border-gray-700 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Grade
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Tabela
            </button>
          </div>

          <button
            onClick={onOpenNewVehicle}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-[0.98]"
            id="add-vehicle-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Veículo</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por matrícula, modelo, marca ou motorista..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none font-medium"
          >
            <option value="all">Todos os Tipos de Veículos</option>
            <option value="car_taxi">🚗 Carros Táxis</option>
            <option value="moto_taxi">🏍️ Moto-Táxis</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none font-medium"
          >
            <option value="all">Todos os Status Operacionais</option>
            <option value="in_trip">🟢 Em Corrida com Passageiro</option>
            <option value="idle">🔵 Livre / Disponível</option>
            <option value="stopped">🟡 Em Paragem / Feedback</option>
            <option value="maintenance">🟣 Em Manutenção</option>
            <option value="critical_breakdown">🔴 Avaria Crítica / Oficina</option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredVehicles.map(veh => {
            const isCar = veh.type === 'car_taxi';
            const badge = getStatusBadge(veh.status);

            return (
              <div
                key={veh.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 hover:shadow-md transition-all flex flex-col justify-between space-y-3.5"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                          isCar ? 'bg-amber-500 text-gray-950' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {isCar ? <Car className="w-5 h-5" /> : <Navigation className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-gray-900 dark:text-white font-mono">
                            {veh.plate}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            ({veh.year})
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold truncate max-w-[170px]">
                          {veh.brand} {veh.model}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Driver & Location Info */}
                  <div className="mt-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-gray-700 dark:text-gray-300 font-medium">
                      <span>Condutor: <strong>{veh.driverName || 'Sem motorista'}</strong></span>
                      <span className="font-mono text-[11px] text-gray-500">
                        {veh.odometerKm.toLocaleString()} km
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      📍 {veh.coordinates.address}
                    </p>
                  </div>

                  {/* Telemetry Progress Bars */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {/* Gasolina */}
                    <div className="p-2 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                          <Fuel className="w-3.5 h-3.5 text-amber-500" />
                          <span>Gasolina</span>
                        </span>
                        <span
                          className={`font-bold text-xs ${
                            veh.fuelLevel < 20 ? 'text-rose-500' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {veh.fuelLevel}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            veh.fuelLevel < 20 ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${veh.fuelLevel}%` }}
                        />
                      </div>
                    </div>

                    {/* Óleo */}
                    <div className="p-2 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                          <Droplets className="w-3.5 h-3.5 text-purple-500" />
                          <span>Óleo Motor</span>
                        </span>
                        <span
                          className={`font-bold text-xs ${
                            veh.oilHealth < 30 ? 'text-rose-500' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {veh.oilHealth}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            veh.oilHealth < 30 ? 'bg-rose-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${veh.oilHealth}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Micro Telemetry Stats */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono px-1">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-blue-500" />
                      <span>{veh.speedKmH} km/h</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-rose-500" />
                      <span>{veh.engineTempC}°C</span>
                    </span>
                    <span>Pneus: {veh.tirePressureBar} bar</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <button
                    onClick={() => onSelectVehicle(veh)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                    <span>Detalhes</span>
                  </button>

                  {veh.status === 'idle' && (
                    <button
                      onClick={() => onDispatchTrip(veh)}
                      className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Despachar</span>
                    </button>
                  )}

                  <button
                    onClick={() => onReportBreakdown(veh)}
                    className="py-1.5 px-2.5 rounded-xl border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center justify-center transition-colors"
                    title="Reportar Avaria"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="p-3 pl-4">Veículo / Matrícula</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Condutor</th>
                <th className="p-3">Status</th>
                <th className="p-3">Gasolina</th>
                <th className="p-3">Óleo</th>
                <th className="p-3">Velocidade</th>
                <th className="p-3">Temp. Motor</th>
                <th className="p-3">Odômetro</th>
                <th className="p-3 pr-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {filteredVehicles.map(veh => {
                const badge = getStatusBadge(veh.status);
                return (
                  <tr
                    key={veh.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-3 pl-4 font-bold text-gray-900 dark:text-white font-mono">
                      {veh.plate}
                      <span className="block text-[11px] text-gray-500 font-normal">
                        {veh.brand} {veh.model}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        {veh.type === 'car_taxi' ? '🚗 Carro Táxi' : '🏍️ Moto-Táxi'}
                      </span>
                    </td>
                    <td className="p-3 font-medium">
                      {veh.driverName || <span className="text-gray-400">Não atribuído</span>}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">
                      <span className={veh.fuelLevel < 20 ? 'text-rose-500 font-bold' : ''}>
                        {veh.fuelLevel}%
                      </span>
                    </td>
                    <td className="p-3 font-semibold">
                      <span className={veh.oilHealth < 30 ? 'text-rose-500 font-bold' : ''}>
                        {veh.oilHealth}%
                      </span>
                    </td>
                    <td className="p-3 font-mono">{veh.speedKmH} km/h</td>
                    <td className="p-3 font-mono">
                      <span className={veh.engineTempC > 95 ? 'text-rose-500 font-bold' : ''}>
                        {veh.engineTempC}°C
                      </span>
                    </td>
                    <td className="p-3 font-mono">{veh.odometerKm.toLocaleString()} km</td>
                    <td className="p-3 pr-4 text-right">
                      <button
                        onClick={() => onSelectVehicle(veh)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-amber-500 hover:text-gray-950 font-semibold text-[11px] transition-colors"
                      >
                        Inspecionar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
