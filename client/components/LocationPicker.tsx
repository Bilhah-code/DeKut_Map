import { useState, useMemo, useRef } from "react";
import {
  X,
  ArrowRightLeft,
  ChevronRight,
  MapPin,
  Locate,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Origin Input */}
        <div className="relative z-30">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MapPin className="h-5 w-5 text-gray-400" />
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
              className="pl-10 pr-10 py-3 text-sm font-medium border border-gray-200 hover:border-gray-300 focus:border-gray-400 focus:outline-none rounded-lg"
            />
            {origin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onOriginSelect(null);
                  setOriginSearchQuery("");
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            )}
          </div>

          {/* Origin Results Dropdown */}
          {isOriginFocused &&
            originSearchQuery &&
            filteredOriginResults.length > 0 && (
              <div
                ref={originDropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-80 overflow-y-auto"
              >
                {filteredOriginResults.slice(0, 6).map((building, index) => (
                  <button
                    key={building.id}
                    onClick={() => handleSelectOrigin(building)}
                    onMouseEnter={() => setOriginSelectedIndex(index)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                      index === originSelectedIndex ? "bg-gray-50" : ""
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
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-50 p-4">
                <p className="text-sm text-gray-500 text-center">
                  No locations found
                </p>
              </div>
            )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapLocations}
            className="h-9 w-9 p-0 rounded-full border border-gray-300 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-40"
            disabled={!origin || !destination}
            title="Swap locations"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Destination Input */}
        <div className="relative z-20">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MapPin className="h-5 w-5 text-gray-400" />
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
              className="pl-10 pr-10 py-3 text-sm font-medium border border-gray-200 hover:border-gray-300 focus:border-gray-400 focus:outline-none rounded-lg"
            />
            {destination && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onDestinationSelect(null);
                  setDestinationSearchQuery("");
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            )}
          </div>

          {/* Destination Results Dropdown */}
          {isDestinationFocused &&
            destinationSearchQuery &&
            filteredDestinationResults.length > 0 && (
              <div
                ref={destinationDropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-80 overflow-y-auto"
              >
                {filteredDestinationResults.slice(0, 6).map((building, index) => (
                  <button
                    key={building.id}
                    onClick={() => handleSelectDestination(building)}
                    onMouseEnter={() => setDestinationSelectedIndex(index)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                      index === destinationSelectedIndex ? "bg-gray-50" : ""
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
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-50 p-4">
                <p className="text-sm text-gray-500 text-center">
                  No locations found
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
