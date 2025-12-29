import { MapPin, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModernHeaderProps {
  origin?: {
    name: string;
  } | null;
  destination?: {
    name: string;
  } | null;
  distance?: number;
  estimatedTime?: number;
  onSearchClick: () => void;
}

export default function ModernHeader({
  origin,
  destination,
  distance = 0,
  estimatedTime = 0,
  onSearchClick,
}: ModernHeaderProps) {
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
    <div className="fixed top-0 left-0 right-0 z-20 pointer-events-none">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 h-32 bg-gradient-to-b from-white/80 to-transparent backdrop-blur-xl" />

      {/* Content */}
      <div className="relative pointer-events-auto px-4 pt-4 pb-2">
        <div className="max-w-full mx-auto space-y-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-sm">DK</span>
            </div>
            <div>
              <h1 className="font-black text-lg text-gray-900">
                DeKUT Navigator
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Campus Navigation
              </p>
            </div>
          </div>

          {/* Quick Search / Route Info Bar */}
          {origin && destination && distance > 0 ? (
            // Route Info Display
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-blue-200 p-3 shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <MapPin className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                    <span className="font-bold text-gray-700 truncate">
                      {origin.name}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="font-bold text-gray-700 truncate">
                      {destination.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Navigation className="h-3 w-3 text-orange-600" />
                      <span className="text-xs font-bold text-orange-600">
                        {formatDistance(distance)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-purple-600" />
                      <span className="text-xs font-bold text-purple-600">
                        {formatTime(estimatedTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Search Button
            <button
              onClick={onSearchClick}
              className="w-full bg-white/70 backdrop-blur-md border border-gray-200 hover:border-blue-300 rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all shadow-md hover:shadow-lg hover:bg-white/90"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <span className="text-lg">🔍</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-gray-900">
                  {origin ? "Where to?" : "Where are you going?"}
                </p>
                <p className="text-xs text-gray-500">
                  {origin ? `From ${origin.name}` : "Select locations"}
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
