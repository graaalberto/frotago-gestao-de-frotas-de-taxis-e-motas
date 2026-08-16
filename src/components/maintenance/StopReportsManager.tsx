import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { StopReport, StopReason } from '../../types';
import {
  MessageSquare,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Car,
  Fuel,
  Coffee,
  ShieldAlert,
  AlertTriangle,
  Plus,
  UserCheck,
} from 'lucide-react';

export const StopReportsManager: React.FC = () => {
  const { stopReports, reviewStopReport, addStopReport, vehicles } = useFleet();

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_review' | 'approved' | 'rejected'>('all');
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  // New simulation form
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  const [reason, setReason] = useState<StopReason>('fueling');
  const [locationAddress, setLocationAddress] = useState('Bomba Sonangol - Estrada de Catete, Luanda');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [driverNotes, setDriverNotes] = useState('Paragem rápida para abastecer 20 litros de gasolina antes da próxima corrida para o Kilamba.');

  const filteredReports = stopReports.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const getReasonMeta = (rs: StopReason) => {
    switch (rs) {
      case 'fueling':
        return { label: 'Abastecimento de Gasolina', icon: Fuel, color: 'text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300' };
      case 'lunch_rest':
        return { label: 'Pausa para Refeição / Descanso', icon: Coffee, color: 'text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-300' };
      case 'heavy_traffic':
        return { label: 'Tráfego Intenso / Engarrafamento', icon: Clock, color: 'text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-300' };
      case 'police_inspection':
        return { label: 'Fiscalização Policial / Trânsito', icon: ShieldAlert, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300' };
      case 'mechanical_check':
        return { label: 'Verificação Mecânica / Pneus', icon: AlertTriangle, color: 'text-rose-600 bg-rose-100 dark:bg-rose-950 dark:text-rose-300' };
      case 'passenger_wait':
        return { label: 'Aguardando Passageiro', icon: MessageSquare, color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-950 dark:text-cyan-300' };
      default:
        return { label: 'Outro Motivo', icon: Clock, color: 'text-gray-600 bg-gray-100' };
    }
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
    if (!veh) return;

    addStopReport({
      vehicleId: veh.id,
      vehiclePlate: veh.plate,
      vehicleType: veh.type,
      driverId: veh.driverId || 'drv-custom',
      driverName: veh.driverName || 'Motorista em Serviço',
      reason,
      description: driverNotes,
      startedAt: new Date().toISOString(),
      expectedDurationMinutes: Number(durationMinutes),
      actualDurationMinutes: Number(durationMinutes),
      location: {
        lat: -8.84,
        lng: 13.25,
        address: locationAddress,
      },
      photos: [],
      odometerKmAtStop: veh.odometerKm,
    });

    setShowSimulateModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h2 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <span>Recepção de Texto & Feedback de Paragens dos Condutores</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              {stopReports.filter(s => s.status === 'pending_review').length} Pendentes
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Comunicação em tempo real de motoristas: motivos de paragens, abastecimentos e justificativas.
          </p>
        </div>

        <button
          onClick={() => setShowSimulateModal(true)}
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Simular Envio de Paragem (Condutor)</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs">
        {[
          { id: 'all', label: `Todos (${stopReports.length})` },
          { id: 'pending_review', label: `Pendentes de Validação (${stopReports.filter(s => s.status === 'pending_review').length})` },
          { id: 'approved', label: `Reconhecidos & Aprovados (${stopReports.filter(s => s.status === 'approved').length})` },
          { id: 'rejected', label: `Recusados (${stopReports.filter(s => s.status === 'rejected').length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filterStatus === tab.id
                ? 'bg-amber-500 text-gray-950 font-bold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredReports.map(rep => {
          const meta = getReasonMeta(rep.reason);
          const Icon = meta.icon;
          const isPending = rep.status === 'pending_review';

          return (
            <div
              key={rep.id}
              className={`p-4 rounded-2xl border bg-white dark:bg-gray-900 shadow-sm flex flex-col justify-between space-y-3 transition-all ${
                isPending
                  ? 'border-indigo-200 dark:border-indigo-900/60 ring-1 ring-indigo-500/10'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                          {rep.driverName}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                          [{rep.vehiclePlate}]
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                        {meta.label}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rep.status === 'pending_review'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : rep.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {rep.status === 'pending_review'
                      ? 'Aguardando Avaliação'
                      : rep.status === 'approved'
                      ? 'Aprovado / Ciente'
                      : 'Rejeitado'}
                  </span>
                </div>

                {/* Location & Time */}
                <div className="mt-2.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1 truncate pr-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{rep.location.address}</span>
                  </span>
                  <span className="font-mono text-[11px] text-gray-500 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{rep.expectedDurationMinutes || 15} min</span>
                  </span>
                </div>

                {/* Driver Text Feedback */}
                <div className="mt-2.5 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1">
                    💬 Mensagem / Justificativa do Condutor:
                  </span>
                  <p className="text-gray-800 dark:text-gray-200 font-medium italic">
                    "{rep.description}"
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Enviado em {new Date(rep.timestamp || rep.startedAt).toLocaleTimeString('pt-PT')}
                  </span>
                </div>
              </div>

              {/* Actions for Dispatcher */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                {isPending ? (
                  <>
                    <button
                      onClick={() => reviewStopReport(rep.id, 'approved')}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Validar & Aprovar Paragem</span>
                    </button>

                    <button
                      onClick={() => reviewStopReport(rep.id, 'rejected')}
                      className="py-1.5 px-3 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rejeitar</span>
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Paragem já revisada pela equipa de operações</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulate Driver Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>Simular Envio de Feedback do Condutor</span>
              </h3>
              <button onClick={() => setShowSimulateModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Veículo & Condutor
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={e => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plate} ({v.driverName || 'Condutor'}) - {v.brand} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Motivo da Paragem
                </label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
                >
                  <option value="fueling">Abastecimento de Combustível</option>
                  <option value="lunch_rest">Pausa para Refeição / Almoço</option>
                  <option value="heavy_traffic">Engarrafamento Grave</option>
                  <option value="police_inspection">Fiscalização Policial</option>
                  <option value="mechanical_check">Avaria / Checagem Mecânica</option>
                  <option value="passenger_wait">Aguardando Passageiro</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Localização da Paragem
                </label>
                <input
                  type="text"
                  required
                  value={locationAddress}
                  onChange={e => setLocationAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Duração Prevista (minutos): {durationMinutes} min
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Mensagem / Feedback em Texto do Condutor *
                </label>
                <textarea
                  required
                  rows={3}
                  value={driverNotes}
                  onChange={e => setDriverNotes(e.target.value)}
                  placeholder="Escreva a justificativa..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="py-2 px-3 rounded-xl bg-gray-200 dark:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold shadow-md"
                >
                  Enviar Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
