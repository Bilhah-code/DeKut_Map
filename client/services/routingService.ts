// Simple routing service for campus navigation
// Calculates distance and estimated walking time between two points

interface RouteResult {
  distance: number; // in meters
  estimatedTime: number; // in minutes
  startCoords: [number, number];
  endCoords: [number, number];
}

// Haversine formula to calculate distance between two coordinates
export const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number],
): number => {
  const R = 6371000; // Earth's radius in meters
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in meters
};

const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

// Calculate estimated walking time based on distance
// Assumes average walking speed of 1.4 m/s (5 km/h)
export const estimateWalkingTime = (distanceInMeters: number): number => {
  const walkingSpeedMs = 1.4; // meters per second
  const timeInSeconds = distanceInMeters / walkingSpeedMs;
  return Math.ceil(timeInSeconds / 60); // convert to minutes
};

// Simple routing: straight line between start and end
// In a real app, this would use a proper routing engine with roads
export const calculateRoute = (
  startCoords: [number, number],
  endCoords: [number, number],
): RouteResult => {
  const distance = calculateDistance(startCoords, endCoords);
  const estimatedTime = estimateWalkingTime(distance);

  return {
    distance,
    estimatedTime,
    startCoords,
    endCoords,
  };
};

// Format distance for display
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

// Format time for display
export const formatTime = (minutes: number): string => {
  if (minutes < 1) {
    return "< 1 min";
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};
