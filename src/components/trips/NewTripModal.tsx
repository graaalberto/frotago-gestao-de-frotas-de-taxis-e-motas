import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Vehicle, PaymentMethod } from '../../types';
import {
  X,
  Navigation,
  Car,
  MapPin,
  Coins,
  Phone,
  User,
  CreditCard,
  Banknote,
  Send,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedVehicle?: Vehicle | null;
}

const POPULAR_LOCATIONS = [
  'Mutamba, Centro da Cidade, Luanda',
  'Marginal de Luanda / Baía',
  'Maianga, Bairro Azul, Luanda',
  'Aeroporto Internacional 4 de Fevereiro',
  'Talatona, Belas Shopping, Luanda',
  'Centralidade do Kilamba, Luanda',
  'Viana, Polo Industrial, Luanda',
  'Ilha de Luanda / Restaurantes',
  'Samba, Estrada da Samba, Luanda',
  'Benfica, Mercado do Artesanato',
  'Cacuaco, Rotunda da Cimangola',
];

export const NewTripModal: React.FC<NewTripModalProps> = ({
  isOpen,
  onClose,
  preSelectedVehicle,
}) => {
  const { vehicles, addTrip } = useFleet();

  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [origin, setOrigin] = useState('Mutamba, Centro da Cidade, Luanda');
  const [destination, setDestination] = useState('Talatona, Belas Shopping, Luanda');
  const [distanceKm, setDistanceKm] = useState(14.5);
  const [vehicleId, setVehicleId] = useState(preSelectedVehicle?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('multicaixa_express');

  if (!isOpen) return null;

  const availableVehicles = vehicles.filter(
    v => v.status === 'idle' || v.id === vehicleId || v.id === preSelectedVehicle?.id
  );

  const selectedVehicle = vehicles.find(v => v.id === (vehicleId || preSelectedVehicle?.id)) || availableVehicles[0];

  // Pricing calculation in Kwanzas (AOA)
  // Car Taxi: Base 1200 Kz + 300 Kz/km
  // Moto Taxi: Base 600 Kz + 180 Kz/km
  const isCar = selectedVehicle?.type === 'car_taxi';
  const baseRate = isCar ? 1200 : 600;
  const perKmRate = isCar ? 300 : 180;
  const calculatedFare = Math.round(baseRate + distanceKm * perKmRate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName || !selectedVehicle) return;

    addTrip({
      passengerName,
      passengerPhone: passengerPhone || '+244 923 000 000',
      driverId: selectedVehicle.driverId || 'drv_default',
      driverName: selectedVehicle.driverName || 'Condutor Operacional',
      vehicleId: selectedVehicle.id,
      vehiclePlate: selectedVehicle.plate,
      vehicleType: selectedVehicle.type,
      origin: {
        lat: -8.8146,
        lng: 13.2301,
        address: origin,
      },
      destination: {
        lat: -8.9167,
        lng: 13.1833,
        address: destination,
      },
      distanceKm: Number(distanceKm),
      estimatedDurationMinutes: Math.round(distanceKm * 2.2),
      fareAOA: calculatedFare,
      fareCurrency: 'AOA',
      paymentMethod,
      status: 'in_progress',
      startTime: new Date().toISOString(),
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (_) {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-gray-950 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-gray-900 dark:text-white">
                Despachar Corrida Imediata
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Atribua passageiro a um táxi ou moto-táxi disponível na central.
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
          {/* Passenger Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nome do Passageiro *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Mendonça"
                  value={passengerName}
                  onChange={e => setPassengerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Telefone / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="+244 923 111 222"
                  value={passengerPhone}
                  onChange={e => setPassengerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Veículo & Condutor Selecionado *
            </label>
            <select
              required
              value={vehicleId || selectedVehicle?.id || ''}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500 font-medium"
            >
              {availableVehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.type === 'car_taxi' ? '🚗 Carro' : '🏍️ Mota'} - {v.plate} ({v.brand} {v.model}) - Condutor: {v.driverName || 'Sem condutor'} - Gasolina: {v.fuelLevel}%
                </option>
              ))}
            </select>
          </div>

          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Ponto de Partida (Origem)
              </label>
              <select
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
              >
                {POPULAR_LOCATIONS.map((loc, i) => (
                  <option key={i} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Destino Final
              </label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-amber-500"
              >
                {POPULAR_LOCATIONS.map((loc, i) => (
                  <option key={i} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Distance & Fare calculation */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 dark:text-white">
                Cálculo Automático de Tarifa
              </span>
              <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                {calculatedFare.toLocaleString('pt-PT')} Kz
              </span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-gray-600 dark:text-gray-400 mb-1">
                <span>Distância Estimada da Rota:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{distanceKm} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                step="0.5"
                value={distanceKm}
                onChange={e => setDistanceKm(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Método de Cobrança
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'multicaixa_express', label: 'Multicaixa', icon: CreditCard },
                { id: 'cash', label: 'Dinheiro', icon: Banknote },
                { id: 'card', label: 'Cartão TPA', icon: Coins },
                { id: 'wallet', label: 'Unitel Money', icon: Send },
              ].map(method => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === method.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 font-bold text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-500" />
                    <span className="text-[11px]">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action */}
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
              className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Confirmar Despacho</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
