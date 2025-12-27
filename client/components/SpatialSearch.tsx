import { useState, useMemo, useRef } from "react";
import { Search, X, MapPin, ArrowRight, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Building {
  id: string;
  name: string;
  coords: [number, number];
  character: string;
  descriptio: string;
}

interface SpatialSearchProps {
  onLocationSelect?: (location: Building) => void;
  buildings?: Building[];
}

export default function SpatialSearch({
  onLocationSelect,
  buildings = [],
}: SpatialSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      // If no search query, return all buildings sorted by name
      return buildings
        .slice()
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    const query = searchQuery.toLowerCase();
    return buildings
      .filter(
        (building) =>
          building.name?.toLowerCase().includes(query) ||
          false ||
          building.character?.toLowerCase().includes(query) ||
          false ||
          building.descriptio?.toLowerCase().includes(query) ||
          false,
      )
      .sort((a, b) => {
        // Sort by name match relevance
        const aNameMatch = (a.name?.toLowerCase() || "").indexOf(query);
        const bNameMatch = (b.name?.toLowerCase() || "").indexOf(query);
        if (aNameMatch !== bNameMatch) return aNameMatch - bNameMatch;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [searchQuery, buildings]);

  const handleSelect = (location: Building) => {
    onLocationSelect?.(location);
    setSearchQuery("");
    setSelectedIndex(-1);
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredResults.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredResults[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsFocused(false);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    // Delay blur to allow click on dropdown to register
    setTimeout(() => {
      setIsFocused(false);
    }, 100);
  };

  return (
    <div className="w-full">
      {/* Search Input Wrapper */}
      <div className="relative z-30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            placeholder="Search buildings, facilities, labs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="pl-9 pr-9 py-2 h-auto"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Results Dropdown - Enhanced */}
        {(isFocused || searchQuery) && filteredResults.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white rounded-lg border border-border shadow-2xl z-50 max-h-80 overflow-y-auto"
          >
            <div className="divide-y divide-border">
              {filteredResults.map((building, index) => (
                <button
                  key={building.id}
                  onClick={() => handleSelect(building)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-4 py-3 transition-all duration-150 hover:bg-muted/60 ${
                    index === selectedIndex
                      ? "bg-gradient-to-r from-primary/15 to-primary/5 border-l-3 border-l-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
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
                            <span className="text-muted-foreground/70">
                              {building.descriptio}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {index === selectedIndex && (
                      <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {(isFocused || searchQuery) &&
          searchQuery &&
          filteredResults.length === 0 && (
            <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white rounded-lg border border-border shadow-lg z-50 p-4">
              <div className="flex flex-col items-center justify-center gap-2">
                <Search className="h-6 w-6 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground text-center font-medium">
                  No locations found
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Try searching for a building name, facility, or description
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
