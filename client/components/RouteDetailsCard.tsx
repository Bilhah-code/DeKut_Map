import {
  ArrowRight,
  MapPin,
  Clock,
  Gauge,
  Zap,
  Wind,
  AlertCircle,
  CheckCircle2,
  Eye,
} from "lucide-react";

interface RouteDetailsCardProps {
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
  className?: string;
}

export default function RouteDetailsCard({
  startLocation,
  destinationLocation,
  distance = 0,
  estimatedTime = 0,
  className = "",
}: RouteDetailsCardProps) {
  const pace =
    estimatedTime > 0
      ? Math.round((distance / estimatedTime / 1000) * 60 * 10) / 10
      : 0;
  const calories = Math.round((distance / 1000) * 60);

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

  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-200 overflow-hidden shadow-lg hover:shadow-xl transition-all ${className}`}
    >
      {/* Header Section */}
      <div className="p-5 border-b-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Route Summary</h3>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-xs font-bold text-green-700">Available</span>
          </div>
        </div>

        {/* Location Path */}
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-gray-900 truncate max-w-xs">
            {startLocation?.name || "Start"}
          </span>
          <ArrowRight className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span className="font-semibold text-gray-900 truncate max-w-xs">
            {destinationLocation?.name || "End"}
          </span>
        </div>
      </div>

      {/* Main Stats Section */}
      <div className="p-5 space-y-4">
        {/* Primary Stats */}
        <div className="grid grid-cols-2 gap-3">
          {/* Distance Card */}
          <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl border-2 border-orange-300">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-bold text-gray-700">Distance</span>
            </div>
            <p className="text-2xl font-black text-orange-600">
              {formatDistance(distance)}
            </p>
          </div>

          {/* Time Card */}
          <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl border-2 border-purple-300">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-bold text-gray-700">Time</span>
            </div>
            <p className="text-2xl font-black text-purple-600">
              {formatTime(estimatedTime)}
            </p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 gap-2">
          {/* Pace */}
          <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg border-2 border-indigo-300">
            <div className="flex items-center gap-1.5 mb-1">
              <Wind className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-gray-700">Pace</span>
            </div>
            <p className="text-lg font-bold text-indigo-600">
              {pace.toFixed(1)}
            </p>
            <p className="text-xs text-gray-600">km/h</p>
          </div>

          {/* Calories */}
          <div className="p-3 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border-2 border-red-300">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="h-3.5 w-3.5 text-red-600" />
              <span className="text-xs font-bold text-gray-700">Calories</span>
            </div>
            <p className="text-lg font-bold text-red-600">~{calories}</p>
            <p className="text-xs text-gray-600">kcal</p>
          </div>

          {/* Steps Estimate */}
          <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg border-2 border-emerald-300">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-gray-700">Steps</span>
            </div>
            <p className="text-lg font-bold text-emerald-600">
              ~{Math.round(distance / 0.75)}
            </p>
            <p className="text-xs text-gray-600">est.</p>
          </div>
        </div>
      </div>

      {/* Route Features */}
      <div className="px-5 pb-5 space-y-2">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <Eye className="h-3.5 w-3.5" /> Route Features
        </h4>
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 bg-blue-100 rounded-lg border border-blue-300">
            <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-gray-900">
                Wheelchair Accessible
              </p>
              <p className="text-gray-700">Paved pathways</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-amber-100 rounded-lg border border-amber-300">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-gray-900">
                Optimal Walking Route
              </p>
              <p className="text-gray-700">Follow blue highlighted path</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 bg-gray-100 text-xs text-gray-600 border-t-2 border-gray-200">
        <p>
          Times are based on average walking pace (~5 km/h). Actual time may
          vary.
        </p>
      </div>
    </div>
  );
}
