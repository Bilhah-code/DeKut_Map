import { useEffect, useRef, useState } from "react";
import L from "leaflet";

interface Building {
  id: string;
  name: string;
  coords: [number, number];
  character: string;
  descriptio: string;
}

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
  onLocationSelect?: (location: Building) => void;
  baseLayerKey?: "openstreetmap" | "satellite";
  onBaseLayerChange?: (key: "openstreetmap" | "satellite") => void;
  onBuildingsLoaded?: (buildings: Building[]) => void;
}

export default function CampusMap({
  selectedLocation,
  userLocation,
  onLocationSelect,
  baseLayerKey = "openstreetmap",
  onBaseLayerChange,
  onBuildingsLoaded,
}: CampusMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.TileLayer | null>(null);
  const geojsonLayersRef = useRef<{
    buildings: L.GeoJSON | null;
    roads: L.GeoJSON | null;
    boundary: L.GeoJSON | null;
  }>({
    buildings: null,
    roads: null,
    boundary: null,
  });

  const [visibleLayers, setVisibleLayers] = useState({
    buildings: true,
    roads: true,
    boundary: true,
  });

  const defaultCenter: [number, number] = [-0.3605, 37.0093];
  const defaultZoom = 16;

  // Fetch and parse GeoJSON
  const loadGeoJSON = async (url: string) => {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error(`Error loading GeoJSON from ${url}:`, error);
      return null;
    }
  };

  // Initialize map and load GeoJSON
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView(defaultCenter, defaultZoom);
    }

    // Add base layer
    if (layerRef.current) {
      mapRef.current.removeLayer(layerRef.current);
    }

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

    // Load buildings from GeoJSON
    loadGeoJSON("/points.geojson").then((data) => {
      if (data && mapRef.current) {
        if (geojsonLayersRef.current.buildings) {
          mapRef.current.removeLayer(geojsonLayersRef.current.buildings);
        }

        const buildingsGeoJSON = L.geoJSON(data, {
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 8,
              fillColor: "#2057d9",
              color: "#fff",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
            });
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            const popup = `
              <div class="p-2 text-sm">
                <h3 class="font-semibold text-foreground">${props.name}</h3>
                <p class="text-xs text-muted-foreground mt-1">${props.character}</p>
                <p class="text-xs text-muted-foreground mt-2">${props.descriptio}</p>
              </div>
            `;
            layer.bindPopup(popup);

            // Add click handler
            layer.on("click", () => {
              const coords = feature.geometry.coordinates as [number, number];
              onLocationSelect?.({
                id: feature.properties.character,
                name: props.name,
                coords: [coords[1], coords[0]],
                character: props.character,
                descriptio: props.descriptio,
              });
              layer.openPopup();
            });
          },
        });

        geojsonLayersRef.current.buildings = buildingsGeoJSON;
        if (visibleLayers.buildings) {
          buildingsGeoJSON.addTo(mapRef.current);
        }

        // Extract buildings data for search
        const buildings: Building[] = data.features.map(
          (feature: any, index: number) => {
            const coords = feature.geometry.coordinates as [number, number];
            return {
              id: `building-${index}`,
              name: feature.properties.name,
              coords: [coords[1], coords[0]],
              character: feature.properties.character,
              descriptio: feature.properties.descriptio,
            };
          },
        );
        onBuildingsLoaded?.(buildings);
      }
    });

    // Load roads from GeoJSON
    loadGeoJSON("/lines.geojson").then((data) => {
      if (data && mapRef.current) {
        if (geojsonLayersRef.current.roads) {
          mapRef.current.removeLayer(geojsonLayersRef.current.roads);
        }

        const roadsGeoJSON = L.geoJSON(data, {
          style: (feature) => {
            const type = feature?.properties?.type || "pedestrian_path";
            return {
              color: type === "road" ? "#ff8c1a" : "#3498db",
              weight: type === "road" ? 4 : 2,
              opacity: 0.8,
              dashArray: type === "pedestrian_path" ? "5, 5" : undefined,
            };
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            const popup = `
              <div class="p-2 text-sm">
                <h3 class="font-semibold text-foreground">${props.name}</h3>
                <p class="text-xs text-muted-foreground">${props.type === "road" ? "Road" : "Pedestrian Path"}</p>
              </div>
            `;
            layer.bindPopup(popup);
          },
        });

        geojsonLayersRef.current.roads = roadsGeoJSON;
        if (visibleLayers.roads) {
          roadsGeoJSON.addTo(mapRef.current);
        }
      }
    });

    // Load boundary from GeoJSON
    loadGeoJSON("/kimathi_boundary.geojson").then((data) => {
      if (data && mapRef.current) {
        if (geojsonLayersRef.current.boundary) {
          mapRef.current.removeLayer(geojsonLayersRef.current.boundary);
        }

        const boundaryGeoJSON = L.geoJSON(data, {
          style: {
            color: "#27ae60",
            weight: 3,
            opacity: 0.3,
            fillOpacity: 0.1,
            dashArray: "10, 5",
          },
        });

        geojsonLayersRef.current.boundary = boundaryGeoJSON;
        if (visibleLayers.boundary) {
          boundaryGeoJSON.addTo(mapRef.current);
        }

        // Fit map to boundary
        mapRef.current.fitBounds(boundaryGeoJSON.getBounds());
      }
    });
  }, [baseLayerKey]);

  // Handle layer visibility toggle
  useEffect(() => {
    if (!mapRef.current) return;

    if (visibleLayers.buildings && geojsonLayersRef.current.buildings) {
      mapRef.current.addLayer(geojsonLayersRef.current.buildings);
    } else if (geojsonLayersRef.current.buildings) {
      mapRef.current.removeLayer(geojsonLayersRef.current.buildings);
    }

    if (visibleLayers.roads && geojsonLayersRef.current.roads) {
      mapRef.current.addLayer(geojsonLayersRef.current.roads);
    } else if (geojsonLayersRef.current.roads) {
      mapRef.current.removeLayer(geojsonLayersRef.current.roads);
    }

    if (visibleLayers.boundary && geojsonLayersRef.current.boundary) {
      mapRef.current.addLayer(geojsonLayersRef.current.boundary);
    } else if (geojsonLayersRef.current.boundary) {
      mapRef.current.removeLayer(geojsonLayersRef.current.boundary);
    }
  }, [visibleLayers]);

  // Handle selected location
  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;

    mapRef.current.setView(selectedLocation.coords, 17);
  }, [selectedLocation]);

  // Expose layer visibility control
  useEffect(() => {
    (window as any).toggleMapLayer = (layer: "buildings" | "roads" | "boundary") => {
      setVisibleLayers((prev) => ({
        ...prev,
        [layer]: !prev[layer],
      }));
    };
  }, []);

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
