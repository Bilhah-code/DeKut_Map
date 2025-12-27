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
  const routeLayerRef = useRef<L.FeatureGroup | null>(null);
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
              const coords = (feature.geometry as any).coordinates as [
                number,
                number,
              ];
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
    if (!mapRef.current) return;

    // Remove existing route layer group
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    // If no route, stop here
    if (!route || !route.path || route.path.length === 0) {
      console.log("No route or empty path", { route });
      return;
    }

    console.log("Rendering route with path:", {
      pathLength: route.path.length,
      start: route.start,
      end: route.end,
      path: route.path,
    });

    // Ensure path has at least 2 points
    const pathToRender = route.path && route.path.length >= 2
      ? route.path
      : [route.start, route.end];

    console.log("Path to render:", {
      length: pathToRender.length,
      points: pathToRender.slice(0, 3),
    });

    // Validate coordinates
    const validPath = pathToRender.filter(
      (point) =>
        Array.isArray(point) &&
        point.length === 2 &&
        typeof point[0] === "number" &&
        typeof point[1] === "number" &&
        !isNaN(point[0]) &&
        !isNaN(point[1])
    );

    if (validPath.length < 2) {
      console.error("Invalid path coordinates:", pathToRender);
      return;
    }

    console.log("Valid path for rendering:", validPath);

    // Create feature group to hold all route elements
    const routeGroup = L.featureGroup();

    // Create shadow/outline polyline for better visibility
    const shadowPolyline = L.polyline(validPath, {
      color: "#000000",
      weight: 10,
      opacity: 0.2,
      lineCap: "round",
      lineJoin: "round",
    });
    console.log("Shadow polyline created");
    routeGroup.addLayer(shadowPolyline);

    // Create main route polyline
    const routePolyline = L.polyline(validPath, {
      color: "#2563eb",
      weight: 5,
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round",
      dashArray: "0",
    });
    console.log("Route polyline created");
    routeGroup.addLayer(routePolyline);

    // Create pulsing animated polyline for visual emphasis
    const animatedPolyline = L.polyline(validPath, {
      color: "#60a5fa",
      weight: 3,
      opacity: 0.6,
      lineCap: "round",
      lineJoin: "round",
      dashArray: "10, 10",
    });
    console.log("Animated polyline created");
    routeGroup.addLayer(animatedPolyline);

    // Add direction arrows along the route
    const minPoints = Math.min(validPath.length, 20);
    for (let i = 0; i < minPoints - 1; i++) {
      const step = Math.floor((validPath.length - 1) / minPoints);
      const idx = i * step;
      if (idx >= validPath.length - 1) break;

      const point = validPath[idx];
      const nextPoint = validPath[Math.min(idx + 1, validPath.length - 1)];

      const lat1 = point[0];
      const lon1 = point[1];
      const lat2 = nextPoint[0];
      const lon2 = nextPoint[1];

      const dLat = lat2 - lat1;
      const dLon = lon2 - lon1;
      const angle = Math.atan2(dLon, dLat) * (180 / Math.PI);

      const arrow = L.marker(point, {
        icon: L.divIcon({
          html: `<div style="transform: rotate(${angle}deg); color: #2563eb;">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));">
                    <path d="M10 2L18 16H2L10 2Z" fill="currentColor"/>
                  </svg>
                </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          className: "route-arrow",
        }),
      });
      routeGroup.addLayer(arrow);
    }

    // Add start marker (green circle)
    const startMarker = L.circleMarker(route.start, {
      radius: 12,
      fillColor: "#10b981",
      color: "#fff",
      weight: 3,
      opacity: 1,
      fillOpacity: 1,
    });

    const startPopup = L.tooltip({
      permanent: true,
      direction: "top",
      offset: [0, -20],
    });
    startPopup.setContent(
      '<div class="text-xs font-bold bg-white text-green-700 px-2 py-1 rounded shadow-md whitespace-nowrap">START</div>',
    );
    startMarker.bindTooltip(startPopup);
    routeGroup.addLayer(startMarker);

    // Add end marker (blue circle)
    const endMarker = L.circleMarker(route.end, {
      radius: 14,
      fillColor: "#2563eb",
      color: "#fff",
      weight: 3,
      opacity: 1,
      fillOpacity: 1,
      zIndexOffset: 100,
    });

    const endPopup = L.tooltip({
      permanent: true,
      direction: "top",
      offset: [0, -25],
    });
    endPopup.setContent(
      '<div class="text-xs font-bold bg-white text-blue-700 px-2 py-1 rounded shadow-md whitespace-nowrap">DESTINATION</div>',
    );
    endMarker.bindTooltip(endPopup);
    routeGroup.addLayer(endMarker);

    // Add route group to map
    console.log("Adding route group to map with", routeGroup.getLayers().length, "layers");
    routeGroup.addTo(mapRef.current);
    routeLayerRef.current = routeGroup;

    // Fit map to show entire route with padding
    try {
      const bounds = routeGroup.getBounds();
      console.log("Route bounds valid:", bounds.isValid());
      if (bounds.isValid()) {
        console.log("Fitting bounds to route:", bounds);
        mapRef.current.fitBounds(bounds, {
          padding: [80, 80],
          maxZoom: 17,
        });
      } else {
        console.warn("Invalid bounds for route, centering on start");
        const midpoint: [number, number] = [
          (route.start[0] + route.end[0]) / 2,
          (route.start[1] + route.end[1]) / 2,
        ];
        mapRef.current.setView(midpoint, 15);
      }
    } catch (error) {
      console.error("Error fitting bounds:", error);
      mapRef.current.setView(route.start, 16);
    }
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
