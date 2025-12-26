import {
  Loader2,
  X,
  MapPin,
  Clock,
  Gauge,
  Navigation2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistance, formatTime } from "@/services/routingService";

interface RoutePanelProps {
  isOpen: boolean;
  onClose: () => void;
  startLocation?: {
    name: string;
    coords: [number, number];
  };
  destinationLocation?: {
    name: string;
    coords: [number, number];
  };
  distance?: number; // in meters
  estimatedTime?: number; // in minutes
  isLoading?: boolean;
}

export default function RoutePanel({
  isOpen,
  onClose,
  startLocation,
  destinationLocation,
  distance,
  estimatedTime,
  isLoading,
}: RoutePanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-xl shadow-2xl border border-border z-40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
        <div className="flex items-center gap-2">
          <Navigation2 className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-foreground">Route Details</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Calculating route...
            </p>
          </div>
        ) : (
          <>
            {/* Route Path Display */}
            <div className="space-y-2">
              {/* Start Location */}
              {startLocation && (
                <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-600"></div>
                    {destinationLocation && (
                      <div className="w-0.5 h-8 bg-gradient-to-b from-green-500 to-blue-500"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs text-muted-foreground font-semibold uppercase">
                      From
                    </p>
                    <p className="font-semibold text-foreground text-sm truncate">
                      {startLocation.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Destination Location */}
              {destinationLocation && (
                <div className="flex gap-3 p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                    <div className="w-4 h-4 rounded-full bg-primary border-2 border-primary/80 shadow-sm"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-semibold uppercase">
                      To
                    </p>
                    <p className="font-semibold text-foreground text-sm truncate">
                      {destinationLocation.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Route Stats */}
            <div className="grid grid-cols-2 gap-2">
              {/* Distance */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg p-3 border border-orange-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="h-4 w-4 text-orange-600" />
                  <p className="text-xs text-orange-700 font-semibold">
                    Distance
                  </p>
                </div>
                <p className="text-xl font-bold text-orange-900">
                  {distance !== undefined ? formatDistance(distance) : "—"}
                </p>
              </div>

              {/* Walking Time */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-3 border border-blue-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <p className="text-xs text-blue-700 font-semibold">
                    Walk Time
                  </p>
                </div>
                <p className="text-xl font-bold text-blue-900">
                  {estimatedTime !== undefined
                    ? formatTime(estimatedTime)
                    : "—"}
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200/50 rounded-lg p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Walking pace:</span> ~5 km/h
                average. Times are estimates based on flat terrain.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
