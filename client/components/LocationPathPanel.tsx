import { MapPin, Code, Map, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationPathPanelProps {
  location: {
    id: string;
    name: string;
    coords: [number, number];
    character: string;
    descriptio: string;
  } | null;
  onClear?: () => void;
  compact?: boolean;
}

export default function LocationPathPanel({
  location,
  onClear,
  compact = false,
}: LocationPathPanelProps) {
  if (!location) return null;

  const [latitude, longitude] = location.coords;

  if (compact) {
    // Compact version for mobile/toolbar
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20 w-full">
        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium">
            Destination
          </p>
          <p className="text-sm font-semibold text-foreground truncate">
            {location.name}
          </p>
        </div>
        {onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  }

  // Full version for detailed display
  return (
    <div className="w-full bg-white rounded-lg border border-border shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-4 py-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-foreground truncate">
              {location.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Location Details
            </p>
          </div>
        </div>
        {onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {/* Building Code */}
        {location.character && (
          <div className="flex items-start gap-3">
            <Code className="h-4 w-4 text-primary/70 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                Building Code
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {location.character}
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        {location.descriptio && (
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-primary/70 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                Description
              </p>
              <p className="text-sm text-foreground mt-0.5">
                {location.descriptio}
              </p>
            </div>
          </div>
        )}

        {/* Coordinates */}
        <div className="flex items-start gap-3">
          <Map className="h-4 w-4 text-primary/70 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">
              Coordinates
            </p>
            <div className="text-sm text-foreground mt-0.5 font-mono space-y-1">
              <p>
                <span className="text-muted-foreground">Lat:</span>{" "}
                {latitude.toFixed(6)}
              </p>
              <p>
                <span className="text-muted-foreground">Lon:</span>{" "}
                {longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Location Path breadcrumb */}
      <div className="bg-muted/30 border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground font-medium">
          Location Path
        </p>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-xs text-foreground font-medium">
            DeKUT Campus
          </span>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="text-xs text-primary font-medium">
            {location.name}
          </span>
        </div>
      </div>
    </div>
  );
}
