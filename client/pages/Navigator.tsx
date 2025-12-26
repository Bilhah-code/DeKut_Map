import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Satellite, Map as MapIcon, Crosshair } from "lucide-react";
import MapToolbar from "@/components/MapToolbar";
import CampusMap from "@/components/CampusMap";

interface Location {
  id: number;
  name: string;
  coords: [number, number];
  type: "building" | "entrance" | "facility";
  description: string;
}

export default function Navigator() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [userLocation, setUserLocation] = useState<{
    coords: [number, number];
    accuracy: number;
  } | null>(null);
  const [baseLayerKey, setBaseLayerKey] = useState<
    "openstreetmap" | "satellite"
  >("openstreetmap");

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setUserLocation({
            coords: [latitude, longitude],
            accuracy: accuracy,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Toolbar */}
      <MapToolbar
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
      />

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        <CampusMap
          selectedLocation={selectedLocation || undefined}
          userLocation={userLocation || undefined}
          onLocationSelect={handleLocationSelect}
          baseLayerKey={baseLayerKey}
          onBaseLayerChange={setBaseLayerKey}
        />

        {/* Map Controls - Top Right */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-40">
          {/* Basemap Toggle */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-border">
            <Button
              variant={baseLayerKey === "openstreetmap" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBaseLayerKey("openstreetmap")}
              className="w-12 h-12 rounded-none flex items-center justify-center"
              title="OpenStreetMap"
            >
              <MapIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={baseLayerKey === "satellite" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBaseLayerKey("satellite")}
              className="w-12 h-12 rounded-none flex items-center justify-center border-t border-border"
              title="Satellite"
            >
              <Satellite className="h-4 w-4" />
            </Button>
          </div>

          {/* Geolocation Button */}
          <Button
            onClick={handleGeolocation}
            size="sm"
            className="w-12 h-12 rounded-lg shadow-md p-0 flex items-center justify-center"
            title="Get My Location"
          >
            <Crosshair className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
