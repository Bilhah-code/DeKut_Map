import { useState, useRef } from "react";
import { Layers, Sheet, SheetContent, SheetTrigger } from "lucide-react";
import CampusMap from "@/components/CampusMap";
import RoutePanel from "@/components/RoutePanel";
import InformationPanel from "@/components/InformationPanel";
import BottomSearchSheet from "@/components/BottomSearchSheet";
import FloatingActionButtons from "@/components/FloatingActionButtons";
import ModernHeader from "@/components/ModernHeader";
import { Button } from "@/components/ui/button";
import { Sheet as SheetComponent, SheetContent as SheetContentComponent, SheetTrigger as SheetTriggerComponent } from "@/components/ui/sheet";
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
  const [selectedLocation, setSelectedLocation] = useState<Building | Location | null>(null);
  const [userLocation, setUserLocation] = useState<{
    coords: [number, number];
    accuracy: number;
  } | null>(null);
  const [baseLayerKey, setBaseLayerKey] = useState<"openstreetmap" | "satellite">("openstreetmap");
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
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);

  const handleOriginSelect = (location: Building | null) => {
    setOrigin(location);
    if (location) {
      toast.success(`From: ${location.name}`);
      calculateAndShowRoute(location.coords, destination?.coords);
    }
  };

  const handleDestinationSelect = (location: Building | null) => {
    setDestination(location);
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
      setRoute(null);
      setRoutePanel({ isOpen: false, distance: 0, estimatedTime: 0 });
      return;
    }

    const calculatedRoute = calculateRoute(startCoords, endCoords, buildings);

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
    setSelectedLocation(location);
    setIsInfoPanelOpen(true);
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
          toast.success("Location acquired");
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Failed to get location");
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

  const handleZoomIn = () => {
    (window as any).mapZoomIn?.();
  };

  const handleZoomOut = () => {
    (window as any).mapZoomOut?.();
  };

  const handleResetView = () => {
    (window as any).mapResetView?.();
  };

  const handleFullscreen = () => {
    const mapContainer =
      document.querySelector(".leaflet-container")?.parentElement
        ?.parentElement;
    if (mapContainer?.requestFullscreen) {
      mapContainer.requestFullscreen().catch(() => {
        toast.error("Fullscreen not available");
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Modern Header */}
      <ModernHeader
        origin={origin}
        destination={destination}
        distance={routePanel.distance}
        estimatedTime={routePanel.estimatedTime}
        onSearchClick={() => setIsSearchSheetOpen(true)}
      />

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden mt-32">
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

        {/* Map Controls - Top Left (Zoom, Home, Fullscreen) */}
        <div className="absolute top-6 left-6 flex flex-col gap-3 z-40">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden backdrop-blur-sm">
            <Button
              onClick={handleZoomIn}
              size="sm"
              className="w-11 h-11 rounded-none flex items-center justify-center border-0 transition-all bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-200"
              title="Zoom in"
            >
              +
            </Button>
            <Button
              onClick={handleZoomOut}
              size="sm"
              className="w-11 h-11 rounded-none flex items-center justify-center border-0 transition-all bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-200"
              title="Zoom out"
            >
              −
            </Button>
            <Button
              onClick={handleResetView}
              size="sm"
              className="w-11 h-11 rounded-none flex items-center justify-center border-0 transition-all bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              title="Reset view"
            >
              🏠
            </Button>
          </div>

          {/* Layers Control */}
          <SheetComponent>
            <SheetTriggerComponent asChild>
              <Button
                size="sm"
                className="w-11 h-11 rounded-2xl shadow-lg p-0 flex items-center justify-center bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 transition-all"
                title="Layer controls"
              >
                <Layers className="h-5 w-5" />
              </Button>
            </SheetTriggerComponent>
            <SheetContentComponent side="left" className="w-80 bg-gradient-to-b from-white to-gray-50">
              <div className="space-y-5 mt-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Map Layers</h2>
                  <p className="text-xs text-gray-500 mt-2">
                    Toggle layers to customize your view
                  </p>
                </div>

                {/* Buildings Layer Toggle */}
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-blue-300 hover:border-blue-400 transition-all cursor-pointer hover:shadow-md">
                  <input
                    type="checkbox"
                    id="buildings-toggle"
                    checked={visibleLayers.buildings}
                    onChange={() => toggleLayer("buildings")}
                    className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
                  />
                  <label htmlFor="buildings-toggle" className="flex-1 cursor-pointer">
                    <span className="block text-sm font-bold text-gray-900">
                      Buildings
                    </span>
                    <span className="text-xs text-gray-500">
                      Campus structures
                    </span>
                  </label>
                </div>

                {/* Roads Layer Toggle */}
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-orange-300 hover:border-orange-400 transition-all cursor-pointer hover:shadow-md">
                  <input
                    type="checkbox"
                    id="roads-toggle"
                    checked={visibleLayers.roads}
                    onChange={() => toggleLayer("roads")}
                    className="w-5 h-5 rounded accent-orange-600 cursor-pointer"
                  />
                  <label htmlFor="roads-toggle" className="flex-1 cursor-pointer">
                    <span className="block text-sm font-bold text-gray-900">
                      Roads & Paths
                    </span>
                    <span className="text-xs text-gray-500">
                      Pedestrian and vehicle routes
                    </span>
                  </label>
                </div>

                {/* Boundary Layer Toggle */}
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-green-300 hover:border-green-400 transition-all cursor-pointer hover:shadow-md">
                  <input
                    type="checkbox"
                    id="boundary-toggle"
                    checked={visibleLayers.boundary}
                    onChange={() => toggleLayer("boundary")}
                    className="w-5 h-5 rounded accent-green-600 cursor-pointer"
                  />
                  <label htmlFor="boundary-toggle" className="flex-1 cursor-pointer">
                    <span className="block text-sm font-bold text-gray-900">
                      Campus Boundary
                    </span>
                    <span className="text-xs text-gray-500">
                      Campus perimeter
                    </span>
                  </label>
                </div>

                {/* Legend */}
                <div className="mt-8 space-y-4 border-t-2 border-gray-300 pt-6">
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
                  </div>
                </div>
              </div>
            </SheetContentComponent>
          </SheetComponent>
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

        {/* Information Panel */}
        <InformationPanel
          isOpen={isInfoPanelOpen}
          onClose={() => setIsInfoPanelOpen(false)}
          selectedLocation={
            selectedLocation && "coords" in selectedLocation
              ? selectedLocation
              : undefined
          }
          distance={routePanel.distance}
          estimatedTime={routePanel.estimatedTime}
          userLocation={userLocation}
        />

        {/* Floating Action Buttons */}
        <FloatingActionButtons
          onSearchClick={() => setIsSearchSheetOpen(true)}
          onNavigateClick={handleGeolocation}
          onLayersClick={() => {}}
          onBaseLayerChange={setBaseLayerKey}
          baseLayerKey={baseLayerKey}
        />
      </div>

      {/* Bottom Search Sheet */}
      <BottomSearchSheet
        isOpen={isSearchSheetOpen}
        onClose={() => setIsSearchSheetOpen(false)}
        onOriginSelect={handleOriginSelect}
        onDestinationSelect={handleDestinationSelect}
        buildings={buildings}
        origin={origin}
        destination={destination}
        isSelectingOrigin={!destination}
        isSelectingDestination={!!origin}
      />
    </div>
  );
}
