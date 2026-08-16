import React from 'react';
import { useFleet } from '../../context/FleetContext';

export const TelemetryWidget: React.FC = () => {
  const { vehicles, stopReports, setSelectedVehicleId } = useFleet();

  const latestStop = stopReports[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between text-slate-50">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">
            Estado da Frota
          </h3>
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded-full">
            LIVE TELEMETRY
          </span>
        </div>

        {/* Vehicle list cards with left accent border (Artistic Flair Style) */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {vehicles.slice(0, 5).map(v => {
            const isOnline = v.status === 'in_trip';
            const isAvaria = v.status === 'critical_breakdown' || v.fuelLevel < 20 || v.oilHealth < 30;
            const borderCol = isAvaria
              ? 'border-orange-500'
              : isOnline
              ? 'border-emerald-500'
              : 'border-indigo-500';
            const statusLabel = isAvaria ? 'AVARIA' : isOnline ? 'ONLINE' : 'LIVRE';
            const statusCol = isAvaria
              ? 'text-orange-500'
              : isOnline
              ? 'text-emerald-400'
              : 'text-indigo-400';

            return (
              <div
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                className={`bg-black/40 p-3 border-l-4 ${borderCol} rounded-r-xl border-y border-r border-slate-800/80 hover:bg-black/60 transition-all cursor-pointer`}
              >
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="truncate text-slate-200">
                    {v.brand.toUpperCase()} {v.model.toUpperCase()} - {v.plate}
                  </span>
                  <span className={`text-[10px] font-mono font-extrabold ${statusCol}`}>
                    {statusLabel}
                  </span>
                </div>
                <div className="grid grid-cols-3 text-[10px] text-slate-400 font-mono">
                  <span>Gás: {v.fuelLevel}%</span>
                  <span>Óleo: {v.oilHealth < 30 ? 'BAIXO' : 'OK'}</span>
                  <span>{v.speedKmH} km/h</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Notification Banner at Bottom */}
      <div className="mt-4 pt-4 border-t border-slate-800/80">
        <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl">
          <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
            Notificação Real-Time
          </p>
          <p className="text-xs text-slate-300 mt-1 italic">
            {latestStop
              ? `Motorista "${latestStop.driverName}" reportou paragem: ${latestStop.description}.`
              : 'Todos os veículos a operar dentro dos parâmetros de telemetria.'}
          </p>
        </div>
      </div>
    </div>
  );
};
