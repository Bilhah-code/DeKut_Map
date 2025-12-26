import { useEffect, useRef } from "react";
import L from "leaflet";

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
    coords: [-0.361, 37.009] as [number, number],
    type: "building",
  },
  {
    id: 5,
    name: "Sports Complex",
    coords: [-0.36, 37.0085] as [number, number],
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
  onLocationSelect?: (location: (typeof CAMPUS_BUILDINGS)[0]) => void;
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

    // Remove previous layer if it exists
    if (layerRef.current) {
      mapRef.current.removeLayer(layerRef.current);
    }

    // Add base layer
    if (baseLayerKey === "openstreetmap") {
      layerRef.current = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        },
      ).addTo(mapRef.current);
    } else {
      layerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastered/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        },
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

  return (
    <div className="relative w-full h-full flex flex-col bg-white overflow-hidden">
      {/* Map Container */}
      <div
        id="map"
        className="flex-1 relative w-full"
        style={{ height: "100%" }}
      />
    </div>
  );
}
