import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CAMPUS_BUILDINGS = [
  {
    id: 1,
    name: "Main Gate",
    coords: [-0.3603, 37.0093] as [number, number],
    type: "entrance",
    description: "University main entrance",
  },
  {
    id: 2,
    name: "Main Library",
    coords: [-0.3605, 37.0095] as [number, number],
    type: "building",
    description: "Central library facility",
  },
  {
    id: 3,
    name: "Engineering Building",
    coords: [-0.3608, 37.0098] as [number, number],
    type: "building",
    description: "Faculty of engineering",
  },
  {
    id: 4,
    name: "Student Center",
    coords: [-0.361, 37.009] as [number, number],
    type: "building",
    description: "Student hub and services",
  },
  {
    id: 5,
    name: "Sports Complex",
    coords: [-0.36, 37.0085] as [number, number],
    type: "facility",
    description: "Athletics and sports",
  },
  {
    id: 6,
    name: "Medical Center",
    coords: [-0.3615, 37.0092] as [number, number],
    type: "facility",
    description: "Campus health services",
  },
  {
    id: 7,
    name: "IT Department",
    coords: [-0.3607, 37.0088] as [number, number],
    type: "building",
    description: "Information technology",
  },
  {
    id: 8,
    name: "Cafeteria",
    coords: [-0.3602, 37.0091] as [number, number],
    type: "facility",
    description: "Dining and food services",
  },
];

interface Location {
  id: number;
  name: string;
  coords: [number, number];
  type: "building" | "entrance" | "facility";
  description: string;
}

interface SpatialSearchProps {
  onLocationSelect?: (location: Location) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SpatialSearch({
  onLocationSelect,
  isOpen,
  onClose,
}: SpatialSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return CAMPUS_BUILDINGS.filter(
      (building) =>
        building.name.toLowerCase().includes(query) ||
        building.description.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const handleSelect = (location: Location) => {
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
                  {building.description}
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
      {!searchQuery && isOpen && (
        <div className="mt-2 bg-white rounded-lg border border-border shadow-lg max-h-80 overflow-y-auto">
          {CAMPUS_BUILDINGS.map((building) => (
            <button
              key={building.id}
              onClick={() => handleSelect(building)}
              className="w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted transition-colors"
            >
              <div className="font-medium text-sm">{building.name}</div>
              <div className="text-xs text-muted-foreground">
                {building.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
