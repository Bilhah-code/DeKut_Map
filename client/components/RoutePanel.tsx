import {
  Loader2,
  X,
  MapPin,
  Clock,
  Gauge,
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
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 z-40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-bold text-gray-900">Route Details</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-gray-100 rounded"
        >
          <X className="h-4 w-4 text-gray-600" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            <p className="text-sm text-gray-600">Calculating route...</p>
          </div>
        ) : (
          <>
            {/* Route Path Display */}
            <div className="space-y-2">
              {/* Start Location */}
              {startLocation && (
                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    {destinationLocation && (
                      <div className="w-0.5 h-8 bg-gradient-to-b from-green-600 to-blue-600"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      From
                    </p>
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {startLocation.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Destination Location */}
              {destinationLocation && (
                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      To
                    </p>
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {destinationLocation.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Route Stats */}
            <div className="grid grid-cols-2 gap-3">
              {/* Distance */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="h-4 w-4 text-gray-600" />
                  <p className="text-xs text-gray-600 font-semibold">
                    Distance
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {distance !== undefined ? formatDistance(distance) : "—"}
                </p>
              </div>

              {/* Walking Time */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <p className="text-xs text-gray-600 font-semibold">
                    Walk Time
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {estimatedTime !== undefined
                    ? formatTime(estimatedTime)
                    : "—"}
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                <span className="font-semibold">Note:</span> Route uses the shortest path through campus. Times estimated at ~5 km/h walking pace.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
