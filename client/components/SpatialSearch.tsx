import { useState, useMemo } from "react";
import { Search, X, MapPin, ArrowRight } from "lucide-react";
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
  isOpen?: boolean;
  onClose?: () => void;
  buildings?: Building[];
}

export default function SpatialSearch({
  onLocationSelect,
  isOpen,
  onClose,
  buildings = [],
}: SpatialSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      // If no search query, return all buildings sorted by name
      return buildings.slice().sort((a, b) => a.name.localeCompare(b.name));
    }
    const query = searchQuery.toLowerCase();
    return buildings
      .filter(
        (building) =>
          building.name.toLowerCase().includes(query) ||
          building.character.toLowerCase().includes(query) ||
          building.descriptio.toLowerCase().includes(query),
      )
      .sort((a, b) => {
        // Sort by name match relevance
        const aNameMatch = a.name.toLowerCase().indexOf(query);
        const bNameMatch = b.name.toLowerCase().indexOf(query);
        if (aNameMatch !== bNameMatch) return aNameMatch - bNameMatch;
        return a.name.localeCompare(b.name);
      });
  }, [searchQuery, buildings]);

  const handleSelect = (location: Building) => {
    onLocationSelect?.(location);
    setSearchQuery("");
    setSelectedIndex(-1);
    onClose?.();
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
      onClose?.();
    }
  };

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search buildings, facilities, labs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-9 py-2 h-auto"
            autoFocus={isOpen}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedIndex(-1);
              }}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {(searchQuery || isOpen) && filteredResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-border shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="divide-y divide-border">
              {filteredResults.map((building, index) => (
                <button
                  key={building.id}
                  onClick={() => handleSelect(building)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-4 py-3 transition-all duration-150 ${
                    index === selectedIndex
                      ? "bg-gradient-to-r from-primary/10 to-primary/5 border-l-2 border-l-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        {building.name}
                      </div>
                      {building.descriptio && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {building.descriptio}
                        </div>
                      )}
                      {building.character && (
                        <div className="text-xs font-medium text-primary mt-1">
                          ID: {building.character}
                        </div>
                      )}
                    </div>
                    {index === selectedIndex && (
                      <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {searchQuery && filteredResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-border shadow-lg z-50 p-4">
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
