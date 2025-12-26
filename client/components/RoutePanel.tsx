import { Loader2, X, MapPin, Clock, Gauge } from "lucide-react";
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
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-lg shadow-lg border border-border z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Route Details</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Start Location */}
            {startLocation && (
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-medium text-foreground truncate">
                    {startLocation.name}
                  </p>
                </div>
              </div>
            )}

            {/* Destination Location */}
            {destinationLocation && (
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">To</p>
                  <p className="font-medium text-foreground truncate">
                    {destinationLocation.name}
                  </p>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Route Stats */}
            <div className="grid grid-cols-2 gap-3">
              {/* Distance */}
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">
                    Distance
                  </p>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {distance !== undefined
                    ? formatDistance(distance)
                    : "Calculating..."}
                </p>
              </div>

              {/* Walking Time */}
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">
                    Walk Time
                  </p>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {estimatedTime !== undefined
                    ? formatTime(estimatedTime)
                    : "Calculating..."}
                </p>
              </div>
            </div>

            {/* Info Text */}
            <p className="text-xs text-muted-foreground text-center py-2">
              Estimated walking time at ~5 km/h average pace
            </p>
          </>
        )}
      </div>
    </div>
  );
}
