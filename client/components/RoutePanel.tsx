import { useState } from "react";
import { Loader2, X, MapPin, Clock, Gauge, CheckCircle, ChevronDown, ChevronUp, AlertCircle, Accessibility, Wind, Eye, Zap } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-2xl border-2 border-blue-300 z-40 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header with gradient */}
      <div className="flex items-center justify-between p-5 border-b-2 border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-white" />
          <h2 className="font-bold text-white text-lg">Route Found</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-blue-600 rounded-lg text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse"></div>
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin relative" />
            </div>
            <p className="text-sm font-medium text-blue-900">
              Calculating route...
            </p>
          </div>
        ) : (
          <>
            {/* Route Path Display */}
            <div className="space-y-3">
              {/* Start Location */}
              {startLocation && (
                <div className="flex gap-4 p-4 bg-white rounded-xl border-2 border-green-300 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="w-4 h-4 rounded-full bg-green-500 border-3 border-white relative shadow-lg"></div>
                    </div>
                    {destinationLocation && (
                      <div className="w-1 h-12 bg-gradient-to-b from-green-500 via-blue-500 to-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide">
                      Starting Point
                    </p>
                    <p className="font-bold text-gray-900 text-base truncate">
                      {startLocation.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Destination Location */}
              {destinationLocation && (
                <div className="flex gap-4 p-4 bg-white rounded-xl border-2 border-blue-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="w-5 h-5 rounded-full bg-blue-600 border-3 border-white relative shadow-lg"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                      Destination
                    </p>
                    <p className="font-bold text-gray-900 text-base truncate">
                      {destinationLocation.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t-2 border-blue-200" />

            {/* Route Stats */}
            <div className="grid grid-cols-2 gap-3">
              {/* Distance */}
              <div className="p-4 bg-white rounded-xl border-2 border-orange-300 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Gauge className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-xs text-gray-700 font-bold">DISTANCE</p>
                </div>
                <p className="text-2xl font-black text-orange-600">
                  {distance !== undefined ? formatDistance(distance) : "—"}
                </p>
              </div>

              {/* Walking Time */}
              <div className="p-4 bg-white rounded-xl border-2 border-purple-300 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-700 font-bold">TIME</p>
                </div>
                <p className="text-2xl font-black text-purple-600">
                  {estimatedTime !== undefined
                    ? formatTime(estimatedTime)
                    : "—"}
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4">
              <p className="text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">Pro Tip:</span> Follow the
                highlighted blue route on the map. The route uses the shortest
                path through campus with times estimated at ~5 km/h walking
                pace.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
