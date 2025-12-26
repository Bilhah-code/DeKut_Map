import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
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
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return buildings.filter(
      (building) =>
        building.name.toLowerCase().includes(query) ||
        building.character.toLowerCase().includes(query) ||
        building.descriptio.toLowerCase().includes(query),
    );
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
            placeholder="Search buildings, facilities..."
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
        {filteredResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-border shadow-lg z-50 max-h-80 overflow-y-auto">
            {filteredResults.map((building, index) => (
              <button
                key={building.id}
                onClick={() => handleSelect(building)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left px-4 py-3 border-b border-border last:border-b-0 transition-colors ${
                  index === selectedIndex
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div className="font-medium text-sm">{building.name}</div>
                <div
                  className={`text-xs ${
                    index === selectedIndex
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {building.descriptio}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {searchQuery && filteredResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-border shadow-lg z-50 p-4">
            <p className="text-sm text-muted-foreground text-center">
              No locations found
            </p>
          </div>
        )}
      </div>

      {/* All Locations List (when search is empty and dropdown is open) */}
      {!searchQuery && isOpen && buildings.length > 0 && (
        <div className="mt-2 bg-white rounded-lg border border-border shadow-lg max-h-80 overflow-y-auto">
          {buildings.map((building) => (
            <button
              key={building.id}
              onClick={() => handleSelect(building)}
              className="w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted transition-colors"
            >
              <div className="font-medium text-sm">{building.name}</div>
              <div className="text-xs text-muted-foreground">
                {building.descriptio}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
