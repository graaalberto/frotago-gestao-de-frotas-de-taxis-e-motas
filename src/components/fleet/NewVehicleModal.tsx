import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { VehicleType } from '../../types';
import {
  X,
  Car,
  Navigation,
  Plus,
  Fuel,
  Droplets,
  Gauge,
  User,
} from 'lucide-react';

interface NewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewVehicleModal: React.FC<NewVehicleModalProps> = ({ isOpen, onClose }) => {
  const { addVehicle, drivers } = useFleet();

  const [type, setType] = useState<VehicleType>('car_taxi');
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [color, setColor] = useState('Branco / Azul');
  const [odometerKm, setOdometerKm] = useState<number>(15000);
  const [fuelLevel, setFuelLevel] = useState<number>(85);
  const [oilHealth, setOilHealth] = useState<number>(90);
  const [driverId, setDriverId] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !brand || !model) return;

    const assignedDriver = drivers.find(d => d.id === driverId);

    addVehicle({
      plate: plate.toUpperCase(),
      brand,
      model,
      year: Number(year),
      type,
      color,
      status: 'idle',
      driverId: driverId || undefined,
      driverName: assignedDriver ? assignedDriver.name : undefined,
      fuelLevel: Number(fuelLevel),
      fuelType: 'gasoline',
      oilHealth: Number(oilHealth),
      odometerKm: Number(odometerKm),
      batteryLevel: 95,
      engineTempC: 75,
      tirePressureBar: 2.3,
      speedKmH: 0,
      coordinates: {
        lat: -8.8383 + (Math.random() - 0.5) * 0.05,
        lng: 13.2344 + (Math.random() - 0.5) * 0.05,
        heading: 0,
        address: 'Terminal Central de Táxis, Luanda',
      },
      lastMaintenanceDate: new Date().toISOString().slice(0, 10),
      nextMaintenanceKm: Number(odometerKm) + 5000,
      activeIssuesCount: 0,
      qrCode: `QR-${plate.toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-gray-950 font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-gray-900 dark:text-white">
                Cadastrar Novo Veículo na Frota
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Integre um novo Carro Táxi ou Moto-Táxi à central de telemetria.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Type Selector */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Tipo de Veículo
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('car_taxi')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  type === 'car_taxi'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold ring-2 ring-amber-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Car className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                  <span className="block text-xs">Carro Táxi</span>
                  <span className="text-[10px] text-gray-500 font-normal">Sedan, Hatchback, SUV</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('moto_taxi')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  type === 'moto_taxi'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold ring-2 ring-rose-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Navigation className="w-5 h-5 text-rose-500" />
                <div className="text-left">
                  <span className="block text-xs">Moto-Táxi</span>
                  <span className="text-[10px] text-gray-500 font-normal">110cc, 150cc, Triciclo</span>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Matrícula (Placa) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: LD-88-99-ZZ"
                value={plate}
                onChange={e => setPlate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 uppercase font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Ano de Fabrico
              </label>
              <input
                type="number"
                min="2000"
                max="2030"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Marca do Veículo *
              </label>
              <input
                type="text"
                required
                placeholder={type === 'car_taxi' ? 'Ex: Toyota, Hyundai' : 'Ex: TVS, Bajaj, Haojue'}
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Modelo *
              </label>
              <input
                type="text"
                required
                placeholder={type === 'car_taxi' ? 'Ex: Corolla, Accent' : 'Ex: Boxer 150, Apache'}
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Cor Predominante
              </label>
              <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="Ex: Branco / Azul Táxi"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Quilometragem Inicial (km)
              </label>
              <input
                type="number"
                min="0"
                value={odometerKm}
                onChange={e => setOdometerKm(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Driver allocation */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Atribuir Condutor Imediato (Opcional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={driverId}
                onChange={e => setDriverId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
              >
                <option value="">Deixar livre (Sem motorista)</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.phone}) - {d.vehicleType === 'car_taxi' ? 'Carro' : 'Mota'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 text-[11px] text-amber-900 dark:text-amber-300">
            ℹ️ O veículo receberá automaticamente um QR Code e rastreamento de telemetria GPS na frota.
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold shadow-md shadow-amber-500/20"
            >
              Salvar Veículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
