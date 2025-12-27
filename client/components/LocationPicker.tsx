import { useState, useMemo, useRef } from "react";
import {
  Search,
  X,
  MapPin,
  ArrowDown,
  ChevronRight,
  Navigation2,
  Map,
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
    <div className="bg-white rounded-2xl shadow-xl border border-border/40 overflow-hidden backdrop-blur-sm bg-white/95">
      <div className="p-5 space-y-4">
        {/* Origin Input */}
        <div className="relative z-30">
          <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Starting Point
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
            <Input
              ref={originInputRef}
              placeholder={origin ? origin.name : "Enter starting location..."}
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
              className={`pl-8 pr-20 py-3 h-auto text-sm font-medium border-2 transition-all duration-200 rounded-xl ${
                isSelectingOriginOnMap
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-0.5">
              {origin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onOriginSelect(null);
                    setOriginSearchQuery("");
                    setOriginSelectedIndex(0);
                  }}
                  className="h-7 w-7 p-0 hover:bg-muted rounded-lg"
                  title="Clear origin"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onOriginMapPick}
                className={`h-7 w-7 p-0 rounded-lg transition-colors ${
                  isSelectingOriginOnMap
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                title="Pick on map"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Origin Results Dropdown */}
          {isOriginFocused &&
            originSearchQuery &&
            filteredOriginResults.length > 0 && (
              <div
                ref={originDropdownRef}
                className="absolute top-[calc(100%+0.75rem)] left-0 right-0 bg-white rounded-xl border border-border/50 shadow-2xl z-50 max-h-96 overflow-hidden overflow-y-auto backdrop-blur-sm bg-white/97"
              >
                <div className="divide-y divide-border/30">
                  {filteredOriginResults.slice(0, 8).map((building, index) => (
                    <button
                      key={building.id}
                      onClick={() => handleSelectOrigin(building)}
                      onMouseEnter={() => setOriginSelectedIndex(index)}
                      className={`w-full text-left px-4 py-3.5 transition-all duration-150 ${
                        index === originSelectedIndex
                          ? "bg-gradient-to-r from-primary/12 to-transparent border-l-3 border-l-emerald-500"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground flex items-center gap-2 mb-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                            <span className="truncate">
                              {building.name || "Unnamed Building"}
                            </span>
                          </div>
                          {building.character && (
                            <div className="text-xs text-muted-foreground ml-4">
                              Code: <span className="font-medium text-foreground">{building.character}</span>
                            </div>
                          )}
                          {building.descriptio && (
                            <div className="text-xs text-muted-foreground line-clamp-1 ml-4 mt-1">
                              {building.descriptio}
                            </div>
                          )}
                        </div>
                        {index === originSelectedIndex && (
                          <ChevronRight className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* No Results Message - Origin */}
          {isOriginFocused &&
            originSearchQuery &&
            filteredOriginResults.length === 0 && (
              <div className="absolute top-[calc(100%+0.75rem)] left-0 right-0 bg-white rounded-xl border border-border/50 shadow-lg z-50 p-6">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="p-3 bg-muted rounded-full">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center font-medium">
                    No locations match "{originSearchQuery}"
                  </p>
                </div>
              </div>
            )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapLocations}
            className="h-9 w-9 p-0 rounded-full border-2 border-border hover:bg-muted transition-all duration-200 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!origin || !destination}
            title="Swap origin and destination"
          >
            <ArrowDown className="h-4 w-4 rotate-90" />
          </Button>
        </div>

        {/* Destination Input */}
        <div className="relative z-20">
          <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Destination
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <Input
              ref={destinationInputRef}
              placeholder={destination ? destination.name : "Enter destination..."}
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
              className={`pl-8 pr-20 py-3 h-auto text-sm font-medium border-2 transition-all duration-200 rounded-xl ${
                isSelectingDestinationOnMap
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-0.5">
              {destination && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onDestinationSelect(null);
                    setDestinationSearchQuery("");
                    setDestinationSelectedIndex(0);
                  }}
                  className="h-7 w-7 p-0 hover:bg-muted rounded-lg"
                  title="Clear destination"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onDestinationMapPick}
                className={`h-7 w-7 p-0 rounded-lg transition-colors ${
                  isSelectingDestinationOnMap
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                title="Pick on map"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Destination Results Dropdown */}
          {isDestinationFocused &&
            destinationSearchQuery &&
            filteredDestinationResults.length > 0 && (
              <div
                ref={destinationDropdownRef}
                className="absolute top-[calc(100%+0.75rem)] left-0 right-0 bg-white rounded-xl border border-border/50 shadow-2xl z-50 max-h-96 overflow-hidden overflow-y-auto backdrop-blur-sm bg-white/97"
              >
                <div className="divide-y divide-border/30">
                  {filteredDestinationResults.slice(0, 8).map((building, index) => (
                    <button
                      key={building.id}
                      onClick={() => handleSelectDestination(building)}
                      onMouseEnter={() => setDestinationSelectedIndex(index)}
                      className={`w-full text-left px-4 py-3.5 transition-all duration-150 ${
                        index === destinationSelectedIndex
                          ? "bg-gradient-to-r from-primary/12 to-transparent border-l-3 border-l-blue-500"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground flex items-center gap-2 mb-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                            <span className="truncate">
                              {building.name || "Unnamed Building"}
                            </span>
                          </div>
                          {building.character && (
                            <div className="text-xs text-muted-foreground ml-4">
                              Code: <span className="font-medium text-foreground">{building.character}</span>
                            </div>
                          )}
                          {building.descriptio && (
                            <div className="text-xs text-muted-foreground line-clamp-1 ml-4 mt-1">
                              {building.descriptio}
                            </div>
                          )}
                        </div>
                        {index === destinationSelectedIndex && (
                          <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* No Results Message - Destination */}
          {isDestinationFocused &&
            destinationSearchQuery &&
            filteredDestinationResults.length === 0 && (
              <div className="absolute top-[calc(100%+0.75rem)] left-0 right-0 bg-white rounded-xl border border-border/50 shadow-lg z-50 p-6">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="p-3 bg-muted rounded-full">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center font-medium">
                    No locations match "{destinationSearchQuery}"
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
