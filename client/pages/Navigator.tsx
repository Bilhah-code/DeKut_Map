import { useState } from "react";
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
    null
  );
  const [userLocation, setUserLocation] = useState<{
    coords: [number, number];
    accuracy: number;
  } | null>(null);

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
        }
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
        />
      </div>
    </div>
  );
}
