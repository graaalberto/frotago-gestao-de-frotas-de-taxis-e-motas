import React from 'react';
import { useFleet } from '../../context/FleetContext';
import { Trip } from '../../types';
import {
  Navigation,
  Car,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';

interface ActiveTripsFeedProps {
  onOpenNewTrip: () => void;
  onFocusVehicleOnMap?: (vehicleId: string) => void;
}

export const ActiveTripsFeed: React.FC<ActiveTripsFeedProps> = ({
  onOpenNewTrip,
  onFocusVehicleOnMap,
}) => {
  const { trips, updateTripStatus, setSelectedVehicleId } = useFleet();

  const activeTrips = trips.filter(t => t.status === 'in_progress');
  const recentCompleted = trips.filter(t => t.status === 'completed').slice(0, 3);

  const handleCompleteTrip = (trip: Trip) => {
    updateTripStatus(trip.id, 'completed', 5);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col space-y-4 text-slate-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>Corridas em Andamento</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-950 text-indigo-300 border border-indigo-500/30">
              {activeTrips.length} Ativas
            </span>
          </h3>
          <p className="text-[11px] text-slate-500">
            Monitorização em tempo real de passageiros e tarifas
          </p>
        </div>

        <button
          onClick={onOpenNewTrip}
          className="p-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Despachar</span>
        </button>
      </div>

      {/* Trips list */}
      <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
        {activeTrips.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs space-y-2">
            <p>Nenhuma corrida em andamento no momento.</p>
            <button
              onClick={onOpenNewTrip}
              className="font-bold text-indigo-400 hover:text-indigo-300"
            >
              Clique para despachar um táxi ou moto-táxi
            </button>
          </div>
        ) : (
          activeTrips.map(trip => {
            const isCar = trip.vehicleType === 'car_taxi';
            return (
              <div
                key={trip.id}
                className="p-3.5 rounded-2xl border border-slate-800/80 bg-black/40 hover:border-indigo-500/40 transition-all text-xs space-y-2.5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isCar ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isCar ? <Car className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-100 flex items-center gap-1.5">
                        <span>{trip.passengerName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({trip.passengerPhone})</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {trip.vehiclePlate} • {trip.driverName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-indigo-400 text-sm block">
                      {trip.fareAOA.toLocaleString('pt-PT')} Kz
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-500">
                      {trip.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Route */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-400 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">De: {trip.origin.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-200 font-medium truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span className="truncate">Para: {trip.destination.address}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span>{trip.distanceKm} km</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedVehicleId(trip.vehicleId);
                        if (onFocusVehicleOnMap) onFocusVehicleOnMap(trip.vehicleId);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                    >
                      Radar GPS
                    </button>

                    <button
                      onClick={() => handleCompleteTrip(trip)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Concluir</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Recently completed trips list mini */}
        {recentCompleted.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Últimas Corridas Concluídas
            </span>
            <div className="space-y-1.5">
              {recentCompleted.map(comp => (
                <div
                  key={comp.id}
                  className="p-2 rounded-xl bg-black/30 border border-slate-800/60 flex items-center justify-between text-[11px]"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-300">
                      {comp.passengerName}
                    </span>
                    <span className="text-slate-500 block truncate text-[10px]">
                      {comp.destination.address}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-400 shrink-0 font-mono">
                    +{comp.fareAOA.toLocaleString()} Kz
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
