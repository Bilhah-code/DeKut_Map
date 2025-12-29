import { useState, useRef, useMemo } from "react";
import { X, MapPin, Search, ArrowRight, Navigation, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Building {
  id: string;
  name: string;
  coords: [number, number];
  character: string;
  descriptio: string;
}

interface BottomSearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOriginSelect: (location: Building | null) => void;
  onDestinationSelect: (location: Building | null) => void;
  buildings: Building[];
  origin?: Building | null;
  destination?: Building | null;
  isSelectingOrigin?: boolean;
  isSelectingDestination?: boolean;
}

export default function BottomSearchSheet({
  isOpen,
  onClose,
  onOriginSelect,
  onDestinationSelect,
  buildings,
  origin,
  destination,
  isSelectingOrigin,
  isSelectingDestination,
}: BottomSearchSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"from" | "to">(isSelectingOrigin ? "from" : "to");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredBuildings = useMemo(() => {
    if (!searchQuery.trim()) {
      return buildings.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    const query = searchQuery.toLowerCase();
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
  }, [searchQuery, buildings]);

  if (!isOpen) return null;

  const handleLocationSelect = (building: Building) => {
    if (activeTab === "from") {
      onOriginSelect(building);
      setActiveTab("to");
      setSearchQuery("");
    } else {
      onDestinationSelect(building);
      onClose();
      setSearchQuery("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl pointer-events-auto transform transition-transform duration-500 max-h-[80vh] flex flex-col ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle Bar */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Search Container */}
        <div className="px-6 pt-2 pb-4 space-y-4 flex-shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900">
              {activeTab === "from" ? "Where from?" : "Where to?"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab("from");
                setSearchQuery("");
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-bold transition-all ${
                activeTab === "from"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              From
            </button>
            <button
              onClick={() => {
                setActiveTab("to");
                setSearchQuery("");
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-bold transition-all ${
                activeTab === "to"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              To
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search campus locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3.5 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded-xl bg-white text-gray-900 placeholder-gray-400 font-medium"
            />
          </div>

          {/* Current Selection */}
          {(origin || destination) && (
            <div className="flex gap-2 flex-wrap">
              {origin && activeTab === "to" && (
                <div className="px-3 py-2 bg-green-100 border-2 border-green-300 rounded-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-bold text-green-700">{origin.name}</span>
                  <button
                    onClick={() => onOriginSelect(null)}
                    className="ml-1 hover:text-green-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {destination && activeTab === "from" && (
                <div className="px-3 py-2 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-bold text-blue-700">{destination.name}</span>
                  <button
                    onClick={() => onDestinationSelect(null)}
                    className="ml-1 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
          {filteredBuildings.length > 0 ? (
            filteredBuildings.map((building) => (
              <button
                key={building.id}
                onClick={() => handleLocationSelect(building)}
                className="w-full text-left p-4 rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:shadow-lg transition-all">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {building.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{building.character}</p>
                    {building.descriptio && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{building.descriptio}</p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 flex-shrink-0 mt-1 transition-all" />
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">No locations found</p>
              <p className="text-xs text-gray-400 mt-1">Try searching for a different location</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
