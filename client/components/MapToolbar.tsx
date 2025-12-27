import { useState } from "react";
import { Menu, X, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import SpatialSearch from "./SpatialSearch";
import LocationPathPanel from "./LocationPathPanel";

interface Building {
  id: string;
  name: string;
  coords: [number, number];
  character: string;
  descriptio: string;
}

interface Location {
  id: number;
  name: string;
  coords: [number, number];
}

interface MapToolbarProps {
  onLocationSelect?: (location: Building) => void;
  selectedLocation?: Building | Location | null;
  buildings?: Building[];
}

export default function MapToolbar({
  onLocationSelect,
  selectedLocation,
  buildings = [],
}: MapToolbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-white via-white to-blue-50/30 border-b border-border/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-base">DK</span>
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-lg text-foreground">
                DeKUT Campus Navigator
              </h1>
              <p className="text-xs text-muted-foreground">
                Find your way around campus
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg">
            <SpatialSearch
              onLocationSelect={onLocationSelect}
              buildings={buildings}
            />
          </div>

          {/* Selected Location Display */}
          {selectedLocation && "name" in selectedLocation && (
            <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-lg border border-primary/10 min-w-fit">
              <Navigation className="h-4 w-4 text-primary" />
              <div className="flex flex-col gap-0.5">
                <p className="text-xs text-muted-foreground font-medium">
                  Destination
                </p>
                <p className="text-sm font-semibold text-foreground truncate max-w-xs">
                  {selectedLocation.name}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-white font-bold text-sm">DK</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-foreground text-sm truncate">
                  DeKUT Navigator
                </h1>
                <p className="text-xs text-muted-foreground">Find your way</p>
              </div>
            </div>

            {/* Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 h-auto"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Search */}
          <div className="w-full">
            <SpatialSearch
              onLocationSelect={(location) => {
                onLocationSelect?.(location);
                setMobileMenuOpen(false);
              }}
              buildings={buildings}
            />
          </div>

          {/* Selected Location Display */}
          {selectedLocation && "name" in selectedLocation && (
            <div className="p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/10">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">
                    Destination Selected
                  </p>
                  <p className="font-semibold text-foreground text-sm">
                    {selectedLocation.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
