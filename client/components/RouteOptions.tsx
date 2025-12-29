import { Clock, Gauge, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RouteOption {
  id: string;
  name: string;
  description: string;
  distance: number; // in meters
  estimatedTime: number; // in minutes
  difficulty: "easy" | "moderate" | "hard";
  highlights: string[];
  isRecommended?: boolean;
}

interface RouteOptionsProps {
  routes: RouteOption[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  className?: string;
}

export default function RouteOptions({
  routes,
  selectedRouteId,
  onSelectRoute,
  className = "",
}: RouteOptionsProps) {
  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return {
          bg: "bg-green-100",
          border: "border-green-300",
          text: "text-green-700",
          dot: "bg-green-500",
        };
      case "moderate":
        return {
          bg: "bg-amber-100",
          border: "border-amber-300",
          text: "text-amber-700",
          dot: "bg-amber-500",
        };
      case "hard":
        return {
          bg: "bg-red-100",
          border: "border-red-300",
          text: "text-red-700",
          dot: "bg-red-500",
        };
      default:
        return {
          bg: "bg-gray-100",
          border: "border-gray-300",
          text: "text-gray-700",
          dot: "bg-gray-500",
        };
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
        <Zap className="h-4 w-4 text-blue-600" />
        Route Options
      </h3>

      <div className="space-y-3">
        {routes.map((route) => {
          const difficultyColors = getDifficultyColor(route.difficulty);
          const isSelected = selectedRouteId === route.id;

          return (
            <button
              key={route.id}
              onClick={() => onSelectRoute?.(route.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? "bg-blue-50 border-blue-500 shadow-md"
                  : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">{route.name}</h4>
                    {route.isRecommended && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-bold text-green-700">
                          Recommended
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{route.description}</p>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Route Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Gauge className="h-3 w-3 text-orange-600" />
                  </div>
                  <p className="text-xs font-bold text-orange-700">
                    {formatDistance(route.distance)}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-3 w-3 text-purple-600" />
                  </div>
                  <p className="text-xs font-bold text-purple-700">
                    {formatTime(route.estimatedTime)}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-lg text-center ${difficultyColors.bg}`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div
                      className={`w-2 h-2 rounded-full ${difficultyColors.dot}`}
                    ></div>
                  </div>
                  <p
                    className={`text-xs font-bold capitalize ${difficultyColors.text}`}
                  >
                    {route.difficulty}
                  </p>
                </div>
              </div>

              {/* Highlights */}
              {route.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {route.highlights.slice(0, 3).map((highlight, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2 py-1 bg-blue-100 rounded-md text-xs font-medium text-blue-700"
                    >
                      {highlight}
                    </span>
                  ))}
                  {route.highlights.length > 3 && (
                    <span className="inline-block px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
                      +{route.highlights.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="flex gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-900">
          <span className="font-bold">Tip:</span> Select a route to navigate and
          see detailed directions on the map.
        </p>
      </div>
    </div>
  );
}
