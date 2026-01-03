import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Satellite, Map as MapIcon, Crosshair, Layers } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  const [isSelectingDestinationOnMap, setIsSelectingDestinationOnMap] =
    useState(false);
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
  const [showComments, setShowComments] = useState(true);

  const handleOriginSelect = (location: Building | null) => {
    setOrigin(location);
    setIsSelectingOriginOnMap(false);
    if (location) {
      toast.success(`From: ${location.name}`);
      calculateAndShowRoute(location.coords, destination?.coords);
    }
  };

  const handleDestinationSelect = (location: Building | null) => {
    setDestination(location);
    setIsSelectingDestinationOnMap(false);
    if (location) {
      toast.success(`To: ${location.name}`);
      calculateAndShowRoute(origin?.coords, location.coords);
    }
  };

  const calculateAndShowRoute = (
    startCoords?: [number, number],
    endCoords?: [number, number],
  ) => {
    if (!startCoords || !endCoords) {
      console.log("Missing coordinates for route calculation", {
        startCoords,
        endCoords,
      });
      setRoute(null);
      setRoutePanel({ isOpen: false, distance: 0, estimatedTime: 0 });
      return;
    }

    console.log("Calculating route", {
      startCoords,
      endCoords,
      buildingsCount: buildings.length,
    });

    const calculatedRoute = calculateRoute(startCoords, endCoords, buildings);
    console.log("Route calculated:", {
      distance: calculatedRoute.distance,
      estimatedTime: calculatedRoute.estimatedTime,
      pathLength: calculatedRoute.routePath?.length,
    });

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
        buildings,
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
              buildings,
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      {/* Header with gradient background */}
      <div className="border-b-2 border-blue-200 shadow-md bg-gradient-to-r from-white via-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between gap-8">
            {/* Logo/Title */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-base">DK</span>
              </div>
              <div>
                <h1 className="font-black text-lg text-gray-900 tracking-tight">
                  DeKUT Navigator
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Campus Navigation
                </p>
              </div>
            </div>

            {/* Location Picker */}
            <div className="flex-1 max-w-2xl">
              <LocationPicker
                origin={origin}
                destination={destination}
                onOriginSelect={handleOriginSelect}
                onDestinationSelect={handleDestinationSelect}
                onOriginMapPick={() =>
                  setIsSelectingOriginOnMap(!isSelectingOriginOnMap)
                }
                onDestinationMapPick={() =>
                  setIsSelectingDestinationOnMap(!isSelectingDestinationOnMap)
                }
                buildings={buildings}
                isSelectingOriginOnMap={isSelectingOriginOnMap}
                isSelectingDestinationOnMap={isSelectingDestinationOnMap}
              />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-sm">DK</span>
              </div>
              <div>
                <h1 className="font-black text-base text-gray-900">
                  DeKUT Navigator
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Campus Navigation
                </p>
              </div>
            </div>

            {/* Mobile Location Picker */}
            <LocationPicker
              origin={origin}
              destination={destination}
              onOriginSelect={handleOriginSelect}
              onDestinationSelect={handleDestinationSelect}
              onOriginMapPick={() =>
                setIsSelectingOriginOnMap(!isSelectingOriginOnMap)
              }
              onDestinationMapPick={() =>
                setIsSelectingDestinationOnMap(!isSelectingDestinationOnMap)
              }
              buildings={buildings}
              isSelectingOriginOnMap={isSelectingOriginOnMap}
              isSelectingDestinationOnMap={isSelectingDestinationOnMap}
            />
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          cursor:
            isSelectingOriginOnMap || isSelectingDestinationOnMap
              ? "crosshair"
              : "default",
        }}
      >
        <CampusMap
          selectedLocation={
            destination && "coords" in destination
              ? {
                  id: parseInt(destination.id),
                  name: destination.name,
                  coords: destination.coords,
                }
              : undefined
          }
          userLocation={userLocation || undefined}
          onLocationSelect={handleMapClick}
          baseLayerKey={baseLayerKey}
          onBaseLayerChange={setBaseLayerKey}
          onBuildingsLoaded={setBuildings}
          route={route || undefined}
        />

        {/* Map Controls - Top Right */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 z-40">
          {/* Basemap Toggle */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden backdrop-blur-sm">
            <Button
              variant={baseLayerKey === "openstreetmap" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBaseLayerKey("openstreetmap")}
              className={`w-11 h-11 rounded-none flex items-center justify-center border-0 transition-all ${
                baseLayerKey === "openstreetmap"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              title="OpenStreetMap"
            >
              <MapIcon className="h-5 w-5" />
            </Button>
            <div className="w-full h-px bg-gray-200"></div>
            <Button
              variant={baseLayerKey === "satellite" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBaseLayerKey("satellite")}
              className={`w-11 h-11 rounded-none flex items-center justify-center border-0 transition-all ${
                baseLayerKey === "satellite"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              title="Satellite"
            >
              <Satellite className="h-5 w-5" />
            </Button>
          </div>

          {/* Geolocation Button */}
          <Button
            onClick={handleGeolocation}
            size="sm"
            className="w-11 h-11 rounded-xl shadow-lg p-0 flex items-center justify-center bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 transition-all"
            title="Get my location"
          >
            <Crosshair className="h-5 w-5" />
          </Button>

          {/* Layer Controls */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="sm"
                className="w-11 h-11 rounded-xl shadow-lg p-0 flex items-center justify-center bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 transition-all"
                title="Layer controls"
              >
                <Layers className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 bg-gradient-to-b from-white to-gray-50"
            >
              <div className="space-y-5 mt-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Map Layers
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Toggle layers to customize your view
                  </p>
                </div>

                {/* Buildings Layer Toggle */}
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-blue-300 hover:border-blue-400 transition-all cursor-pointer hover:shadow-md">
                  <input
                    type="checkbox"
                    id="buildings-toggle"
                    checked={visibleLayers.buildings}
                    onChange={() => toggleLayer("buildings")}
                    className="w-5 h-5 rounded accent-blue-600"
                  />
                  <label
                    htmlFor="buildings-toggle"
                    className="flex-1 cursor-pointer"
                  >
                    <span className="block text-sm font-bold text-gray-900">
                      Buildings
                    </span>
                    <span className="text-xs text-gray-500">
                      Campus structures
                    </span>
                  </label>
                </div>

                {/* Roads Layer Toggle */}
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-orange-300 hover:border-orange-400 transition-all cursor-pointer hover:shadow-md">
                  <input
                    type="checkbox"
                    id="roads-toggle"
                    checked={visibleLayers.roads}
                    onChange={() => toggleLayer("roads")}
                    className="w-5 h-5 rounded accent-orange-600"
                  />
                  <label
                    htmlFor="roads-toggle"
                    className="flex-1 cursor-pointer"
                  >
                    <span className="block text-sm font-bold text-gray-900">
                      Roads & Paths
                    </span>
                    <span className="text-xs text-gray-500">
                      Pedestrian and vehicle routes
                    </span>
                  </label>
                </div>

                {/* Boundary Layer Toggle */}
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-green-300 hover:border-green-400 transition-all cursor-pointer hover:shadow-md">
                  <input
                    type="checkbox"
                    id="boundary-toggle"
                    checked={visibleLayers.boundary}
                    onChange={() => toggleLayer("boundary")}
                    className="w-5 h-5 rounded accent-green-600"
                  />
                  <label
                    htmlFor="boundary-toggle"
                    className="flex-1 cursor-pointer"
                  >
                    <span className="block text-sm font-bold text-gray-900">
                      Campus Boundary
                    </span>
                    <span className="text-xs text-gray-500">
                      Campus perimeter
                    </span>
                  </label>
                </div>

                {/* Legend */}
                <div className="mt-7 space-y-4 border-t-2 border-gray-300 pt-5">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Map Legend
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-600 shadow-md"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Buildings
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-4 h-1 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Pedestrian Path
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-4 h-1 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Road
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-4 h-1 border-b-2 border-dashed border-green-600"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Campus Boundary
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-md"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Start Location
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-700 shadow-md"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Destination
                      </span>
                    </div>
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
            origin ? { name: origin.name, coords: origin.coords } : undefined
          }
          destinationLocation={
            destination
              ? { name: destination.name, coords: destination.coords }
              : undefined
          }
          distance={routePanel.distance}
          estimatedTime={routePanel.estimatedTime}
        />
      </div>
    </div>
  );
}
