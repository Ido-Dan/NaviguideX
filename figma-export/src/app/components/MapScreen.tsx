import { useState } from 'react';
import { Settings, Target, Navigation2 } from 'lucide-react';
import { RouteBottomSheet } from './RouteBottomSheet';
import { CompassOverlay } from './CompassOverlay';
import { GPSIndicator } from './GPSIndicator';
import { SettingsScreen } from './SettingsScreen';
import naviguideLogoImg from 'figma:asset/b546daea989e4611aa07cf08579f0ce99b12b80a.png';

export interface Route {
  id: string;
  name: string;
  distance: string;
  waypoints: number;
  dateImported: string;
  coordinates?: Array<{ lat: number; lng: number }>;
}

export function MapScreen() {
  const [routes, setRoutes] = useState<Route[]>([
    {
      id: '1',
      name: 'נחל פרצים Trail',
      distance: '23.4 km',
      waypoints: 12,
      dateImported: 'Feb 12, 2026',
    },
    {
      id: '2',
      name: 'Negev Desert Loop',
      distance: '45.8 km',
      waypoints: 24,
      dateImported: 'Feb 10, 2026',
    },
    {
      id: '3',
      name: 'Golan Heights Ridge',
      distance: '18.2 km',
      waypoints: 8,
      dateImported: 'Feb 8, 2026',
    },
  ]);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [sheetOpen, setSheetOpen] = useState(true);
  const [orientationMode, setOrientationMode] = useState<'north-up' | 'heading-up'>('north-up');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userPosition] = useState({ lat: 32.0853, lng: 34.7818 }); // Tel Aviv area
  const [userHeading] = useState(45); // degrees

  const handleRouteSelect = (route: Route) => {
    setActiveRoute(route);
    setSheetOpen(false);
  };

  const handleRouteDelete = (routeId: string) => {
    setRoutes(routes.filter(r => r.id !== routeId));
    if (activeRoute?.id === routeId) {
      setActiveRoute(null);
    }
  };

  const handleImportGPX = () => {
    // Simulate file import
    const newRoute: Route = {
      id: Date.now().toString(),
      name: `Route ${routes.length + 1}`,
      distance: `${(Math.random() * 50 + 10).toFixed(1)} km`,
      waypoints: Math.floor(Math.random() * 20 + 5),
      dateImported: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setRoutes([...routes, newRoute]);
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
  };

  const handleCenterOnMe = () => {
    // In a real app, this would center the map on the user's position
    console.log('Center on user position');
  };

  const toggleOrientation = () => {
    setOrientationMode(prev => prev === 'north-up' ? 'heading-up' : 'north-up');
  };

  if (settingsOpen) {
    return <SettingsScreen onClose={() => setSettingsOpen(false)} />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#8FB893] map-container">
      {/* Topographic Map Background */}
      <div 
        className="absolute inset-0"
        onClick={() => sheetOpen && setSheetOpen(false)}
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(139, 195, 74, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(205, 220, 57, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 50% 80%, rgba(121, 85, 72, 0.15) 0%, transparent 40%),
            linear-gradient(135deg, #A5D6A7 0%, #8FB893 40%, #81C784 60%, #7FA885 100%)
          `,
        }}
      >
        {/* Contour lines - multiple layers for depth */}
        <div className="absolute inset-0 opacity-15">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="topo-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 0 L 40 0 L 40 40 L 0 40 Z" fill="none" stroke="#2B6E2F" strokeWidth="0.5" opacity="0.3" />
              </pattern>
              <pattern id="contours" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
                <path d="M 0 50 Q 75 40 150 50 T 300 50" stroke="#2B6E2F" fill="none" strokeWidth="1.5" opacity="0.6" />
                <path d="M 0 100 Q 75 85 150 100 T 300 100" stroke="#2B6E2F" fill="none" strokeWidth="1.2" opacity="0.5" />
                <path d="M 0 150 Q 75 135 150 150 T 300 150" stroke="#2B6E2F" fill="none" strokeWidth="1.5" opacity="0.6" />
                <path d="M 0 200 Q 75 190 150 200 T 300 200" stroke="#2B6E2F" fill="none" strokeWidth="1" opacity="0.4" />
                <path d="M 0 250 Q 75 240 150 250 T 300 250" stroke="#2B6E2F" fill="none" strokeWidth="1.2" opacity="0.5" />
              </pattern>
              <filter id="terrain">
                <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
                <feColorMatrix in="noise" type="saturate" values="0" />
                <feComponentTransfer>
                  <feFuncA type="discrete" tableValues="0 0.05 0.1" />
                </feComponentTransfer>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#topo-grid)" />
            <rect width="100%" height="100%" fill="url(#contours)" />
            <rect width="100%" height="100%" filter="url(#terrain)" opacity="0.3" />
          </svg>
        </div>

        {/* Trail markers (subtle dots representing paths) */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <circle cx="20%" cy="15%" r="2" fill="#8B4513" />
            <circle cx="25%" cy="20%" r="2" fill="#8B4513" />
            <circle cx="30%" cy="25%" r="2" fill="#8B4513" />
            <circle cx="60%" cy="40%" r="2" fill="#8B4513" />
            <circle cx="65%" cy="45%" r="2" fill="#8B4513" />
            <circle cx="70%" cy="50%" r="2" fill="#8B4513" />
            <circle cx="45%" cy="70%" r="2" fill="#8B4513" />
            <circle cx="50%" cy="75%" r="2" fill="#8B4513" />
            <circle cx="55%" cy="80%" r="2" fill="#8B4513" />
          </svg>
        </div>
      </div>

      {/* Active Route Line */}
      {activeRoute && (
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
          <path
            d="M 100 300 Q 200 250 300 300 T 500 300 L 600 400 Q 700 450 800 400"
            stroke="#F57C00"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Waypoint markers */}
          <circle cx="100" cy="300" r="8" fill="#FFB74D" stroke="#F57C00" strokeWidth="2" />
          <circle cx="300" cy="300" r="8" fill="#FFB74D" stroke="#F57C00" strokeWidth="2" />
          <circle cx="500" cy="300" r="8" fill="#FFB74D" stroke="#F57C00" strokeWidth="2" />
          <circle cx="600" cy="400" r="8" fill="#FFB74D" stroke="#F57C00" strokeWidth="2" />
          <circle cx="800" cy="400" r="8" fill="#FFB74D" stroke="#F57C00" strokeWidth="2" />
        </svg>
      )}

      {/* GPS Position Indicator */}
      <GPSIndicator 
        position={userPosition} 
        heading={userHeading}
        orientationMode={orientationMode}
      />

      {/* Settings Button (top-left) */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="absolute top-4 left-4 z-30 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white shadow-lg hover:bg-black/50 transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Compass Overlay (top-right) */}
      <CompassOverlay 
        mode={orientationMode} 
        onToggle={toggleOrientation}
      />

      {/* Center-on-me Button (bottom-right) */}
      <button
        onClick={handleCenterOnMe}
        className={`absolute right-4 z-30 w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white shadow-lg hover:bg-black/50 transition-colors ${
          activeRoute && !sheetOpen ? 'bottom-40' : 'bottom-32'
        }`}
        aria-label="Center on my position"
      >
        <Target className="w-6 h-6" />
      </button>

      {/* Active Route Info Bar (when route loaded and sheet collapsed) */}
      {activeRoute && !sheetOpen && (
        <div className="absolute bottom-20 left-4 right-4 z-20 bg-black/40 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Navigation2 className="w-5 h-5 text-[#F57C00]" />
            <span className="font-semibold">{activeRoute.name}</span>
          </div>
          <button
            onClick={handleClearRoute}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Clear route"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>
      )}

      {/* Pull-up Handle (when sheet collapsed) */}
      {!sheetOpen && (
        <button
          onClick={() => setSheetOpen(true)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/40 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-2 text-white shadow-lg hover:bg-black/50 transition-colors"
          aria-label="Open route list"
        >
          <div className="w-8 h-1 rounded-full bg-white/70" />
          <span className="text-sm font-semibold">Routes</span>
        </button>
      )}

      {/* Route Bottom Sheet */}
      <RouteBottomSheet
        routes={routes}
        activeRoute={activeRoute}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onRouteSelect={handleRouteSelect}
        onRouteDelete={handleRouteDelete}
        onImportGPX={handleImportGPX}
      />
    </div>
  );
}