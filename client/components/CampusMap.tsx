import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Popup, Marker } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { MapPin, Satellite, Map as MapIcon, Crosshair } from "lucide-react";

// Import default Leaflet icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.setIcon(DefaultIcon);

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
}

export default function CampusMap({
  selectedLocation,
  userLocation,
  onLocationSelect,
}: CampusMapProps) {
  const mapRef = useRef(null);
  const [baseLayers, setBaseLayers] = useState<
    Record<string, { layer: TileLayer; active: boolean }>
  >({});
  const [baseLayerKey, setBaseLayerKey] = useState<"openstreetmap" | "satellite">(
    "openstreetmap"
  );

  // Default campus center (Dedan Kimathi University)
  const defaultCenter: [number, number] = [-0.3605, 37.0093];
  const defaultZoom = 16;

  const toggleBaseLayer = (key: "openstreetmap" | "satellite") => {
    setBaseLayerKey(key);
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("User position:", position.coords);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white">
      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={selectedLocation?.coords || defaultCenter}
          zoom={defaultZoom}
          className="w-full h-full"
          ref={mapRef}
        >
          {baseLayerKey === "openstreetmap" && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          {baseLayerKey === "satellite" && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastered/{z}/{x}/{y}.png"
            />
          )}

          {/* Campus Buildings */}
          {CAMPUS_BUILDINGS.map((building) => (
            <Marker
              key={building.id}
              position={building.coords}
              eventHandlers={{
                click: () => onLocationSelect?.(building),
              }}
            >
              <Popup>
                <div className="p-2 text-sm">
                  <h3 className="font-semibold text-foreground">
                    {building.name}
                  </h3>
                  <p className="text-muted-foreground text-xs mt-1">
                    {building.type === "building" && "Building"}
                    {building.type === "entrance" && "Entrance"}
                    {building.type === "facility" && "Facility"}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User Location */}
          {userLocation && (
            <>
              <Marker position={userLocation.coords}>
                <Popup>Your Location</Popup>
              </Marker>
              {/* Accuracy Circle */}
              {/* Note: In a real implementation, you'd use a Circle from react-leaflet */}
            </>
          )}

          {/* Selected Location Marker */}
          {selectedLocation && (
            <Marker position={selectedLocation.coords}>
              <Popup>{selectedLocation.name}</Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Map Controls - Top Right */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-40">
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
    </div>
  );
}
