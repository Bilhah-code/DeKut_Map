import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Satellite, Map as MapIcon, Crosshair, Layers } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MapToolbar from "@/components/MapToolbar";
import CampusMap from "@/components/CampusMap";
import RoutePanel from "@/components/RoutePanel";
import LocationPicker from "@/components/LocationPicker";
import { calculateRoute } from "@/services/routingService";
import { toast } from "sonner";

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

interface Route {
  start: [number, number];
  end: [number, number];
  path: [number, number][];
}

export default function Navigator() {
  const [origin, setOrigin] = useState<Building | null>(null);
  const [destination, setDestination] = useState<Building | null>(null);
  const [isSelectingOriginOnMap, setIsSelectingOriginOnMap] = useState(false);
  const [isSelectingDestinationOnMap, setIsSelectingDestinationOnMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<
    Building | Location | null
  >(null);
  const [userLocation, setUserLocation] = useState<{
    coords: [number, number];
    accuracy: number;
  } | null>(null);
  const [baseLayerKey, setBaseLayerKey] = useState<
    "openstreetmap" | "satellite"
  >("openstreetmap");
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [visibleLayers, setVisibleLayers] = useState({
    buildings: true,
    roads: true,
    boundary: true,
  });
  const [route, setRoute] = useState<Route | null>(null);
  const [routePanel, setRoutePanel] = useState({
    isOpen: false,
    distance: 0,
    estimatedTime: 0,
  });

  const handleOriginSelect = (location: Building | null) => {
    setOrigin(location);
    setIsSelectingOriginOnMap(false);
    if (location) {
      toast.success(`Starting point: ${location.name}`);
      calculateAndShowRoute(location.coords, destination?.coords);
    }
  };

  const handleDestinationSelect = (location: Building | null) => {
    setDestination(location);
    setIsSelectingDestinationOnMap(false);
    if (location) {
      toast.success(`Destination: ${location.name}`);
      calculateAndShowRoute(origin?.coords, location.coords);
    }
  };

  const calculateAndShowRoute = (startCoords?: [number, number], endCoords?: [number, number]) => {
    if (!startCoords || !endCoords) {
      setRoute(null);
      setRoutePanel({ isOpen: false, distance: 0, estimatedTime: 0 });
      return;
    }

    const calculatedRoute = calculateRoute(startCoords, endCoords);
    setRoute({
      start: startCoords,
      end: endCoords,
      path: calculatedRoute.routePath || [startCoords, endCoords],
    });
    setRoutePanel({
      isOpen: true,
      distance: calculatedRoute.distance,
      estimatedTime: calculatedRoute.estimatedTime,
    });
  };

  const handleMapClick = (location: Building) => {
    if (isSelectingOriginOnMap) {
      handleOriginSelect(location);
    } else if (isSelectingDestinationOnMap) {
      handleDestinationSelect(location);
    }
  };

  const handleLocationSelect = (location: Building) => {
    setSelectedLocation(location);

    // If user location exists, calculate route
    if (userLocation) {
      const calculatedRoute = calculateRoute(
        userLocation.coords,
        location.coords,
      );
      setRoute({
        start: userLocation.coords,
        end: location.coords,
        path: calculatedRoute.routePath || [
          userLocation.coords,
          location.coords,
        ],
      });
      setRoutePanel({
        isOpen: true,
        distance: calculatedRoute.distance,
        estimatedTime: calculatedRoute.estimatedTime,
      });
    }
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const newLocation = {
            coords: [latitude, longitude] as [number, number],
            accuracy: accuracy,
          };
          setUserLocation(newLocation);

          // Recalculate route if destination is selected
          if (selectedLocation && "coords" in selectedLocation) {
            const calculatedRoute = calculateRoute(
              newLocation.coords,
              selectedLocation.coords,
            );
            setRoute({
              start: newLocation.coords,
              end: selectedLocation.coords,
              path: calculatedRoute.routePath || [
                newLocation.coords,
                selectedLocation.coords,
              ],
            });
            setRoutePanel({
              isOpen: true,
              distance: calculatedRoute.distance,
              estimatedTime: calculatedRoute.estimatedTime,
            });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
      );
    }
  };

  const toggleLayer = (layer: "buildings" | "roads" | "boundary") => {
    setVisibleLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
    (window as any).toggleMapLayer?.(layer);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Toolbar */}
      <MapToolbar
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        buildings={buildings}
      />

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        <CampusMap
          selectedLocation={
            selectedLocation && "coords" in selectedLocation
              ? {
                  id: selectedLocation.id as number,
                  name: selectedLocation.name,
                  coords: selectedLocation.coords,
                }
              : undefined
          }
          userLocation={userLocation || undefined}
          onLocationSelect={handleLocationSelect}
          baseLayerKey={baseLayerKey}
          onBaseLayerChange={setBaseLayerKey}
          onBuildingsLoaded={setBuildings}
          route={route || undefined}
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

          {/* Layer Controls */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="sm"
                className="w-12 h-12 rounded-lg shadow-md p-0 flex items-center justify-center"
                title="Layer Controls"
              >
                <Layers className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Map Layers</h2>

                {/* Buildings Layer Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={visibleLayers.buildings}
                      onChange={() => toggleLayer("buildings")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Buildings</span>
                  </label>
                </div>

                {/* Roads Layer Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={visibleLayers.roads}
                      onChange={() => toggleLayer("roads")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Roads & Paths</span>
                  </label>
                </div>

                {/* Boundary Layer Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={visibleLayers.boundary}
                      onChange={() => toggleLayer("boundary")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Campus Boundary</span>
                  </label>
                </div>

                {/* Legend */}
                <div className="mt-6 space-y-3 border-t border-border pt-4">
                  <h3 className="text-sm font-medium">Legend</h3>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span>Buildings</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex gap-1">
                      <div className="w-3 h-0.5 bg-blue-500"></div>
                    </div>
                    <span>Pedestrian Path</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-0.5 bg-orange-500"></div>
                    <span>Road</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-0.5 border-b-2 border-dashed border-green-600"></div>
                    <span>Campus Boundary</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Route Panel */}
        <RoutePanel
          isOpen={routePanel.isOpen}
          onClose={() =>
            setRoutePanel({ isOpen: false, distance: 0, estimatedTime: 0 })
          }
          startLocation={
            userLocation
              ? { name: "Your Location", coords: userLocation.coords }
              : undefined
          }
          destinationLocation={
            selectedLocation && "coords" in selectedLocation
              ? { name: selectedLocation.name, coords: selectedLocation.coords }
              : undefined
          }
          distance={routePanel.distance}
          estimatedTime={routePanel.estimatedTime}
        />
      </div>
    </div>
  );
}
