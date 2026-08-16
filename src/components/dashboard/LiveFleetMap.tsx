import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Vehicle } from '../../types';
import {
  Car,
  Fuel,
  Droplets,
  Gauge,
  Thermometer,
  Eye,
  Navigation,
  AlertTriangle,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface LiveFleetMapProps {
  onSelectVehicle?: (vehicle: Vehicle) => void;
  fullHeight?: boolean;
}

export const LiveFleetMap: React.FC<LiveFleetMapProps> = ({ onSelectVehicle, fullHeight = false }) => {
  const { vehicles, trips, selectedVehicleId, setSelectedVehicleId } = useFleet();

  const [filterType, setFilterType] = useState<'all' | 'car_taxi' | 'moto_taxi' | 'in_trip' | 'issues'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Map bounding coordinates for Luanda area:
  const minLat = -8.96;
  const maxLat = -8.78;
  const minLng = 13.15;
  const maxLng = 13.32;

  // Convert lat/lng to percentage X/Y
  const getCoordinatesPct = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return {
      x: Math.max(6, Math.min(94, x)),
      y: Math.max(10, Math.min(90, y)),
    };
  };

  const filteredVehicles = vehicles.filter(v => {
    if (filterType === 'car_taxi') return v.type === 'car_taxi';
    if (filterType === 'moto_taxi') return v.type === 'moto_taxi';
    if (filterType === 'in_trip') return v.status === 'in_trip';
    if (filterType === 'issues') return v.status === 'critical_breakdown' || v.status === 'stopped' || v.fuelLevel < 20 || v.oilHealth < 30;
    return true;
  });

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const activeTrip = trips.find(t => t.vehicleId === selectedVehicleId && t.status === 'in_progress');

  return (
    <div
      className={`bg-[#121216] border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col transition-all text-slate-50 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : fullHeight ? 'h-[720px]' : 'h-[460px]'
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 z-10">
        <div>
          <h3 className="font-bold text-lg text-slate-100 tracking-tight">
            Monitoramento Geográfico em Tempo Real
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Luanda Metrópole • {filteredVehicles.length} de {vehicles.length} viaturas ativas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            LIVE UPDATES
          </span>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('car_taxi')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                filterType === 'car_taxi'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Carros
            </button>
            <button
              onClick={() => setFilterType('moto_taxi')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                filterType === 'moto_taxi'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Motas
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isFullscreen ? 'Reduzir' : 'Tela Cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map Interactive Canvas */}
      <div className="relative flex-1 bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden select-none">
        {/* Artistic Flair Dot Matrix Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Vector Arteries & Coastlines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-50 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Coastline */}
          <path
            d="M 0,40 Q 180,60 350,140 T 600,240 T 950,340 L 1400,450"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            opacity="0.4"
          />
          <path
            d="M 60,50 Q 140,70 240,120"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.4"
          />

          {/* Primary Arteries */}
          <path
            d="M 120,130 L 480,190 L 850,290 L 1150,420"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            opacity="0.5"
            strokeDasharray="6 4"
          />
          <path
            d="M 300,100 L 380,270 L 560,450"
            fill="none"
            stroke="#475569"
            strokeWidth="1.5"
            opacity="0.4"
          />

          {/* Zones */}
          <text x="180" y="80" fill="#64748b" fontSize="10" fontWeight="bold" letterSpacing="1px">
            BAÍA DE LUANDA
          </text>
          <text x="360" y="160" fill="#64748b" fontSize="10" letterSpacing="1px">
            MUTAMBA / MAIANGA
          </text>
          <text x="620" y="240" fill="#64748b" fontSize="10" letterSpacing="1px">
            AEROPORTO 4 DE FEVEREIRO
          </text>
          <text x="800" y="340" fill="#64748b" fontSize="10" letterSpacing="1px">
            TALATONA
          </text>
        </svg>

        {/* Live Vehicle Markers */}
        {filteredVehicles.map(veh => {
          const { x, y } = getCoordinatesPct(veh.coordinates.lat, veh.coordinates.lng);
          const isSelected = selectedVehicleId === veh.id;
          const isCar = veh.type === 'car_taxi';
          const isInTrip = veh.status === 'in_trip';
          const isBreakdown = veh.status === 'critical_breakdown';
          const isStopped = veh.status === 'stopped';

          return (
            <div
              key={veh.id}
              onClick={() => {
                setSelectedVehicleId(veh.id);
                if (onSelectVehicle) onSelectVehicle(veh);
              }}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group transition-all duration-700 ease-out"
            >
              {/* Radar pulse glowing wave */}
              {isInTrip ? (
                <div
                  className={`absolute -inset-3 rounded-full animate-ping opacity-40 ${
                    isCar
                      ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.7)]'
                      : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.7)]'
                  }`}
                />
              ) : isBreakdown ? (
                <div className="absolute -inset-3 rounded-full animate-ping opacity-40 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.7)]" />
              ) : null}

              {/* Marker Badge Container */}
              <div
                className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl shadow-xl border text-xs transition-all duration-200 ${
                  isSelected
                    ? 'scale-125 border-indigo-400 bg-indigo-600 text-white ring-4 ring-indigo-500/30 z-30'
                    : isBreakdown
                    ? 'bg-orange-600 text-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]'
                    : isInTrip
                    ? isCar
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                      : 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                {isBreakdown ? (
                  <AlertTriangle className="w-3 h-3 text-white" />
                ) : isCar ? (
                  <Car className="w-3 h-3" />
                ) : (
                  <Navigation className="w-3 h-3" />
                )}

                <div className="flex flex-col text-left leading-tight">
                  <span className="font-extrabold text-[10px] tracking-tight">{veh.plate}</span>
                  <span className="text-[8px] font-mono opacity-80">
                    {isInTrip ? `${veh.speedKmH} km/h` : isBreakdown ? 'AVARIA' : 'PARADO'}
                  </span>
                </div>
              </div>

              {/* Hover Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-40 whitespace-nowrap">
                <div className="p-2.5 rounded-xl bg-[#0A0A0B] text-white border border-slate-800 shadow-2xl text-xs space-y-0.5">
                  <p className="font-bold text-indigo-400">
                    {veh.brand} {veh.model} ({veh.type === 'car_taxi' ? 'Carro Táxi' : 'Moto-Táxi'})
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Motorista: {veh.driverName || 'Sem motorista'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Gás: {veh.fuelLevel}% | Óleo: {veh.oilHealth}% | {veh.coordinates.address}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Selected Vehicle Drawer */}
        {selectedVehicle && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-40 bg-[#0F0F12]/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-4 text-xs animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow ${
                    selectedVehicle.type === 'car_taxi'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {selectedVehicle.type === 'car_taxi' ? <Car className="w-5 h-5" /> : <Navigation className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-100">
                      {selectedVehicle.plate}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full ${
                        selectedVehicle.status === 'in_trip'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : selectedVehicle.status === 'critical_breakdown'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {selectedVehicle.status === 'in_trip'
                        ? 'Em Corrida'
                        : selectedVehicle.status === 'critical_breakdown'
                        ? 'Avaria'
                        : 'Disponível'}
                    </span>
                  </div>
                  <p className="text-slate-500">
                    {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedVehicleId(null)}
                className="text-slate-500 hover:text-slate-300 text-base font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Gauge Grid */}
            <div className="grid grid-cols-4 gap-1.5 mb-3 text-center">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <Fuel className="w-3.5 h-3.5 text-indigo-400 mx-auto mb-0.5" />
                <span className="font-bold text-slate-200 text-xs block">
                  {selectedVehicle.fuelLevel}%
                </span>
                <span className="text-[9px] text-slate-500">Gasolina</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <Droplets className="w-3.5 h-3.5 text-purple-400 mx-auto mb-0.5" />
                <span
                  className={`font-bold text-xs block ${
                    selectedVehicle.oilHealth < 25 ? 'text-orange-400' : 'text-slate-200'
                  }`}
                >
                  {selectedVehicle.oilHealth}%
                </span>
                <span className="text-[9px] text-slate-500">Óleo Motor</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <Gauge className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-0.5" />
                <span className="font-bold text-slate-200 text-xs block">
                  {selectedVehicle.speedKmH}
                </span>
                <span className="text-[9px] text-slate-500">km/h</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <Thermometer className="w-3.5 h-3.5 text-rose-400 mx-auto mb-0.5" />
                <span
                  className={`font-bold text-xs block ${
                    selectedVehicle.engineTempC > 95 ? 'text-rose-400' : 'text-slate-200'
                  }`}
                >
                  {selectedVehicle.engineTempC}°C
                </span>
                <span className="text-[9px] text-slate-500">Temp.</span>
              </div>
            </div>

            {/* Info bar */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 mb-3">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold text-slate-100">
                  Motorista: {selectedVehicle.driverName || 'Não atribuído'}
                </span>
                <span className="text-[11px] text-indigo-400 font-mono">
                  {selectedVehicle.odometerKm.toLocaleString()} km
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                📍 {selectedVehicle.coordinates.address}
              </p>
              {activeTrip && (
                <div className="pt-1 border-t border-slate-800 text-[11px] text-emerald-400 font-medium">
                  Corrida: {activeTrip.passengerName} ➔ {activeTrip.destination.address} ({activeTrip.fareAOA.toLocaleString()} Kz)
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (onSelectVehicle) onSelectVehicle(selectedVehicle);
              }}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Telemetria Completa</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
