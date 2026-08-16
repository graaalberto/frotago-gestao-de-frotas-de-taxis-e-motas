import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  Vehicle,
  Driver,
  Trip,
  StopReport,
  BreakdownReport,
  AlertRule,
  NotificationItem,
  ExternalApiData,
  TripStatus,
  BreakdownStatus,
} from '../types';
import {
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_TRIPS,
  INITIAL_STOP_REPORTS,
  INITIAL_BREAKDOWN_REPORTS,
  INITIAL_ALERT_RULES,
  INITIAL_NOTIFICATIONS,
  INITIAL_EXTERNAL_API_DATA,
} from '../services/initialFleetData';
import { playAlertSound } from '../services/audioAlerts';

interface FleetContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  stopReports: StopReport[];
  breakdowns: BreakdownReport[];
  alertRules: AlertRule[];
  notifications: NotificationItem[];
  externalApiData: ExternalApiData;
  isSimulating: boolean;
  soundEnabled: boolean;
  unreadNotificationsCount: number;
  toggleSimulation: () => void;
  toggleSound: () => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addTrip: (trip: Omit<Trip, 'id' | 'tripNumber'>) => void;
  updateTripStatus: (tripId: string, status: TripStatus, rating?: number) => void;
  addStopReport: (report: Omit<StopReport, 'id' | 'timestamp' | 'status'>) => void;
  reviewStopReport: (reportId: string, status: 'approved' | 'rejected', reviewNotes?: string) => void;
  addBreakdownReport: (breakdown: Omit<BreakdownReport, 'id' | 'reportedAt'>) => void;
  updateBreakdownStatus: (id: string, status: BreakdownStatus, mechanicNotes?: string) => void;
  updateAlertRule: (ruleId: string, updates: Partial<AlertRule>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  exportFleetData: (format: 'json' | 'csv') => void;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

const VEHICLES_KEY = 'fleetgo_vehicles_v2';
const DRIVERS_KEY = 'fleetgo_drivers_v2';
const TRIPS_KEY = 'fleetgo_trips_v2';
const STOPS_KEY = 'fleetgo_stops_v2';
const BREAKDOWNS_KEY = 'fleetgo_breakdowns_v2';
const RULES_KEY = 'fleetgo_rules_v2';
const NOTIFS_KEY = 'fleetgo_notifs_v2';

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(VEHICLES_KEY);
      return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
    } catch {
      return INITIAL_VEHICLES;
    }
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const saved = localStorage.getItem(DRIVERS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
    } catch {
      return INITIAL_DRIVERS;
    }
  });

  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem(TRIPS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TRIPS;
    } catch {
      return INITIAL_TRIPS;
    }
  });

  const [stopReports, setStopReports] = useState<StopReport[]>(() => {
    try {
      const saved = localStorage.getItem(STOPS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STOP_REPORTS;
    } catch {
      return INITIAL_STOP_REPORTS;
    }
  });

  const [breakdowns, setBreakdowns] = useState<BreakdownReport[]>(() => {
    try {
      const saved = localStorage.getItem(BREAKDOWNS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_BREAKDOWN_REPORTS;
    } catch {
      return INITIAL_BREAKDOWN_REPORTS;
    }
  });

  const [alertRules, setAlertRules] = useState<AlertRule[]>(() => {
    try {
      const saved = localStorage.getItem(RULES_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ALERT_RULES;
    } catch {
      return INITIAL_ALERT_RULES;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [externalApiData, setExternalApiData] = useState<ExternalApiData>(INITIAL_EXTERNAL_API_DATA);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(DRIVERS_KEY, JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem(STOPS_KEY, JSON.stringify(stopReports));
  }, [stopReports]);

  useEffect(() => {
    localStorage.setItem(BREAKDOWNS_KEY, JSON.stringify(breakdowns));
  }, [breakdowns]);

  useEffect(() => {
    localStorage.setItem(RULES_KEY, JSON.stringify(alertRules));
  }, [alertRules]);

  useEffect(() => {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Unread count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const triggerNotification = useCallback((item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);

    if (soundEnabled) {
      playAlertSound(item.severity);
    }
  }, [soundEnabled]);

  // Simulation loop for live telemetry, GPS movements, and alert triggers
  const lastAlertTimestamp = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setVehicles(prevVehicles => {
        return prevVehicles.map(veh => {
          if (veh.status === 'in_trip') {
            // Slight coordinate drift to simulate road movement in Luanda
            const latDelta = (Math.random() - 0.48) * 0.0004;
            const lngDelta = (Math.random() - 0.48) * 0.0004;
            const newLat = veh.coordinates.lat + latDelta;
            const newLng = veh.coordinates.lng + lngDelta;

            // Small fuel consumption and odometer tick
            const newFuel = Math.max(5, veh.fuelLevel - 0.04);
            const newOdo = veh.odometerKm + 0.03;
            const newSpeed = Math.floor(25 + Math.random() * 35);
            const newTemp = Math.min(106, Math.max(78, veh.engineTempC + (Math.random() - 0.5) * 1.5));

            // Check alert rules
            const now = Date.now();
            alertRules.forEach(rule => {
              if (!rule.enabled) return;
              const ruleKey = `${veh.id}_${rule.conditionType}`;
              const lastTrigger = lastAlertTimestamp.current[ruleKey] || 0;

              // Throttle duplicate alerts to once per 60 seconds
              if (now - lastTrigger > 60000) {
                if (rule.conditionType === 'oil_below' && veh.oilHealth <= rule.thresholdValue) {
                  lastAlertTimestamp.current[ruleKey] = now;
                  triggerNotification({
                    title: `Nível Crítico de Óleo (${veh.plate})`,
                    message: `O veículo ${veh.plate} (${veh.model}) está com apenas ${Math.round(veh.oilHealth)}% de saúde do óleo!`,
                    severity: rule.severity,
                    vehicleId: veh.id,
                    vehiclePlate: veh.plate,
                    category: 'telemetry',
                  });
                } else if (rule.conditionType === 'fuel_below' && newFuel <= rule.thresholdValue) {
                  lastAlertTimestamp.current[ruleKey] = now;
                  triggerNotification({
                    title: `Combustível na Reserva (${veh.plate})`,
                    message: `O veículo ${veh.plate} atingiu ${Math.round(newFuel)}% de gasolina/diesel. Necessita abastecimento.`,
                    severity: rule.severity,
                    vehicleId: veh.id,
                    vehiclePlate: veh.plate,
                    category: 'telemetry',
                  });
                } else if (rule.conditionType === 'temp_exceeded' && newTemp >= rule.thresholdValue) {
                  lastAlertTimestamp.current[ruleKey] = now;
                  triggerNotification({
                    title: `Superaquecimento de Motor (${veh.plate})`,
                    message: `Temperatura do motor atingiu ${Math.round(newTemp)}°C no veículo ${veh.plate}!`,
                    severity: rule.severity,
                    vehicleId: veh.id,
                    vehiclePlate: veh.plate,
                    category: 'telemetry',
                  });
                }
              }
            });

            return {
              ...veh,
              fuelLevel: Number(newFuel.toFixed(1)),
              odometerKm: Number(newOdo.toFixed(1)),
              speedKmH: newSpeed,
              engineTempC: Math.round(newTemp),
              coordinates: {
                ...veh.coordinates,
                lat: Number(newLat.toFixed(6)),
                lng: Number(newLng.toFixed(6)),
                heading: (veh.coordinates.heading + Math.floor(Math.random() * 10 - 5)) % 360,
              },
            };
          }
          return veh;
        });
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulating, alertRules, triggerNotification]);

  // Vehicle Actions
  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh_${vehicleData.type === 'car_taxi' ? 'car' : 'moto'}_${Math.random().toString(36).substring(2, 7)}`,
    };
    setVehicles(prev => [newVehicle, ...prev]);
    triggerNotification({
      title: 'Novo Veículo Adicionado à Frota',
      message: `Veículo ${newVehicle.plate} (${newVehicle.brand} ${newVehicle.model}) integrado com sucesso.`,
      severity: 'success',
      vehicleId: newVehicle.id,
      vehiclePlate: newVehicle.plate,
      category: 'system',
    });
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  // Trip Actions
  const addTrip = (tripData: Omit<Trip, 'id' | 'tripNumber'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: 'trip_' + Math.random().toString(36).substring(2, 8),
      tripNumber: `CR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setTrips(prev => [newTrip, ...prev]);

    // Update vehicle and driver status
    updateVehicle(tripData.vehicleId, { status: 'in_trip' });
    setDrivers(prev =>
      prev.map(d => (d.id === tripData.driverId ? { ...d, status: 'busy' } : d))
    );

    triggerNotification({
      title: `Nova Corrida Despachada (${newTrip.tripNumber})`,
      message: `Passageiro: ${newTrip.passengerName} | Motorista: ${newTrip.driverName} | Destino: ${newTrip.destination.address}`,
      severity: 'info',
      vehicleId: newTrip.vehicleId,
      vehiclePlate: newTrip.vehiclePlate,
      category: 'trip',
    });
  };

  const updateTripStatus = (tripId: string, status: TripStatus, rating?: number) => {
    setTrips(prev =>
      prev.map(t => {
        if (t.id === tripId) {
          const updated: Trip = {
            ...t,
            status,
            rating: rating || t.rating,
            endTime: status === 'completed' || status === 'cancelled' ? new Date().toISOString() : t.endTime,
          };

          if (status === 'completed') {
            // Free vehicle & driver
            updateVehicle(t.vehicleId, { status: 'idle', speedKmH: 0 });
            setDrivers(dPrev =>
              dPrev.map(d =>
                d.id === t.driverId
                  ? {
                      ...d,
                      status: 'online',
                      totalTripsCount: d.totalTripsCount + 1,
                      totalEarningsAOA: d.totalEarningsAOA + t.fareAOA,
                    }
                  : d
              )
            );

            triggerNotification({
              title: `Corrida Finalizada (${t.tripNumber})`,
              message: `Viagem concluída com sucesso. Faturamento: ${t.fareAOA.toLocaleString()} Kz recebido via ${t.paymentMethod}.`,
              severity: 'success',
              vehicleId: t.vehicleId,
              vehiclePlate: t.vehiclePlate,
              category: 'trip',
            });
          }

          return updated;
        }
        return t;
      })
    );
  };

  // Stop Report Actions
  const addStopReport = (reportData: Omit<StopReport, 'id' | 'timestamp' | 'status'>) => {
    const newReport: StopReport = {
      ...reportData,
      id: 'stp_' + Math.random().toString(36).substring(2, 8),
      timestamp: new Date().toISOString(),
      status: 'pending_review',
    };

    setStopReports(prev => [newReport, ...prev]);

    // Mark vehicle as stopped
    updateVehicle(reportData.vehicleId, {
      status: 'stopped',
      speedKmH: 0,
      coordinates: {
        ...vehicles.find(v => v.id === reportData.vehicleId)?.coordinates || {
          lat: -8.8383,
          lng: 13.2344,
          heading: 0,
          address: reportData.location.address,
        },
        address: reportData.location.address,
      }
    });

    // Mark driver on break
    setDrivers(prev =>
      prev.map(d => (d.id === reportData.driverId ? { ...d, status: 'on_break' } : d))
    );

    triggerNotification({
      title: `Feedback de Paragem Registrado (${reportData.vehiclePlate})`,
      message: `Motorista ${reportData.driverName} registou paragem por motivo: ${reportData.reason}. Relatório e mídia pendentes de revisão.`,
      severity: 'warning',
      vehicleId: reportData.vehicleId,
      vehiclePlate: reportData.vehiclePlate,
      category: 'stop_report',
    });
  };

  const reviewStopReport = (reportId: string, status: 'approved' | 'rejected', reviewNotes?: string) => {
    setStopReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status,
            reviewNotes: reviewNotes || (status === 'approved' ? 'Aprovado pelo gestor de frota.' : 'Rejeitado por inconformidade.'),
            reviewedBy: 'Gestor de Frota',
          };
        }
        return r;
      })
    );
  };

  // Breakdown Actions
  const addBreakdownReport = (breakdownData: Omit<BreakdownReport, 'id' | 'reportedAt'>) => {
    const newBreakdown: BreakdownReport = {
      ...breakdownData,
      id: 'brk_' + Math.random().toString(36).substring(2, 8),
      reportedAt: new Date().toISOString(),
    };

    setBreakdowns(prev => [newBreakdown, ...prev]);

    // Update vehicle status
    updateVehicle(breakdownData.vehicleId, {
      status: breakdownData.severity === 'critical' ? 'critical_breakdown' : 'maintenance',
      speedKmH: 0,
      activeIssuesCount: (vehicles.find(v => v.id === breakdownData.vehicleId)?.activeIssuesCount || 0) + 1,
    });

    // Notify
    triggerNotification({
      title: `AVARIA REPORTADA: ${breakdownData.title} (${breakdownData.vehiclePlate})`,
      message: `Gravidade: ${breakdownData.severity.toUpperCase()} | Motorista: ${breakdownData.driverName}. Veículo imobilizado/oficina.`,
      severity: breakdownData.severity === 'critical' ? 'critical' : 'warning',
      vehicleId: breakdownData.vehicleId,
      vehiclePlate: breakdownData.vehiclePlate,
      category: 'breakdown',
    });
  };

  const updateBreakdownStatus = (id: string, status: BreakdownStatus, mechanicNotes?: string) => {
    setBreakdowns(prev =>
      prev.map(b => {
        if (b.id === id) {
          const updated: BreakdownReport = {
            ...b,
            status,
            mechanicName: mechanicNotes ? (b.mechanicName || 'Oficina Credenciada') : b.mechanicName,
            resolvedAt: status === 'repaired' || status === 'closed' ? new Date().toISOString() : b.resolvedAt,
          };

          if (status === 'repaired' || status === 'closed') {
            // Return vehicle to idle state
            updateVehicle(b.vehicleId, {
              status: 'idle',
              activeIssuesCount: Math.max(0, (vehicles.find(v => v.id === b.vehicleId)?.activeIssuesCount || 1) - 1),
            });

            triggerNotification({
              title: `Avaria Resolvida no Veículo ${b.vehiclePlate}`,
              message: `Manutenção concluída para "${b.title}". Veículo liberado para operações normais.`,
              severity: 'success',
              vehicleId: b.vehicleId,
              vehiclePlate: b.vehiclePlate,
              category: 'breakdown',
            });
          }

          return updated;
        }
        return b;
      })
    );
  };

  // Alert Rules
  const updateAlertRule = (ruleId: string, updates: Partial<AlertRule>) => {
    setAlertRules(prev => prev.map(r => (r.id === ruleId ? { ...r, ...updates } : r)));
  };

  // Notification actions
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const toggleSimulation = () => setIsSimulating(prev => !prev);
  const toggleSound = () => setSoundEnabled(prev => !prev);

  // Export data
  const exportFleetData = (format: 'json' | 'csv') => {
    const payload = {
      exportDate: new Date().toISOString(),
      totalVehicles: vehicles.length,
      totalTrips: trips.length,
      vehicles,
      trips,
      stopReports,
      breakdowns,
      drivers,
    };

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `fleetgo_relatorio_geral_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      // CSV format for trips
      const headers = 'ID,Numero_Corrida,Passageiro,Motorista,Veiculo,Tipo,Origem,Destino,Distancia_KM,Tarifa_Kz,Pagamento,Status,Data\n';
      const rows = trips.map(t =>
        `"${t.id}","${t.tripNumber}","${t.passengerName}","${t.driverName}","${t.vehiclePlate}","${t.vehicleType}","${t.origin.address.replace(/"/g, '""')}","${t.destination.address.replace(/"/g, '""')}",${t.distanceKm},${t.fareAOA},"${t.paymentMethod}","${t.status}","${t.startTime}"`
      ).join('\n');

      const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `fleetgo_corridas_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  return (
    <FleetContext.Provider
      value={{
        vehicles,
        drivers,
        trips,
        stopReports,
        breakdowns,
        alertRules,
        notifications,
        externalApiData,
        isSimulating,
        soundEnabled,
        unreadNotificationsCount,
        toggleSimulation,
        toggleSound,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addTrip,
        updateTripStatus,
        addStopReport,
        reviewStopReport,
        addBreakdownReport,
        updateBreakdownStatus,
        updateAlertRule,
        markNotificationRead,
        markAllNotificationsRead,
        clearAllNotifications,
        exportFleetData,
        selectedVehicleId,
        setSelectedVehicleId,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = (): FleetContextType => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
