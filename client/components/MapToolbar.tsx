import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SpatialSearch from "./SpatialSearch";

interface Location {
  id: number;
  name: string;
  coords: [number, number];
  type: "building" | "entrance" | "facility";
  description: string;
}

interface MapToolbarProps {
  onLocationSelect?: (location: Location) => void;
  selectedLocation?: Location | null;
}

export default function MapToolbar({
  onLocationSelect,
  selectedLocation,
}: MapToolbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DK</span>
            </div>
            <h1 className="font-semibold text-foreground hidden sm:block">
              DeKUT Campus Navigator
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <SpatialSearch
              onLocationSelect={onLocationSelect}
              isOpen={searchOpen}
              onClose={() => setSearchOpen(false)}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {selectedLocation && (
              <div className="text-sm text-muted-foreground hidden sm:block">
                {selectedLocation.name}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DK</span>
              </div>
              <h1 className="font-semibold text-foreground text-sm">
                DeKUT Navigator
              </h1>
            </div>

            {/* Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 h-auto"
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
              isOpen={searchOpen || mobileMenuOpen}
              onClose={() => {
                setSearchOpen(false);
                setMobileMenuOpen(false);
              }}
            />
          </div>

          {/* Selected Location Display */}
          {selectedLocation && (
            <div className="mt-3 p-2 bg-muted rounded text-sm">
              <p className="text-muted-foreground">Selected:</p>
              <p className="font-medium text-foreground">
                {selectedLocation.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
