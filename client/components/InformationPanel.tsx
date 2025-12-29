import {
  X,
  MapPin,
  Navigation,
  Clock,
  Calendar,
  Gauge,
  Share2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface InformationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation?: {
    id: string;
    name: string;
    coords: [number, number];
    character: string;
    descriptio: string;
  };
  distance?: number; // in meters
  estimatedTime?: number; // in minutes
  userLocation?: {
    coords: [number, number];
    accuracy: number;
  };
}

export default function InformationPanel({
  isOpen,
  onClose,
  selectedLocation,
  distance = 0,
  estimatedTime = 0,
  userLocation,
}: InformationPanelProps) {
  if (!isOpen || !selectedLocation) return null;

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div
      className={`fixed right-0 top-0 h-screen w-96 bg-gradient-to-b from-white via-blue-50 to-white border-l-2 border-blue-200 shadow-2xl transform transition-transform duration-300 z-40 overflow-y-auto flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex-shrink-0 sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 border-b-2 border-blue-800 flex items-center justify-between">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Details
        </h2>
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
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Date and Time Box */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border-2 border-indigo-300 shadow-md">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-xs font-bold text-indigo-700 uppercase">
                  Current Date
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {getCurrentDate()}
                </p>
              </div>
            </div>
            <div className="border-t border-indigo-300 pt-3 flex items-center gap-3">
              <Clock className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-xs font-bold text-indigo-700 uppercase">
                  Current Time
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {getCurrentTime()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Name Box */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-300 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-blue-700 uppercase mb-1">
                Location Name
              </p>
              <h3 className="text-lg font-black text-gray-900 break-words">
                {selectedLocation.name}
              </h3>
              {selectedLocation.character && (
                <p className="text-sm text-gray-700 mt-2 font-medium">
                  {selectedLocation.character}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Description Box */}
        {selectedLocation.descriptio && (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border-2 border-amber-300 shadow-md">
            <p className="text-xs font-bold text-amber-700 uppercase mb-3 block">
              Description
            </p>
            <p className="text-sm text-gray-900 leading-relaxed">
              {selectedLocation.descriptio}
            </p>
          </div>
        )}

        {/* Distance and Time Box */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-300 shadow-md">
          <p className="text-xs font-bold text-green-700 uppercase mb-4 block">
            Route Information
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-bold text-gray-700">
                  Distance
                </span>
              </div>
              <span className="text-lg font-black text-orange-600">
                {distance > 0 ? formatDistance(distance) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-bold text-gray-700">Time</span>
              </div>
              <span className="text-lg font-black text-purple-600">
                {estimatedTime > 0 ? formatTime(estimatedTime) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-gray-700">Speed</span>
              </div>
              <span className="text-lg font-black text-blue-600">
                {estimatedTime > 0 && distance > 0
                  ? `${Math.round((distance / estimatedTime / 1000) * 60 * 10) / 10} km/h`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Coordinates Box */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border-2 border-slate-300 shadow-md">
          <p className="text-xs font-bold text-slate-700 uppercase mb-3 block">
            Coordinates
          </p>
          <div className="space-y-2 font-mono text-xs bg-white rounded-lg p-3 border border-slate-200">
            <p>
              <span className="text-slate-500">Latitude:</span>{" "}
              <span className="text-gray-900 font-semibold">
                {selectedLocation.coords[0].toFixed(6)}
              </span>
            </p>
            <p>
              <span className="text-slate-500">Longitude:</span>{" "}
              <span className="text-gray-900 font-semibold">
                {selectedLocation.coords[1].toFixed(6)}
              </span>
            </p>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
          <p className="text-xs text-blue-900 leading-relaxed">
            <span className="font-bold">ℹ️ Info:</span> Select a starting
            location to calculate distance and estimated travel time to this
            destination.
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 sticky bottom-0 bg-white border-t-2 border-blue-200 p-4 space-y-3">
        <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md h-10">
          <Navigation className="h-4 w-4 mr-2" />
          Navigate Here
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-2 border-gray-300 hover:bg-gray-100 rounded-xl h-10"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-2 border-gray-300 hover:bg-gray-100 rounded-xl h-10"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
