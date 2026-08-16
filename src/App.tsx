import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FleetProvider, useFleet } from './context/FleetContext';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TabType } from './components/layout/Sidebar';

// Modals
import { AuthModal } from './components/auth/AuthModal';
import { ApiConfigModal } from './components/auth/ApiConfigModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { NewVehicleModal } from './components/fleet/NewVehicleModal';
import { VehicleDetailModal } from './components/fleet/VehicleDetailModal';
import { NewTripModal } from './components/trips/NewTripModal';
import { NewBreakdownModal } from './components/maintenance/NewBreakdownModal';

// Views
import { StatsOverview } from './components/dashboard/StatsOverview';
import { LiveFleetMap } from './components/dashboard/LiveFleetMap';
import { ActiveTripsFeed } from './components/dashboard/ActiveTripsFeed';
import { TelemetryWidget } from './components/dashboard/TelemetryWidget';
import { VehicleList } from './components/fleet/VehicleList';
import { TripList } from './components/trips/TripList';
import { DriverList } from './components/drivers/DriverList';
import { BreakdownManager } from './components/maintenance/BreakdownManager';
import { StopReportsManager } from './components/maintenance/StopReportsManager';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { Vehicle } from './types';
import { ShieldCheck } from 'lucide-react';

function MainFleetApp() {
  const { user, isAuthenticated } = useAuth();
  const { setSelectedVehicleId } = useFleet();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);
  const [isNewTripOpen, setIsNewTripOpen] = useState(false);
  const [isNewBreakdownOpen, setIsNewBreakdownOpen] = useState(false);
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);
  const [preSelectedVehicleForTrip, setPreSelectedVehicleForTrip] = useState<Vehicle | null>(null);
  const [preSelectedPlateForBreakdown, setPreSelectedPlateForBreakdown] = useState<string | undefined>(undefined);

  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleForDetail(vehicle);
    setSelectedVehicleId(vehicle.id);
  };

  const handleDispatchTrip = (vehicle: Vehicle) => {
    setPreSelectedVehicleForTrip(vehicle);
    setIsNewTripOpen(true);
  };

  const handleReportBreakdown = (vehicle: Vehicle) => {
    setPreSelectedPlateForBreakdown(vehicle.plate);
    setIsNewBreakdownOpen(true);
  };

  const handleFocusVehicleOnMap = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setActiveTab('map');
  };

  const handleSelectNavTab = (tab: TabType) => {
    if (tab === 'api_debugger') {
      setIsApiConfigOpen(true);
    } else {
      setActiveTab(tab);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Top Header Navbar */}
      <Navbar
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenApiConfig={() => setIsApiConfigOpen(true)}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobileMenuOpen={mobileMenuOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className={`${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden md:flex'}`}>
          <Sidebar
            activeTab={activeTab}
            onSelectTab={handleSelectNavTab}
            onOpenNewTrip={() => {
              setPreSelectedVehicleForTrip(null);
              setIsNewTripOpen(true);
            }}
            onOpenNewStop={() => setActiveTab('stops')}
            onOpenReportBreakdown={() => {
              setPreSelectedPlateForBreakdown(undefined);
              setIsNewBreakdownOpen(true);
            }}
          />
        </div>

        {/* Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#0A0A0B] text-slate-50 relative">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 4-Column Metric Overview */}
              <StatsOverview />

              {/* Live GPS Map & Fleet State Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <LiveFleetMap onSelectVehicle={handleSelectVehicle} />
                </div>
                <div>
                  <TelemetryWidget />
                </div>
              </div>

              {/* Active Trips & Vehicle Registry */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <ActiveTripsFeed
                    onOpenNewTrip={() => {
                      setPreSelectedVehicleForTrip(null);
                      setIsNewTripOpen(true);
                    }}
                    onFocusVehicleOnMap={handleFocusVehicleOnMap}
                  />
                </div>
                <div className="lg:col-span-2">
                  <VehicleList
                    onOpenNewVehicle={() => setIsNewVehicleOpen(true)}
                    onSelectVehicle={handleSelectVehicle}
                    onDispatchTrip={handleDispatchTrip}
                    onReportBreakdown={handleReportBreakdown}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Full Screen Map View */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <LiveFleetMap onSelectVehicle={handleSelectVehicle} fullHeight />
            </div>
          )}

          {/* Fleet Registry Tab */}
          {activeTab === 'vehicles' && (
            <VehicleList
              onOpenNewVehicle={() => setIsNewVehicleOpen(true)}
              onSelectVehicle={handleSelectVehicle}
              onDispatchTrip={handleDispatchTrip}
              onReportBreakdown={handleReportBreakdown}
            />
          )}

          {/* Trips Tab */}
          {activeTab === 'trips' && (
            <TripList
              onOpenNewTrip={() => {
                setPreSelectedVehicleForTrip(null);
                setIsNewTripOpen(true);
              }}
              onFocusVehicleOnMap={handleFocusVehicleOnMap}
            />
          )}

          {/* Drivers Tab */}
          {activeTab === 'drivers' && <DriverList />}

          {/* Maintenance & Breakdowns Tab */}
          {activeTab === 'breakdowns' && (
            <BreakdownManager
              onOpenNewBreakdown={() => {
                setPreSelectedPlateForBreakdown(undefined);
                setIsNewBreakdownOpen(true);
              }}
            />
          )}

          {/* Driver Stop Feedback Reports Tab */}
          {activeTab === 'stops' && <StopReportsManager />}

          {/* Analytics & Reports Tab */}
          {activeTab === 'analytics' && <AnalyticsView />}

          {/* Alert Rules Tab */}
          {activeTab === 'rules' && <AnalyticsView />}
        </main>
      </div>

      {/* Floating Auth Token / Session Card (Artistic Flair Design Badge) */}
      <div className="fixed bottom-6 right-6 z-30 hidden lg:flex flex-col gap-2 pointer-events-none">
        <div className="bg-white text-black p-4 rounded-2xl shadow-2xl max-w-[240px] border border-slate-200 pointer-events-auto">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Sistema Auth
            </p>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xs font-bold mt-1 text-slate-900">
            {isAuthenticated ? 'Token JWT Ativo v2.4' : 'Modo Demonstração'}
          </p>
          <p className="text-[10px] text-slate-500">
            {isAuthenticated ? 'Sessão expira em 4h 22m' : 'Conecte à Golang Auth API'}
          </p>
        </div>
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onOpenApiConfig={() => {
          setIsAuthModalOpen(false);
          setIsApiConfigOpen(true);
        }}
      />

      <ApiConfigModal
        isOpen={isApiConfigOpen}
        onClose={() => setIsApiConfigOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <NewVehicleModal
        isOpen={isNewVehicleOpen}
        onClose={() => setIsNewVehicleOpen(false)}
      />

      <VehicleDetailModal
        vehicle={selectedVehicleForDetail}
        isOpen={!!selectedVehicleForDetail}
        onClose={() => setSelectedVehicleForDetail(null)}
        onDispatchTrip={handleDispatchTrip}
        onReportBreakdown={handleReportBreakdown}
      />

      <NewTripModal
        isOpen={isNewTripOpen}
        onClose={() => setIsNewTripOpen(false)}
        preSelectedVehicle={preSelectedVehicleForTrip}
      />

      <NewBreakdownModal
        isOpen={isNewBreakdownOpen}
        onClose={() => setIsNewBreakdownOpen(false)}
        preSelectedVehiclePlate={preSelectedPlateForBreakdown}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FleetProvider>
          <MainFleetApp />
        </FleetProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
