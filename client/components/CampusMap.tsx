import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Satellite, Map as MapIcon, Crosshair } from "lucide-react";

// Sample campus buildings data
const CAMPUS_BUILDINGS = [
  {
    id: 1,
    name: "Main Gate",
    coords: [-0.3603, 37.0093] as [number, number],
    type: "entrance",
  },
  {
    id: 2,
    name: "Main Library",
    coords: [-0.3605, 37.0095] as [number, number],
    type: "building",
  },
  {
    id: 3,
    name: "Engineering Building",
    coords: [-0.3608, 37.0098] as [number, number],
    type: "building",
  },
  {
    id: 4,
    name: "Student Center",
    coords: [-0.3610, 37.0090] as [number, number],
    type: "building",
  },
  {
    id: 5,
    name: "Sports Complex",
    coords: [-0.3600, 37.0085] as [number, number],
    type: "facility",
  },
];

interface CampusMapProps {
  selectedLocation?: {
    id: number;
    name: string;
    coords: [number, number];
  };
  userLocation?: {
    coords: [number, number];
    accuracy: number;
  };
  onLocationSelect?: (location: typeof CAMPUS_BUILDINGS[0]) => void;
  baseLayerKey?: "openstreetmap" | "satellite";
  onBaseLayerChange?: (key: "openstreetmap" | "satellite") => void;
}

export default function CampusMap({
  selectedLocation,
  userLocation,
  onLocationSelect,
  baseLayerKey = "openstreetmap",
  onBaseLayerChange,
}: CampusMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Default campus center (Dedan Kimathi University)
  const defaultCenter: [number, number] = [-0.3605, 37.0093];
  const defaultZoom = 16;

  const markersRef = useRef<L.Marker[]>([]);
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView(defaultCenter, defaultZoom);
    }

    // Add base layer
    if (baseLayerKey === "openstreetmap") {
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(mapRef.current);
    } else {
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastered/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(mapRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add building markers
    CAMPUS_BUILDINGS.forEach((building) => {
      const marker = L.marker(building.coords).addTo(mapRef.current!);
      marker
        .bindPopup(`<strong>${building.name}</strong><br/>${building.type}`)
        .on("click", () => onLocationSelect?.(building));
      markersRef.current.push(marker);
    });

    // Add user location marker if available
    if (userLocation) {
      const userMarker = L.circleMarker(userLocation.coords, {
        radius: 6,
        fillColor: "#2057d9",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapRef.current);
      userMarker.bindPopup("Your Location");
    }

    // Add selected location marker if available
    if (selectedLocation) {
      mapRef.current.setView(selectedLocation.coords, 17);
      const selectedMarker = L.circleMarker(selectedLocation.coords, {
        radius: 8,
        fillColor: "#ff8c1a",
        color: "#fff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapRef.current);
      selectedMarker.bindPopup(selectedLocation.name);
    }
  }, [baseLayerKey, selectedLocation, userLocation, onLocationSelect]);

  const toggleBaseLayer = (key: "openstreetmap" | "satellite") => {
    setBaseLayerKey(key);
    // Clear the map layers
    mapRef.current?.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapRef.current?.setView([latitude, longitude], 17);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white overflow-hidden">
      {/* Map Container */}
      <div
        id="map"
        className="flex-1 relative w-full"
        style={{ height: "100%" }}
      />

      {/* Map Controls - Top Right */}
      <div className="fixed top-20 right-6 flex flex-col gap-2 z-50 pointer-events-auto">
        {/* Basemap Toggle */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-border">
          <Button
            variant={baseLayerKey === "openstreetmap" ? "default" : "ghost"}
            size="sm"
            onClick={() => toggleBaseLayer("openstreetmap")}
            className="w-12 h-12 rounded-none flex items-center justify-center"
            title="OpenStreetMap"
          >
            <MapIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={baseLayerKey === "satellite" ? "default" : "ghost"}
            size="sm"
            onClick={() => toggleBaseLayer("satellite")}
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
  );
}
