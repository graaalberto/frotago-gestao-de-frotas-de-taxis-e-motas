import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Driver, VehicleType } from '../../types';
import {
  User,
  Phone,
  Star,
  Coins,
  Navigation,
  Car,
  CheckCircle2,
  Plus,
  Search,
  Award,
  Shield,
  X,
} from 'lucide-react';

export const DriverList: React.FC = () => {
  const { drivers, vehicles } = useFleet();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | VehicleType>('all');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Driver Form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLicense, setNewLicense] = useState('');
  const [newType, setNewType] = useState<VehicleType>('car_taxi');

  const filteredDrivers = drivers.filter(d => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search) ||
      d.licenseNumber.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === 'all' || d.vehicleType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h2 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <span>Quadro de Condutores: Taxistas & Moto-Taxistas</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
              {filteredDrivers.length} Condutores
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Registo de cartas de condução, avaliações de passageiros e faturamento individual.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Condutor</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou número de carta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 focus:outline-none font-medium"
          >
            <option value="all">Todas as Categorias de Carta</option>
            <option value="car_taxi">🚗 Taxistas de Carro (Categoria B / Profissional)</option>
            <option value="moto_taxi">🏍️ Condutores de Moto-Táxi (Categoria A)</option>
          </select>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredDrivers.map(drv => {
          const isCar = drv.vehicleType === 'car_taxi';
          const assignedVeh = vehicles.find(v => v.id === drv.assignedVehicleId);

          return (
            <div
              key={drv.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 hover:shadow-md transition-all flex flex-col justify-between space-y-3.5"
            >
              <div>
                <div className="flex items-start gap-3">
                  <img
                    src={drv.avatar}
                    alt={drv.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500 shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                        {drv.name}
                      </h3>
                      <span className="text-amber-500 font-extrabold text-xs flex items-center gap-0.5 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{drv.rating}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-mono">{drv.phone}</span>
                    </div>

                    <span className="inline-block text-[10px] font-semibold text-gray-400 font-mono mt-0.5">
                      Carta: {drv.licenseNumber}
                    </span>
                  </div>
                </div>

                {/* Assigned Vehicle Info */}
                <div className="mt-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isCar ? 'bg-amber-500 text-gray-950' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {isCar ? <Car className="w-3.5 h-3.5" /> : <Navigation className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white block">
                        {assignedVeh ? assignedVeh.plate : 'Sem viatura fixa'}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {isCar ? 'Carro Táxi' : 'Moto-Táxi'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      drv.status === 'online'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : drv.status === 'busy'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {drv.status === 'online'
                      ? 'Disponível'
                      : drv.status === 'busy'
                      ? 'Em Corrida'
                      : 'Em Pausa'}
                  </span>
                </div>

                {/* Performance Stats */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                    <span className="font-extrabold text-sm text-gray-900 dark:text-white block font-mono">
                      {drv.totalTripsCount}
                    </span>
                    <span className="text-[10px] text-gray-500">Corridas Feitas</span>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40">
                    <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400 block font-mono">
                      {drv.totalEarningsAOA.toLocaleString('pt-PT')} Kz
                    </span>
                    <span className="text-[10px] text-gray-500">Total Faturado</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-400">
                  Admissão: {new Date(drv.joinedDate).toLocaleDateString('pt-PT')}
                </span>
                <a
                  href={`tel:${drv.phone}`}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-amber-500 hover:text-gray-950 font-semibold text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Contactar</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cadastrar Condutor Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" />
                <span>Registar Novo Condutor na Central</span>
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                alert('Condutor registado com sucesso no sistema!');
                setShowNewModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Baptista Silva"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+244 923 000 000"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Número da Carta (CNH) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: AO-998822"
                    value={newLicense}
                    onChange={e => setNewLicense(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Condução
                  </label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
                  >
                    <option value="car_taxi">Carro Táxi</option>
                    <option value="moto_taxi">Moto-Táxi</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="py-2 px-3 rounded-xl bg-gray-200 dark:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold shadow-md"
                >
                  Registar Condutor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
