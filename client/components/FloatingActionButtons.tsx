import { useState } from "react";
import {
  Plus,
  Navigation,
  Layers,
  Settings,
  X,
  Satellite,
  Map as MapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonsProps {
  onSearchClick: () => void;
  onNavigateClick: () => void;
  onLayersClick: () => void;
  onBaseLayerChange: (key: "openstreetmap" | "satellite") => void;
  baseLayerKey: "openstreetmap" | "satellite";
}

export default function FloatingActionButtons({
  onSearchClick,
  onNavigateClick,
  onLayersClick,
  onBaseLayerChange,
  baseLayerKey,
}: FloatingActionButtonsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-30 flex flex-col items-end gap-4">
      {/* Menu Items */}
      {isExpanded && (
        <>
          {/* Navigate Button */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={() => {
                onNavigateClick();
                setIsExpanded(false);
              }}
              className="flex items-center gap-3 bg-white border-2 border-blue-300 rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all hover:bg-blue-50 group"
              title="Start Navigation"
            >
              <Navigation className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-gray-900 mr-2">
                Navigate
              </span>
            </button>
          </div>

          {/* Layers Button */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={() => {
                onLayersClick();
                setIsExpanded(false);
              }}
              className="flex items-center gap-3 bg-white border-2 border-purple-300 rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all hover:bg-purple-50 group"
              title="Toggle Layers"
            >
              <Layers className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-gray-900 mr-2">
                Layers
              </span>
            </button>
          </div>

          {/* Map Type Selector */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 flex gap-2 bg-white border-2 border-gray-300 rounded-full p-2 shadow-lg">
            <button
              onClick={() => {
                onBaseLayerChange("openstreetmap");
                setIsExpanded(false);
              }}
              className={`p-2 rounded-full transition-all ${
                baseLayerKey === "openstreetmap"
                  ? "bg-green-100 text-green-600 shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Street Map"
            >
              <MapIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                onBaseLayerChange("satellite");
                setIsExpanded(false);
              }}
              className={`p-2 rounded-full transition-all ${
                baseLayerKey === "satellite"
                  ? "bg-blue-100 text-blue-600 shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Satellite View"
            >
              <Satellite className="h-5 w-5" />
            </button>
          </div>

          {/* Search Button */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <button
              onClick={() => {
                onSearchClick();
                setIsExpanded(false);
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all hover:from-green-600 hover:to-green-700 group"
              title="Search Locations"
            >
              <span className="font-bold text-sm mr-2">Search</span>
            </button>
          </div>
        </>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 active:scale-95 ${
          isExpanded
            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        }`}
        title={isExpanded ? "Close menu" : "Open menu"}
      >
        {isExpanded ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </div>
  );
}
