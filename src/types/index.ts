export type UserRole = 'admin' | 'fleet_manager' | 'dispatcher' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
  isEmailVerified: boolean;
  twoFactorEnabled?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn?: number;
}

export interface GolangAuthResponse {
  status: string;
  code?: number;
  message?: string;
  data?: {
    user: User;
    tokens?: AuthTokens;
    token?: string;
  };
  user?: User;
  token?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface ApiConfig {
  baseUrl: string;
  minioBaseUrl?: string;
  useMockSimulation: boolean;
  simulateLatencyMs: number;
  healthStatus: 'connected' | 'disconnected' | 'checking';
  minioHealthStatus?: 'connected' | 'disconnected' | 'checking';
  lastPingTimestamp?: number;
}

export interface MinioFileUploadResponse {
  status: string;
  message?: string;
  fileId?: string;
  fileName: string;
  fileUrl: string;
  bucket: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  status: number;
  durationMs: number;
  requestBody?: any;
  responseBody?: any;
  error?: string;
}

// Fleet & Vehicles
export type VehicleType = 'car_taxi' | 'moto_taxi';
export type VehicleStatus = 'in_trip' | 'idle' | 'maintenance' | 'critical_breakdown' | 'stopped';

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  type: VehicleType;
  color: string;
  status: VehicleStatus;
  driverId?: string;
  driverName?: string;
  // Live Telemetry
  fuelLevel: number; // 0 to 100%
  fuelType: 'gasoline' | 'diesel' | 'electric';
  oilHealth: number; // 0 to 100%
  odometerKm: number;
  batteryLevel: number; // %
  engineTempC: number; // Celsius
  tirePressureBar: number; // Bar e.g. 2.2
  speedKmH: number;
  coordinates: {
    lat: number;
    lng: number;
    heading: number;
    address: string;
  };
  lastMaintenanceDate: string;
  nextMaintenanceKm: number;
  activeIssuesCount: number;
  qrCode: string;
}

// Drivers / Taxistas
export type DriverStatus = 'online' | 'busy' | 'on_break' | 'offline' | 'suspended';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  status: DriverStatus;
  vehicleType: VehicleType;
  assignedVehicleId?: string;
  assignedVehiclePlate?: string;
  licenseNumber: string;
  licenseCategory: string; // 'B' (car) or 'A' (moto) or 'AB'
  licenseExpiry: string;
  rating: number; // e.g. 4.8
  totalTripsCount: number;
  totalEarningsAOA: number;
  shiftHoursActive: number; // in hours
  fatigueWarning: boolean;
  joinedDate: string;
  emergencyContact: string;
  documentsVerified: boolean;
}

// Rides / Corridas
export type TripStatus = 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'multicaixa_express' | 'pix' | 'card' | 'wallet';

export interface Trip {
  id: string;
  tripNumber: string;
  passengerName: string;
  passengerPhone: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleType: VehicleType;
  origin: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  distanceKm: number;
  estimatedDurationMinutes: number;
  actualDurationMinutes?: number;
  fareAOA: number;
  fareCurrency: string; // 'AOA' | 'EUR' | 'BRL' | 'USD'
  paymentMethod: PaymentMethod;
  status: TripStatus;
  startTime: string;
  endTime?: string;
  rating?: number;
  cancellationReason?: string;
}

// Stop Reports & Feedback (Feedback de paragem e motivos)
export type StopReason = 
  | 'fueling' // Abastecimento
  | 'lunch_rest' // Almoço / Descanso
  | 'police_inspection' // Fiscalização Policial / Blitz
  | 'heavy_traffic' // Congestionamento Severo
  | 'passenger_wait' // Aguardando Passageiro
  | 'tire_puncture' // Furo de Pneu / Troca
  | 'mechanical_check' // Verificação Mecânica
  | 'weather_hazard' // Chuva Forte / Inundação
  | 'other';

export interface StopReport {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleType: VehicleType;
  driverId: string;
  driverName: string;
  reason: StopReason;
  customReasonTitle?: string;
  description: string;
  startedAt: string;
  expectedDurationMinutes: number;
  actualDurationMinutes?: number;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  photos: string[]; // URLs of receipt, location, tire etc.
  audioMemoUrl?: string; // Voice memo url / simulated recording
  audioDurationSec?: number;
  odometerKmAtStop: number;
  fuelLitresAdded?: number;
  fuelCostAOA?: number;
  status: 'pending_review' | 'approved' | 'rejected' | 'resolved';
  reviewedBy?: string;
  reviewNotes?: string;
  timestamp: string;
}

// Avarias / Breakdowns
export type BreakdownSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BreakdownStatus = 'reported' | 'diagnosing' | 'in_workshop' | 'repaired' | 'closed';

export interface BreakdownReport {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleType: VehicleType;
  driverId: string;
  driverName: string;
  title: string;
  description: string;
  category: 'engine' | 'brakes' | 'electrical' | 'transmission' | 'tires' | 'bodywork' | 'oil_leak';
  severity: BreakdownSeverity;
  status: BreakdownStatus;
  photos: string[];
  audioMemoUrl?: string;
  estimatedCostAOA: number;
  actualCostAOA?: number;
  workshopName?: string;
  mechanicName?: string;
  partsNeeded?: string[];
  reportedAt: string;
  estimatedResolutionDate?: string;
  resolvedAt?: string;
  impactOnTrip: boolean;
}

// Alerts & Notifications
export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  read: boolean;
  vehicleId?: string;
  vehiclePlate?: string;
  driverId?: string;
  actionUrl?: string;
  category: 'telemetry' | 'breakdown' | 'stop_report' | 'trip' | 'security' | 'system';
}

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  conditionType: 'oil_below' | 'fuel_below' | 'stop_exceeded' | 'speed_exceeded' | 'temp_exceeded';
  thresholdValue: number;
  unit: string;
  severity: AlertSeverity;
  notifySound: boolean;
}

// External APIs space
export interface ExternalApiData {
  weather: {
    city: string;
    temperatureC: number;
    condition: 'Ensolarado' | 'Chuva' | 'Nublado' | 'Tempestade';
    humidityPercent: number;
    windSpeedKmH: number;
    roadConditionAlert?: string;
  };
  fuelPriceIndex: {
    gasolineAOA: number; // Preço por litro
    dieselAOA: number;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: string;
  };
  trafficIndex: {
    status: 'Fluido' | 'Moderado' | 'Congestionado' | 'Crítico';
    averageSpeedCityKmH: number;
    congestedZones: string[];
  };
}
