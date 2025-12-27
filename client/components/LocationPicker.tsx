import { useState, useMemo, useRef } from "react";
import { Search, X, MapPin, ArrowRight, ChevronRight, Navigation2, Map } from "lucide-react";
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
  const [originSelectedIndex, setOriginSelectedIndex] = useState(-1);
  const [destinationSelectedIndex, setDestinationSelectedIndex] = useState(-1);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const [isOriginFocused, setIsOriginFocused] = useState(false);
  const [isDestinationFocused, setIsDestinationFocused] = useState(false);
  const originDropdownRef = useRef<HTMLDivElement>(null);
  const destinationDropdownRef = useRef<HTMLDivElement>(null);

  // Filter origin locations
  const filteredOriginResults = useMemo(() => {
    if (!originSearchQuery.trim()) {
      return buildings.slice().sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    const query = originSearchQuery.toLowerCase();
    return buildings
      .filter(
        (building) =>
          building.name?.toLowerCase().includes(query) ||
          building.character?.toLowerCase().includes(query) ||
          building.descriptio?.toLowerCase().includes(query)
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
      return buildings.slice().sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    const query = destinationSearchQuery.toLowerCase();
    return buildings
      .filter(
        (building) =>
          building.name?.toLowerCase().includes(query) ||
          building.character?.toLowerCase().includes(query) ||
          building.descriptio?.toLowerCase().includes(query)
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
        prev < filteredOriginResults.length - 1 ? prev + 1 : prev
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
        prev < filteredDestinationResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setDestinationSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && destinationSelectedIndex >= 0) {
      e.preventDefault();
      handleSelectDestination(filteredDestinationResults[destinationSelectedIndex]);
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
    <div className="bg-white rounded-xl shadow-lg border border-border/50 overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Origin Input */}
        <div className="relative z-30">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Navigation2 className="h-4 w-4 text-primary" />
            </div>
            <Input
              ref={originInputRef}
              placeholder="From where?"
              value={originSearchQuery || origin?.name || ""}
              onChange={(e) => {
                setOriginSearchQuery(e.target.value);
                setOriginSelectedIndex(-1);
              }}
              onKeyDown={handleOriginKeyDown}
              onFocus={() => {
                setIsOriginFocused(true);
              }}
              onBlur={handleOriginInputBlur}
              className={`pl-9 pr-32 py-2 h-auto text-sm ${
                isSelectingOriginOnMap ? "border-primary border-2 bg-primary/5" : ""
              }`}
            />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
              {origin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onOriginSelect(null);
                    setOriginSearchQuery("");
                    setOriginSelectedIndex(-1);
                  }}
                  className="h-6 w-6 p-0"
                  title="Clear origin"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onOriginMapPick}
                className={`h-6 px-2 text-xs font-medium ${
                  isSelectingOriginOnMap
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-muted-foreground"
                }`}
                title="Pick on map"
              >
                <Map className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Origin Results Dropdown */}
          {(isOriginFocused || originSearchQuery) && filteredOriginResults.length > 0 && (
            <div
              ref={originDropdownRef}
              className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white rounded-lg border border-border shadow-2xl z-50 max-h-80 overflow-y-auto"
            >
              <div className="divide-y divide-border">
                {filteredOriginResults.map((building, index) => (
                  <button
                    key={building.id}
                    onClick={() => handleSelectOrigin(building)}
                    onMouseEnter={() => setOriginSelectedIndex(index)}
                    className={`w-full text-left px-4 py-3 transition-all duration-150 hover:bg-muted/60 ${
                      index === originSelectedIndex
                        ? "bg-gradient-to-r from-primary/15 to-primary/5 border-l-3 border-l-primary"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="truncate">{building.name || "Unnamed Building"}</span>
                        </div>
                        <div className="flex flex-col gap-1.5 ml-6">
                          {building.character && (
                            <div className="text-xs font-medium text-primary/80 flex items-center gap-1">
                              <span className="text-primary/60">ID:</span>
                              {building.character}
                            </div>
                          )}
                          {building.descriptio && (
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {building.descriptio}
                            </div>
                          )}
                        </div>
                      </div>
                      {index === originSelectedIndex && (
                        <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results Message - Origin */}
          {(isOriginFocused || originSearchQuery) &&
            originSearchQuery &&
            filteredOriginResults.length === 0 && (
              <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white rounded-lg border border-border shadow-lg z-50 p-4">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Search className="h-6 w-6 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground text-center font-medium">
                    No locations found
                  </p>
                </div>
              </div>
            )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapLocations}
            className="h-8 w-8 p-0 rounded-full border border-border hover:bg-muted"
            disabled={!origin || !destination}
            title="Swap origin and destination"
          >
            <ArrowRight className="h-4 w-4 rotate-90" />
          </Button>
        </div>

        {/* Destination Input */}
        <div className="relative z-20">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-500" />
            </div>
            <Input
              ref={destinationInputRef}
              placeholder="Where to?"
              value={destinationSearchQuery || destination?.name || ""}
              onChange={(e) => {
                setDestinationSearchQuery(e.target.value);
                setDestinationSelectedIndex(-1);
              }}
              onKeyDown={handleDestinationKeyDown}
              onFocus={() => {
                setIsDestinationFocused(true);
              }}
              onBlur={handleDestinationInputBlur}
              className={`pl-9 pr-32 py-2 h-auto text-sm ${
                isSelectingDestinationOnMap ? "border-primary border-2 bg-primary/5" : ""
              }`}
            />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
              {destination && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onDestinationSelect(null);
                    setDestinationSearchQuery("");
                    setDestinationSelectedIndex(-1);
                  }}
                  className="h-6 w-6 p-0"
                  title="Clear destination"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onDestinationMapPick}
                className={`h-6 px-2 text-xs font-medium ${
                  isSelectingDestinationOnMap
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-muted-foreground"
                }`}
                title="Pick on map"
              >
                <Map className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Destination Results Dropdown */}
          {(isDestinationFocused || destinationSearchQuery) &&
            filteredDestinationResults.length > 0 && (
              <div
                ref={destinationDropdownRef}
                className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white rounded-lg border border-border shadow-2xl z-50 max-h-80 overflow-y-auto"
              >
                <div className="divide-y divide-border">
                  {filteredDestinationResults.map((building, index) => (
                    <button
                      key={building.id}
                      onClick={() => handleSelectDestination(building)}
                      onMouseEnter={() => setDestinationSelectedIndex(index)}
                      className={`w-full text-left px-4 py-3 transition-all duration-150 hover:bg-muted/60 ${
                        index === destinationSelectedIndex
                          ? "bg-gradient-to-r from-primary/15 to-primary/5 border-l-3 border-l-primary"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span className="truncate">
                              {building.name || "Unnamed Building"}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1.5 ml-6">
                            {building.character && (
                              <div className="text-xs font-medium text-primary/80 flex items-center gap-1">
                                <span className="text-primary/60">ID:</span>
                                {building.character}
                              </div>
                            )}
                            {building.descriptio && (
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {building.descriptio}
                              </div>
                            )}
                          </div>
                        </div>
                        {index === destinationSelectedIndex && (
                          <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* No Results Message - Destination */}
          {(isDestinationFocused || destinationSearchQuery) &&
            destinationSearchQuery &&
            filteredDestinationResults.length === 0 && (
              <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white rounded-lg border border-border shadow-lg z-50 p-4">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Search className="h-6 w-6 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground text-center font-medium">
                    No locations found
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
