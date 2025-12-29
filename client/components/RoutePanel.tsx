import { useState } from "react";
import {
  Loader2,
  X,
  MapPin,
  Clock,
  Gauge,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Accessibility,
  Wind,
  Eye,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistance, formatTime } from "@/services/routingService";
import RouteOptions from "@/components/RouteOptions";
import type { RouteOption } from "@/components/RouteOptions";

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
  const [selectedRouteId, setSelectedRouteId] = useState("primary");

  // Generate alternative routes
  const alternativeRoutes: RouteOption[] = [
    {
      id: "primary",
      name: "Shortest Route",
      description: "Fastest way to reach your destination",
      distance: distance || 0,
      estimatedTime: estimatedTime || 0,
      difficulty: "easy",
      highlights: ["Paved pathway", "Accessible", "Well-lit"],
      isRecommended: true,
    },
    {
      id: "scenic",
      name: "Scenic Route",
      description: "More enjoyable walk with interesting views",
      distance: Math.round((distance || 0) * 1.15),
      estimatedTime: Math.round((estimatedTime || 0) * 1.15),
      difficulty: "easy",
      highlights: ["Beautiful views", "Landscaped areas", "Garden pathways"],
    },
    {
      id: "accessible",
      name: "Most Accessible",
      description: "Optimized for wheelchair and mobility device users",
      distance: Math.round((distance || 0) * 1.08),
      estimatedTime: Math.round((estimatedTime || 0) * 1.15),
      difficulty: "easy",
      highlights: ["Wheelchair accessible", "Ramps available", "Rest areas"],
    },
  ];

  if (!isOpen) return null;

  // Calculate additional metrics
  const pace =
    estimatedTime && distance
      ? Math.round((distance / estimatedTime / 1000) * 60 * 10) / 10
      : 0;
  const calories = distance ? Math.round((distance / 1000) * 60) : 0;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white rounded-2xl shadow-2xl border-2 border-blue-200 z-40 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">
      {/* Header with gradient */}
      <div className="flex items-center justify-between p-5 border-b-2 border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
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

      {/* Scrollable Content */}
      <div className="overflow-y-auto flex-1">
        <div className="p-5 space-y-5">
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
                  <div className="flex gap-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-300 shadow-sm">
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
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {startLocation.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Destination Location */}
                {destinationLocation && (
                  <div className="flex gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-500 shadow-sm">
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
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {destinationLocation.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t-2 border-gray-200" />

              {/* Main Route Stats */}
              <div className="grid grid-cols-2 gap-3">
                {/* Distance */}
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-300 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-orange-200 rounded-lg">
                      <Gauge className="h-4 w-4 text-orange-700" />
                    </div>
                    <p className="text-xs text-gray-700 font-bold">DISTANCE</p>
                  </div>
                  <p className="text-2xl font-black text-orange-600">
                    {distance !== undefined ? formatDistance(distance) : "—"}
                  </p>
                </div>

                {/* Walking Time */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-300 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-purple-200 rounded-lg">
                      <Clock className="h-4 w-4 text-purple-700" />
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

              {/* Secondary Route Stats */}
              <div className="grid grid-cols-2 gap-3">
                {/* Pace */}
                <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border-2 border-indigo-300 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-indigo-200 rounded">
                      <Zap className="h-3.5 w-3.5 text-indigo-700" />
                    </div>
                    <p className="text-xs text-gray-700 font-bold">PACE</p>
                  </div>
                  <p className="text-xl font-bold text-indigo-600">
                    {pace.toFixed(1)} km/h
                  </p>
                </div>

                {/* Calories */}
                <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-300 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-red-200 rounded">
                      <Wind className="h-3.5 w-3.5 text-red-700" />
                    </div>
                    <p className="text-xs text-gray-700 font-bold">CALORIES</p>
                  </div>
                  <p className="text-xl font-bold text-red-600">
                    ~{calories} kcal
                  </p>
                </div>
              </div>

              {/* Route Features Section */}
              <div className="border-t-2 border-gray-200 pt-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  Route Highlights
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Accessibility className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        Wheelchair Accessible
                      </p>
                      <p className="text-xs text-gray-600">
                        Mostly paved paths
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        Best For Walking
                      </p>
                      <p className="text-xs text-gray-600">
                        Follow the blue path on map
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro Tip Box */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-4">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-bold">💡 Pro Tip:</span> The estimated
                  time assumes a typical walking pace of ~5 km/h on accessible
                  paths. Actual time may vary based on terrain and personal
                  pace.
                </p>
              </div>

              {/* Expandable Details Section */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-xl border-2 border-gray-300 transition-all font-semibold text-gray-900"
              >
                <span className="flex items-center gap-2">More Details</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="space-y-5 pb-2">
                  {/* Route Options Section */}
                  <RouteOptions
                    routes={alternativeRoutes}
                    selectedRouteId={selectedRouteId}
                    onSelectRoute={setSelectedRouteId}
                  />

                  {/* Waypoints Section */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border-2 border-slate-300">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      Route Waypoints
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="inline-block w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">
                          1
                        </span>
                        <span className="text-gray-700 font-medium flex-1">
                          Start - {startLocation?.name || "Starting Point"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs ml-3">
                        <div className="w-0.5 h-8 bg-gradient-to-b from-green-500 to-blue-500"></div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                          2
                        </span>
                        <span className="text-gray-700 font-medium flex-1">
                          End - {destinationLocation?.name || "Destination"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 h-auto rounded-xl shadow-md">
                      Start Navigation
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-2 border-gray-300 text-gray-900 font-semibold py-2 h-auto rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      Share Route
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
