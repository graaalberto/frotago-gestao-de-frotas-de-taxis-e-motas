import React, { useState } from 'react';
import { Vehicle, VehicleStatus } from '../../types';
import { useFleet } from '../../context/FleetContext';
import {
  X,
  Car,
  Navigation,
  Fuel,
  Droplets,
  Gauge,
  Thermometer,
  BatteryCharging,
  QrCode,
  Calendar,
  Wrench,
  AlertTriangle,
  User,
  Phone,
  CheckCircle2,
  MapPin,
  Save,
} from 'lucide-react';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onDispatchTrip: (vehicle: Vehicle) => void;
  onReportBreakdown: (vehicle: Vehicle) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onDispatchTrip,
  onReportBreakdown,
}) => {
  const { updateVehicle, drivers } = useFleet();

  const [editStatus, setEditStatus] = useState<VehicleStatus>(vehicle?.status || 'idle');
  const [driverId, setDriverId] = useState<string>(vehicle?.driverId || '');
  const [fuelAdd, setFuelAdd] = useState<number>(vehicle?.fuelLevel || 50);
  const [oilSet, setOilSet] = useState<number>(vehicle?.oilHealth || 80);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !vehicle) return null;

  const isCar = vehicle.type === 'car_taxi';
  const assignedDriver = drivers.find(d => d.id === vehicle.driverId);

  const handleSaveTelemetry = () => {
    const selectedDriver = drivers.find(d => d.id === driverId);
    updateVehicle(vehicle.id, {
      status: editStatus,
      driverId: driverId || undefined,
      driverName: selectedDriver ? selectedDriver.name : undefined,
      fuelLevel: Number(fuelAdd),
      oilHealth: Number(oilSet),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shadow ${
                isCar ? 'bg-amber-500 text-gray-950' : 'bg-rose-600 text-white'
              }`}
            >
              {isCar ? <Car className="w-6 h-6" /> : <Navigation className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-gray-900 dark:text-white font-mono">
                  {vehicle.plate}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {isCar ? 'Carro Táxi' : 'Moto-Táxi'} • {vehicle.year}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {vehicle.brand} {vehicle.model} ({vehicle.color})
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

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {isSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Telemetria e dados do veículo atualizados com sucesso!</span>
            </div>
          )}

          {/* Real-Time Telemetry Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              Telemetria & Diagnóstico de Bordo
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {/* Gasolina */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <Fuel className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="font-extrabold text-base text-gray-900 dark:text-white block">
                  {vehicle.fuelLevel}%
                </span>
                <span className="text-[10px] text-gray-500">Combustível ({vehicle.fuelType})</span>
              </div>

              {/* Óleo */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <Droplets className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                <span
                  className={`font-extrabold text-base block ${
                    vehicle.oilHealth < 30 ? 'text-rose-500 font-bold' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {vehicle.oilHealth}%
                </span>
                <span className="text-[10px] text-gray-500">Saúde do Óleo</span>
              </div>

              {/* Temp */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <Thermometer className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                <span
                  className={`font-extrabold text-base block ${
                    vehicle.engineTempC > 95 ? 'text-rose-500 font-bold' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {vehicle.engineTempC}°C
                </span>
                <span className="text-[10px] text-gray-500">Temp. Motor</span>
              </div>

              {/* Pneus */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <Gauge className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <span className="font-extrabold text-base text-gray-900 dark:text-white block">
                  {vehicle.tirePressureBar} bar
                </span>
                <span className="text-[10px] text-gray-500">Pressão Pneus</span>
              </div>
            </div>
          </div>

          {/* Driver & Maintenance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Driver Details */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Condutor Atribuído
                </span>
                <User className="w-4 h-4 text-amber-500" />
              </div>

              {assignedDriver ? (
                <div className="flex items-center gap-3">
                  <img
                    src={assignedDriver.avatar}
                    alt={assignedDriver.name}
                    className="w-10 h-10 rounded-full object-cover border border-amber-500"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                      {assignedDriver.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {assignedDriver.phone}
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ★ {assignedDriver.rating} ({assignedDriver.totalTripsCount} corridas)
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Nenhum motorista alocado no momento.</p>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Alterar Condutor Alocado:
                </label>
                <select
                  value={driverId}
                  onChange={e => setDriverId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-amber-500"
                >
                  <option value="">Sem Motorista Atribuído</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Maintenance & Odometer */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Manutenção & QR Code
                </span>
                <Wrench className="w-4 h-4 text-purple-500" />
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Quilometragem Atual:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {vehicle.odometerKm.toLocaleString()} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Próxima Revisão em:</span>
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                    {vehicle.nextMaintenanceKm.toLocaleString()} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Última Revisão:</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {new Date(vehicle.lastMaintenanceDate).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-gray-400">QR Terminal: {vehicle.qrCode}</span>
                <button
                  type="button"
                  className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-[10px] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                >
                  Imprimir QR
                </button>
              </div>
            </div>
          </div>

          {/* Quick Status Adjuster */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Ajuste Manual de Telemetria / Status
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Status Operacional
                </label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <option value="idle">Livre / Disponível</option>
                  <option value="in_trip">Em Corrida</option>
                  <option value="stopped">Em Paragem</option>
                  <option value="maintenance">Em Manutenção</option>
                  <option value="critical_breakdown">Avaria Crítica</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Ajustar Nível de Gasolina ({fuelAdd}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fuelAdd}
                  onChange={e => setFuelAdd(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Ajustar Saúde do Óleo ({oilSet}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={oilSet}
                  onChange={e => setOilSet(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveTelemetry}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Telemetria</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onReportBreakdown(vehicle);
            }}
            className="py-2 px-3 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Reportar Avaria Neste Veículo</span>
          </button>

          <div className="flex items-center gap-2">
            {vehicle.status === 'idle' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDispatchTrip(vehicle);
                }}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Despachar Corrida</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold text-xs transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
