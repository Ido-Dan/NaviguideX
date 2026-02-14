import { Drawer } from 'vaul';
import { Route } from './MapScreen';
import { FileUp, Trash2, Navigation2, MapPin, Calendar } from 'lucide-react';

interface RouteBottomSheetProps {
  routes: Route[];
  activeRoute: Route | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRouteSelect: (route: Route) => void;
  onRouteDelete: (routeId: string) => void;
  onImportGPX: () => void;
}

export function RouteBottomSheet({
  routes,
  activeRoute,
  open,
  onOpenChange,
  onRouteSelect,
  onRouteDelete,
  onImportGPX,
}: RouteBottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[#F5F3EF] rounded-t-2xl max-h-[80vh]">
          {/* Drag Handle */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#7A7267]/30 mt-4 mb-6" />

          <div className="flex-1 overflow-auto px-4 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#2C2C2C]">Your Routes</h2>
              <button
                onClick={onImportGPX}
                className="flex items-center gap-2 px-4 py-2 bg-[#F57C00] text-white rounded-lg hover:bg-[#E56D00] transition-colors font-semibold"
              >
                <FileUp className="w-4 h-4" />
                Import GPX
              </button>
            </div>

            {/* Routes List */}
            {routes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-[#81C784]/20 flex items-center justify-center">
                  <Navigation2 className="w-12 h-12 text-[#4CAF50]" />
                </div>
                <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">No routes yet</h3>
                <p className="text-[#7A7267] mb-6">Import a GPX file to start navigating</p>
                <button
                  onClick={onImportGPX}
                  className="flex items-center gap-2 px-6 py-3 bg-[#F57C00] text-white rounded-lg hover:bg-[#E56D00] transition-colors font-semibold"
                >
                  <FileUp className="w-5 h-5" />
                  Import GPX
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    isActive={activeRoute?.id === route.id}
                    onSelect={() => onRouteSelect(route)}
                    onDelete={() => onRouteDelete(route.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

interface RouteCardProps {
  route: Route;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function RouteCard({ route, isActive, onSelect, onDelete }: RouteCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`relative bg-white rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
        isActive ? 'ring-2 ring-[#4CAF50]' : ''
      }`}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#4CAF50] rounded-r-full" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-[17px] font-semibold text-[#2C2C2C] mb-2 truncate">
            {route.name}
          </h3>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#7A7267]">
            <div className="flex items-center gap-1.5">
              <Navigation2 className="w-3.5 h-3.5" />
              <span>{route.distance}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{route.waypoints} waypoints</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{route.dateImported}</span>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-[#E53935]/10 text-[#E53935] flex items-center justify-center hover:bg-[#E53935]/20 transition-colors"
          aria-label="Delete route"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
