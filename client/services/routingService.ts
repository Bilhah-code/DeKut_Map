// Enhanced routing service for campus navigation
// Calculates distance, estimated walking time, and provides route paths

interface RouteResult {
  distance: number; // in meters
  estimatedTime: number; // in minutes
  startCoords: [number, number];
  endCoords: [number, number];
  routePath?: [number, number][]; // array of coordinates representing the route
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

// Calculate total distance along a path
export const calculatePathDistance = (
  path: [number, number][],
): number => {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += calculateDistance(path[i], path[i + 1]);
  }
  return totalDistance;
};

// Calculate estimated walking time based on distance
// Assumes average walking speed of 1.4 m/s (5 km/h)
export const estimateWalkingTime = (distanceInMeters: number): number => {
  const walkingSpeedMs = 1.4; // meters per second
  const timeInSeconds = distanceInMeters / walkingSpeedMs;
  return Math.ceil(timeInSeconds / 60); // convert to minutes
};

// Find nearest point on a path to a given coordinate
export const findNearestPointOnPath = (
  point: [number, number],
  path: [number, number][],
): [number, number] => {
  let minDistance = Infinity;
  let nearest = path[0];

  for (const pathPoint of path) {
    const distance = calculateDistance(point, pathPoint);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = pathPoint;
    }
  }

  return nearest;
};

// Simple routing using a predefined straight line or approximation
// In production, this could integrate with actual campus path data
export const calculateRoute = (
  startCoords: [number, number],
  endCoords: [number, number],
): RouteResult => {
  const distance = calculateDistance(startCoords, endCoords);
  const estimatedTime = estimateWalkingTime(distance);

  // Create an approximate path with intermediate points for visualization
  const routePath: [number, number][] = [startCoords];

  // Add intermediate points to create a smoother line
  const numIntermediatePoints = Math.ceil(distance / 100); // One point every ~100 meters
  for (let i = 1; i < numIntermediatePoints; i++) {
    const fraction = i / numIntermediatePoints;
    const [lat1, lon1] = startCoords;
    const [lat2, lon2] = endCoords;
    const intermediateLat = lat1 + (lat2 - lat1) * fraction;
    const intermediateLon = lon1 + (lon2 - lon1) * fraction;
    routePath.push([intermediateLat, intermediateLon]);
  }

  routePath.push(endCoords);

  return {
    distance,
    estimatedTime,
    startCoords,
    endCoords,
    routePath,
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
