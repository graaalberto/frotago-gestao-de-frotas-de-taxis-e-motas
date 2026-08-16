import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { BreakdownSeverity } from '../../types';
import {
  X,
  AlertTriangle,
  Wrench,
  Coins,
  Car,
} from 'lucide-react';

interface NewBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedVehiclePlate?: string;
}

export const NewBreakdownModal: React.FC<NewBreakdownModalProps> = ({
  isOpen,
  onClose,
  preSelectedVehiclePlate,
}) => {
  const { vehicles, addBreakdownReport } = useFleet();

  const [vehicleId, setVehicleId] = useState('');
  const [severity, setSeverity] = useState<BreakdownSeverity>('critical');
  const [category, setCategory] = useState<'engine' | 'tires' | 'brakes' | 'electrical' | 'transmission' | 'bodywork' | 'oil_leak'>('engine');
  const [description, setDescription] = useState('');
  const [estimatedCostAOA, setEstimatedCostAOA] = useState<number>(35000);
  const [mechanic, setMechanic] = useState('Oficina Central Luanda - Mestre António');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVeh = vehicles.find(v => v.id === vehicleId || v.plate === preSelectedVehiclePlate) || vehicles[0];
    if (!targetVeh || !description) return;

    addBreakdownReport({
      vehicleId: targetVeh.id,
      vehiclePlate: targetVeh.plate,
      vehicleType: targetVeh.type,
      driverId: targetVeh.driverId || 'drv_default',
      driverName: targetVeh.driverName || 'Condutor Operacional',
      title: `Avaria em ${category.toUpperCase()} - ${targetVeh.plate}`,
      description,
      category,
      severity,
      status: 'reported',
      photos: [],
      estimatedCostAOA: Number(estimatedCostAOA),
      workshopName: 'Oficina Central de Luanda',
      mechanicName: mechanic,
      impactOnTrip: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-gray-900 dark:text-white">
                Registar Avaria Mecânica / Elétrica
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Imobilização ou manutenção de emergência de viatura/mota.
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
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Veículo Afetado *
            </label>
            <select
              value={vehicleId || preSelectedVehiclePlate || ''}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-rose-500 font-mono font-bold"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.plate} - {v.brand} {v.model} ({v.type === 'car_taxi' ? 'Carro Táxi' : 'Moto-Táxi'}) - Condutor: {v.driverName || 'Sem motorista'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nível de Gravidade *
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-rose-500 font-semibold"
              >
                <option value="critical">🔴 Crítica (Veículo Parado)</option>
                <option value="high">🟠 Alta</option>
                <option value="medium">🟡 Média</option>
                <option value="low">🔵 Baixa / Preventiva</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Categoria da Avaria
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-rose-500"
              >
                <option value="engine">Motor / Radiador / Superaquecimento</option>
                <option value="brakes">Travões / Pastilhas / Fluido</option>
                <option value="tires">Pneus / Suspensão / Direção</option>
                <option value="electrical">Sistema Elétrico / Alternador / Bateria</option>
                <option value="transmission">Caixa de Velocidades / Embraiagem</option>
                <option value="oil_leak">Fuga de Óleo / Lubrificação</option>
                <option value="bodywork">Geral / Chapa / Outros</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Descrição Detalhada do Problema *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ex: Barulho anormal na embraiagem e perda de potência na aceleração..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Custo Estimado do Reparo (Kz)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={estimatedCostAOA}
                onChange={e => setEstimatedCostAOA(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-rose-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Oficina / Mecânico Atribuído
              </label>
              <input
                type="text"
                value={mechanic}
                onChange={e => setMechanic(e.target.value)}
                placeholder="Ex: Oficina Mecânica Express"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-rose-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300">
            ⚠️ Ao submeter com gravidade crítica, o veículo será automaticamente marcado como imobilizado e indisponível para corridas.
          </div>

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
              className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/20"
            >
              Registar Avaria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
