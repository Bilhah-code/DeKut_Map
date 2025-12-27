import { useEffect, useRef, useState } from "react";
import L from "leaflet";

interface Building {
  id: string;
  name: string;
  coords: [number, number];
  character: string;
  descriptio: string;
}

interface Route {
  start: [number, number];
  end: [number, number];
  path: [number, number][];
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
  route?: Route;
}

export default function CampusMap({
  selectedLocation,
  userLocation,
  onLocationSelect,
  baseLayerKey = "openstreetmap",
  onBaseLayerChange,
  onBuildingsLoaded,
  route,
}: CampusMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.TileLayer | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
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
            const popupContent = `
              <div class="p-2 text-sm">
                <h3 class="font-semibold text-foreground">${props.name}</h3>
                <p class="text-xs text-muted-foreground mt-1">${props.character}</p>
                <p class="text-xs text-muted-foreground mt-2">${props.descriptio}</p>
              </div>
            `;
            layer.bindPopup(popupContent);

            // Add hover tooltip
            const tooltip = L.tooltip({
              permanent: false,
              direction: "top",
              offset: [0, -10],
              className: "building-tooltip",
            });

            tooltip.setContent(`
              <div class="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs whitespace-nowrap">
                <div class="font-semibold">${props.name}</div>
                <div class="text-slate-300">${props.character}</div>
              </div>
            `);

            layer.bindTooltip(tooltip);

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

  // Handle route visualization
  useEffect(() => {
    if (!mapRef.current || !route || !route.path) return;

    // Remove existing route layer
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
    }

    // Create route polyline with thicker solid line to show direction
    const routePolyline = L.polyline(route.path, {
      color: "#3b82f6",
      weight: 6,
      opacity: 0.85,
      lineCap: "round",
      lineJoin: "round",
      className: "route-polyline",
    });

    // Add direction arrows along the route
    const arrowGroup = L.featureGroup();
    const pathSegments = 5; // Number of arrows to display
    const segmentLength = Math.floor(route.path.length / (pathSegments + 1));

    for (let i = 1; i <= pathSegments && i * segmentLength < route.path.length; i++) {
      const index = i * segmentLength;
      const point = route.path[index];
      const nextPoint = route.path[Math.min(index + 1, route.path.length - 1)];

      // Calculate angle for arrow rotation
      const lat1 = point[0];
      const lon1 = point[1];
      const lat2 = nextPoint[0];
      const lon2 = nextPoint[1];

      const dLat = lat2 - lat1;
      const dLon = lon2 - lon1;
      const angle = Math.atan2(dLon, dLat) * (180 / Math.PI);

      // Create arrow marker
      const arrow = L.marker(point, {
        icon: L.divIcon({
          html: `<div style="transform: rotate(${angle}deg); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 12px solid #3b82f6;"></div>`,
          iconSize: [12, 12],
          className: "route-direction-arrow",
        }),
      });

      arrowGroup.addLayer(arrow);
    }

    // Add start marker
    const startMarker = L.circleMarker(route.start, {
      radius: 10,
      fillColor: "#10b981",
      color: "#fff",
      weight: 3,
      opacity: 1,
      fillOpacity: 0.9,
    });

    // Add label for start
    const startLabel = L.tooltip({
      permanent: true,
      direction: "top",
      offset: [0, -15],
      className: "route-label",
    });
    startLabel.setContent("<div class=\"text-xs font-semibold text-green-700 bg-white px-2 py-1 rounded shadow\">Start</div>");
    startMarker.bindTooltip(startLabel);

    // Add end marker
    const endMarker = L.circleMarker(route.end, {
      radius: 12,
      fillColor: "#3b82f6",
      color: "#fff",
      weight: 3,
      opacity: 1,
      fillOpacity: 0.9,
    });

    // Add label for end
    const endLabel = L.tooltip({
      permanent: true,
      direction: "top",
      offset: [0, -15],
      className: "route-label",
    });
    endLabel.setContent("<div class=\"text-xs font-semibold text-blue-700 bg-white px-2 py-1 rounded shadow\">Destination</div>");
    endMarker.bindTooltip(endLabel);

    // Create a feature group with route elements
    const routeGroup = L.featureGroup([routePolyline, arrowGroup, startMarker, endMarker]);
    routeLayerRef.current = routePolyline;

    // Add to map
    routeGroup.addTo(mapRef.current);

    // Fit bounds to show entire route
    mapRef.current.fitBounds(routeGroup.getBounds(), { padding: [100, 100] });
  }, [route]);

  // Expose layer visibility control
  useEffect(() => {
    (window as any).toggleMapLayer = (
      layer: "buildings" | "roads" | "boundary",
    ) => {
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
