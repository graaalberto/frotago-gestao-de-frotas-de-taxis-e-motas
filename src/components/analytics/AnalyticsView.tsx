import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Coins,
  Car,
  Navigation,
  Fuel,
  Download,
  Calendar,
  Award,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { trips, vehicles, drivers, breakdowns } = useFleet();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Revenue & Trips by Day (Mock aggregated chart data based on trips)
  const revenueChartData = [
    { day: 'Seg', faturamentoKz: 145000, corridasCarro: 32, corridasMota: 48, combustivelKz: 28000 },
    { day: 'Ter', faturamentoKz: 182000, corridasCarro: 40, corridasMota: 56, combustivelKz: 32000 },
    { day: 'Qua', faturamentoKz: 198000, corridasCarro: 45, corridasMota: 62, combustivelKz: 35000 },
    { day: 'Qui', faturamentoKz: 230000, corridasCarro: 52, corridasMota: 74, combustivelKz: 41000 },
    { day: 'Sex', faturamentoKz: 310000, corridasCarro: 68, corridasMota: 95, combustivelKz: 55000 },
    { day: 'Sáb', faturamentoKz: 385000, corridasCarro: 85, corridasMota: 110, combustivelKz: 68000 },
    { day: 'Dom', faturamentoKz: 260000, corridasCarro: 55, corridasMota: 78, combustivelKz: 46000 },
  ];

  // Fleet share by vehicle type
  const carCount = vehicles.filter(v => v.type === 'car_taxi').length;
  const motoCount = vehicles.filter(v => v.type === 'moto_taxi').length;

  const fleetDistributionData = [
    { name: 'Carros Táxis', value: carCount, color: '#f59e0b' },
    { name: 'Moto-Táxis', value: motoCount, color: '#e11d48' },
  ];

  const maintenanceBreakdownData = [
    { name: 'Motor / Radiador', cost: 125000, color: '#e11d48' },
    { name: 'Travões & Discos', cost: 48000, color: '#f59e0b' },
    { name: 'Pneus & Suspensão', cost: 72000, color: '#3b82f6' },
    { name: 'Sistema Elétrico', cost: 35000, color: '#8b5cf6' },
    { name: 'Revisão Geral / Óleo', cost: 95000, color: '#10b981' },
  ];

  const handleExportCSV = () => {
    const csvContent = [
      'Data,Faturamento (Kz),Corridas Carro,Corridas Mota,Gasto Combustivel (Kz)',
      ...revenueChartData.map(
        r => `${r.day},${r.faturamentoKz},${r.corridasCarro},${r.corridasMota},${r.combustivelKz}`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_frota_fleetgo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h2 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <span>Relatórios Financeiros, Desempenho & Métricas da Frota</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Análise aprofundada de receitas em Kwanzas (AOA), custos operacionais e produtividade de condutores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trends Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Evolução do Faturamento Semanal (Kz)</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Receita bruta obtida por viagens realizadas
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              +18.4% vs semana anterior
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFaturamento" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} Kz`, 'Faturamento']}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="faturamentoKz" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorFaturamento)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Type Distribution */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
              <Car className="w-4 h-4 text-blue-500" />
              <span>Composição da Frota Ativa</span>
            </h3>
            <p className="text-[11px] text-gray-500">
              {vehicles.length} Veículos Cadastrados no Sistema
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {fleetDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <span className="font-extrabold text-amber-600 dark:text-amber-400 block text-base">
                {carCount}
              </span>
              <span className="text-[10px] text-gray-600 dark:text-gray-400">Carros Táxis</span>
            </div>

            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
              <span className="font-extrabold text-rose-600 dark:text-rose-400 block text-base">
                {motoCount}
              </span>
              <span className="text-[10px] text-gray-600 dark:text-gray-400">Moto-Táxis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Volume by Vehicle Type & Maintenance Costs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trips Volume Bar Chart */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-emerald-500" />
            <span>Volume de Corridas Diárias (Carros vs Motas)</span>
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="corridasCarro" name="Carros Táxis" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="corridasMota" name="Moto-Táxis" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Cost Breakdown */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
            <Fuel className="w-4 h-4 text-purple-500" />
            <span>Despesas com Manutenção & Oficinas (Kz)</span>
          </h3>

          <div className="space-y-2.5 pt-2">
            {maintenanceBreakdownData.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {item.cost.toLocaleString('pt-PT')} Kz
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(item.cost / 125000) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Driver Leaderboard Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Ranking & Produtividade dos Condutores</span>
          </h3>
          <span className="text-xs text-gray-500">Classificação por faturamento e avaliação</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase text-[10px] border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="p-3 pl-4">Posição / Condutor</th>
                <th className="p-3">Veículo</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Corridas Concluídas</th>
                <th className="p-3">Avaliação Média</th>
                <th className="p-3 pr-4 text-right">Faturamento Total Gerado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {drivers.map((drv, idx) => (
                <tr key={drv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3 pl-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-amber-500 text-gray-950 font-extrabold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {idx + 1}
                      </span>
                      <img
                        src={drv.avatar}
                        alt={drv.name}
                        className="w-8 h-8 rounded-full object-cover border border-amber-500/50"
                      />
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white block">
                          {drv.name}
                        </span>
                        <span className="text-[10px] text-gray-400">CNH: {drv.licenseNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-semibold">
                    {drv.vehicleType === 'car_taxi' ? '🚗 Carro Táxi' : '🏍️ Moto-Táxi'}
                  </td>
                  <td className="p-3 font-mono">{drv.phone}</td>
                  <td className="p-3 font-bold text-gray-900 dark:text-white">
                    {drv.totalTripsCount}
                  </td>
                  <td className="p-3">
                    <span className="text-amber-500 font-bold">★ {drv.rating}</span>
                  </td>
                  <td className="p-3 pr-4 text-right font-mono font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                    {drv.totalEarningsAOA.toLocaleString('pt-PT')} Kz
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
