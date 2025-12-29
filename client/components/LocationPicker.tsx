import { useState, useMemo, useRef } from "react";
import { X, ArrowRightLeft, ChevronRight, MapPin, Locate, Route as RouteIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RouteDetailsCard from "@/components/RouteDetailsCard";

interface Building {
  id: string;
  name: string;
  coords: [number, number];
  character: string;
  descriptio: string;
}

interface LocationPickerProps {
  origin?: Building | null;
  destination?: Building | null;
  onOriginSelect: (location: Building | null) => void;
  onDestinationSelect: (location: Building | null) => void;
  onOriginMapPick?: () => void;
  onDestinationMapPick?: () => void;
  buildings?: Building[];
  isSelectingOriginOnMap?: boolean;
  isSelectingDestinationOnMap?: boolean;
}

export default function LocationPicker({
  origin,
  destination,
  onOriginSelect,
  onDestinationSelect,
  onOriginMapPick,
  onDestinationMapPick,
  buildings = [],
  isSelectingOriginOnMap = false,
  isSelectingDestinationOnMap = false,
}: LocationPickerProps) {
  const [originSearchQuery, setOriginSearchQuery] = useState("");
  const [destinationSearchQuery, setDestinationSearchQuery] = useState("");
  const [originSelectedIndex, setOriginSelectedIndex] = useState(0);
  const [destinationSelectedIndex, setDestinationSelectedIndex] = useState(0);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const [isOriginFocused, setIsOriginFocused] = useState(false);
  const [isDestinationFocused, setIsDestinationFocused] = useState(false);
  const originDropdownRef = useRef<HTMLDivElement>(null);
  const destinationDropdownRef = useRef<HTMLDivElement>(null);

  // Filter origin locations
  const filteredOriginResults = useMemo(() => {
    if (!originSearchQuery.trim()) {
      return buildings
        .slice()
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    const query = originSearchQuery.toLowerCase();
    return buildings
      .filter(
        (building) =>
          building.name?.toLowerCase().includes(query) ||
          building.character?.toLowerCase().includes(query) ||
          building.descriptio?.toLowerCase().includes(query),
      )
      .sort((a, b) => {
        const aNameMatch = (a.name?.toLowerCase() || "").indexOf(query);
        const bNameMatch = (b.name?.toLowerCase() || "").indexOf(query);
        if (aNameMatch !== bNameMatch) return aNameMatch - bNameMatch;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [originSearchQuery, buildings]);

  // Filter destination locations
  const filteredDestinationResults = useMemo(() => {
    if (!destinationSearchQuery.trim()) {
      return buildings
        .slice()
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    const query = destinationSearchQuery.toLowerCase();
    return buildings
      .filter(
        (building) =>
          building.name?.toLowerCase().includes(query) ||
          building.character?.toLowerCase().includes(query) ||
          building.descriptio?.toLowerCase().includes(query),
      )
      .sort((a, b) => {
        const aNameMatch = (a.name?.toLowerCase() || "").indexOf(query);
        const bNameMatch = (b.name?.toLowerCase() || "").indexOf(query);
        if (aNameMatch !== bNameMatch) return aNameMatch - bNameMatch;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [destinationSearchQuery, buildings]);

  const handleSelectOrigin = (location: Building) => {
    onOriginSelect(location);
    setOriginSearchQuery("");
    setOriginSelectedIndex(-1);
    setIsOriginFocused(false);
  };

  const handleSelectDestination = (location: Building) => {
    onDestinationSelect(location);
    setDestinationSearchQuery("");
    setDestinationSelectedIndex(-1);
    setIsDestinationFocused(false);
  };

  const handleOriginKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOriginSelectedIndex((prev) =>
        prev < filteredOriginResults.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOriginSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && originSelectedIndex >= 0) {
      e.preventDefault();
      handleSelectOrigin(filteredOriginResults[originSelectedIndex]);
    } else if (e.key === "Escape") {
      setIsOriginFocused(false);
    }
  };

  const handleDestinationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setDestinationSelectedIndex((prev) =>
        prev < filteredDestinationResults.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setDestinationSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && destinationSelectedIndex >= 0) {
      e.preventDefault();
      handleSelectDestination(
        filteredDestinationResults[destinationSelectedIndex],
      );
    } else if (e.key === "Escape") {
      setIsDestinationFocused(false);
    }
  };

  const handleSwapLocations = () => {
    const temp = origin;
    if (origin) onDestinationSelect(origin);
    else onDestinationSelect(null);

    if (destination) onOriginSelect(destination);
    else onOriginSelect(null);
  };

  const handleOriginInputBlur = () => {
    setTimeout(() => {
      setIsOriginFocused(false);
    }, 100);
  };

  const handleDestinationInputBlur = () => {
    setTimeout(() => {
      setIsDestinationFocused(false);
    }, 100);
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-5 space-y-4">
        {/* Origin Input */}
        <div className="relative z-30">
          <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">
            Starting location
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" />
            </div>
            <Input
              ref={originInputRef}
              placeholder={origin ? origin.name : "Where from?"}
              value={originSearchQuery || origin?.name || ""}
              onChange={(e) => {
                setOriginSearchQuery(e.target.value);
                setOriginSelectedIndex(0);
              }}
              onKeyDown={handleOriginKeyDown}
              onFocus={() => {
                setIsOriginFocused(true);
              }}
              onBlur={handleOriginInputBlur}
              className="pl-12 pr-12 py-3.5 text-sm font-medium border-2 border-gray-200 hover:border-green-300 focus:border-green-500 focus:outline-none rounded-xl bg-white transition-all duration-200"
            />
            {origin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onOriginSelect(null);
                  setOriginSearchQuery("");
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
              </Button>
            )}
            {!origin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOriginMapPick}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-lg transition-all ${
                  isSelectingOriginOnMap
                    ? "bg-green-100 text-green-600"
                    : "hover:bg-green-100 text-gray-600 hover:text-green-600"
                }`}
                title="Pick on map"
              >
                <Locate className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Origin Results Dropdown */}
          {isOriginFocused &&
            originSearchQuery &&
            filteredOriginResults.length > 0 && (
              <div
                ref={originDropdownRef}
                className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl border border-gray-200 shadow-xl z-50 max-h-80 overflow-y-auto backdrop-blur-sm"
              >
                {filteredOriginResults.slice(0, 6).map((building, index) => (
                  <button
                    key={building.id}
                    onClick={() => handleSelectOrigin(building)}
                    onMouseEnter={() => setOriginSelectedIndex(index)}
                    className={`w-full text-left px-5 py-3 border-b border-gray-100 last:border-b-0 transition-all duration-150 ${
                      index === originSelectedIndex
                        ? "bg-green-50 border-l-4 border-l-green-500"
                        : "hover:bg-green-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 mb-1 truncate">
                          {building.name || "Unnamed Building"}
                        </div>
                        {building.character && (
                          <div className="text-xs text-gray-500">
                            {building.character}
                          </div>
                        )}
                      </div>
                      {index === originSelectedIndex && (
                        <ChevronRight className="h-4 w-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

          {/* No Results Message - Origin */}
          {isOriginFocused &&
            originSearchQuery &&
            filteredOriginResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl border border-gray-200 shadow-xl z-50 p-4">
                <p className="text-sm text-gray-500 text-center">
                  No locations found
                </p>
              </div>
            )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapLocations}
            className="h-10 w-10 p-0 rounded-full border-2 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 bg-white"
            disabled={!origin || !destination}
            title="Swap locations"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Destination Input */}
        <div className="relative z-20">
          <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">
            Destination
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm" />
            </div>
            <Input
              ref={destinationInputRef}
              placeholder={destination ? destination.name : "Where to?"}
              value={destinationSearchQuery || destination?.name || ""}
              onChange={(e) => {
                setDestinationSearchQuery(e.target.value);
                setDestinationSelectedIndex(0);
              }}
              onKeyDown={handleDestinationKeyDown}
              onFocus={() => {
                setIsDestinationFocused(true);
              }}
              onBlur={handleDestinationInputBlur}
              className="pl-12 pr-12 py-3.5 text-sm font-medium border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded-xl bg-white transition-all duration-200"
            />
            {destination && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onDestinationSelect(null);
                  setDestinationSearchQuery("");
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
              </Button>
            )}
            {!destination && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDestinationMapPick}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-lg transition-all ${
                  isSelectingDestinationOnMap
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-blue-100 text-gray-600 hover:text-blue-600"
                }`}
                title="Pick on map"
              >
                <Locate className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Destination Results Dropdown */}
          {isDestinationFocused &&
            destinationSearchQuery &&
            filteredDestinationResults.length > 0 && (
              <div
                ref={destinationDropdownRef}
                className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl border border-gray-200 shadow-xl z-50 max-h-80 overflow-y-auto backdrop-blur-sm"
              >
                {filteredDestinationResults
                  .slice(0, 6)
                  .map((building, index) => (
                    <button
                      key={building.id}
                      onClick={() => handleSelectDestination(building)}
                      onMouseEnter={() => setDestinationSelectedIndex(index)}
                      className={`w-full text-left px-5 py-3 border-b border-gray-100 last:border-b-0 transition-all duration-150 ${
                        index === destinationSelectedIndex
                          ? "bg-blue-50 border-l-4 border-l-blue-600"
                          : "hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-900 mb-1 truncate">
                            {building.name || "Unnamed Building"}
                          </div>
                          {building.character && (
                            <div className="text-xs text-gray-500">
                              {building.character}
                            </div>
                          )}
                        </div>
                        {index === destinationSelectedIndex && (
                          <ChevronRight className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            )}

          {/* No Results Message - Destination */}
          {isDestinationFocused &&
            destinationSearchQuery &&
            filteredDestinationResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl border border-gray-200 shadow-xl z-50 p-4">
                <p className="text-sm text-gray-500 text-center">
                  No locations found
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Route Details Card - Shows when both locations are selected */}
      {origin && destination && (
        <div className="mt-5">
          <RouteDetailsCard
            startLocation={{
              name: origin.name,
              coords: origin.coords,
            }}
            destinationLocation={{
              name: destination.name,
              coords: destination.coords,
            }}
            className=""
          />
        </div>
      )}
    </div>
  );
}
