import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Trip, TripStatus, VehicleType } from '../../types';
import {
  Navigation,
  Car,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  MapPin,
  Plus,
  Phone,
  User,
  Star,
  Receipt,
} from 'lucide-react';

interface TripListProps {
  onOpenNewTrip: () => void;
  onFocusVehicleOnMap?: (vehicleId: string) => void;
}

export const TripList: React.FC<TripListProps> = ({ onOpenNewTrip, onFocusVehicleOnMap }) => {
  const { trips, updateTripStatus, setSelectedVehicleId } = useFleet();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TripStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | VehicleType>('all');
  const [selectedReceiptTrip, setSelectedReceiptTrip] = useState<Trip | null>(null);

  const filteredTrips = trips.filter(t => {
    const matchSearch =
      t.passengerName.toLowerCase().includes(search.toLowerCase()) ||
      t.passengerPhone.includes(search) ||
      t.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      t.driverName.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.address.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchType = typeFilter === 'all' || t.vehicleType === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case 'in_progress':
        return { label: 'Em Andamento', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' };
      case 'completed':
        return { label: 'Concluída', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300' };
      case 'cancelled':
        return { label: 'Cancelada', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300' };
      case 'accepted':
        return { label: 'Aceita / Despachada', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300' };
      case 'requested':
        return { label: 'Solicitada', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h2 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <span>Gestão de Corridas & Despacho de Táxis / Motas</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
              {filteredTrips.length} Corridas
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Controlo de origens, destinos, faturamento em Kwanzas (AOA) e despacho imediato.
          </p>
        </div>

        <button
          onClick={onOpenNewTrip}
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Despachar Nova Corrida</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por passageiro, destino ou condutor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none"
          >
            <option value="all">Todos os Status de Corrida</option>
            <option value="in_progress">🟢 Em Andamento</option>
            <option value="completed">🔵 Concluídas</option>
            <option value="cancelled">🔴 Canceladas</option>
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none"
          >
            <option value="all">Todos os Tipos de Transporte</option>
            <option value="car_taxi">🚗 Carros Táxis</option>
            <option value="moto_taxi">🏍️ Moto-Táxis</option>
          </select>
        </div>
      </div>

      {/* Trips Cards / Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredTrips.map(trip => {
          const isCar = trip.vehicleType === 'car_taxi';
          const badge = getStatusBadge(trip.status);

          return (
            <div
              key={trip.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Header */}
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
                        <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                          {trip.passengerName}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">
                          ({trip.passengerPhone})
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {trip.vehiclePlate} • {isCar ? 'Carro Táxi' : 'Moto-Táxi'} • {trip.driverName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400 block">
                      {trip.fareAOA.toLocaleString('pt-PT')} Kz
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Route */}
                <div className="mt-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 truncate">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">Origem: {trip.origin.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-gray-200 font-medium truncate">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="truncate">Destino: {trip.destination.address}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono px-1">
                  <span>Distância: {trip.distanceKm} km</span>
                  <span>
                    Duração: {trip.actualDurationMinutes || trip.estimatedDurationMinutes} min
                  </span>
                  <span>Pagamento: {trip.paymentMethod.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedReceiptTrip(trip)}
                  className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Recibo</span>
                </button>

                <div className="flex items-center gap-2">
                  {trip.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedVehicleId(trip.vehicleId);
                          if (onFocusVehicleOnMap) onFocusVehicleOnMap(trip.vehicleId);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold hover:bg-gray-300"
                      >
                        Ver no GPS
                      </button>

                      <button
                        onClick={() => updateTripStatus(trip.id, 'completed', 5)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Concluir</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Digital Receipt Modal */}
      {selectedReceiptTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 space-y-4">
            <div className="text-center pb-3 border-b border-dashed border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-gray-950 font-extrabold flex items-center justify-center mx-auto mb-2 text-base">
                FG
              </div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                FleetGo Angola • Recibo Digital
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">
                Corrida: {selectedReceiptTrip.tripNumber}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Passageiro:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedReceiptTrip.passengerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Condutor:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {selectedReceiptTrip.driverName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Veículo / Matrícula:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {selectedReceiptTrip.vehiclePlate} ({selectedReceiptTrip.vehicleType === 'car_taxi' ? 'Carro Táxi' : 'Moto-Táxi'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Distância Percorrida:</span>
                <span className="font-mono">{selectedReceiptTrip.distanceKm} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data / Hora:</span>
                <span>{new Date(selectedReceiptTrip.startTime).toLocaleString('pt-PT')}</span>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm">
                <span className="font-bold text-gray-900 dark:text-white">Total Pago:</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-base">
                  {selectedReceiptTrip.fareAOA.toLocaleString('pt-PT')} Kz
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setSelectedReceiptTrip(null)}
                className="w-full py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-300 transition-colors"
              >
                Fechar Recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
