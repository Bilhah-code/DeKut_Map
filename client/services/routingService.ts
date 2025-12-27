// Enhanced routing service for campus navigation
// Calculates distance, estimated walking time, and provides optimal route paths using Dijkstra's algorithm

interface Building {
  id: string;
  name: string;
  coords: [number, number];
}

interface Graph {
  [buildingId: string]: {
    building: Building;
    neighbors: Array<{ id: string; distance: number }>;
  };
}

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

// Build a graph from buildings - connect nearby buildings (within ~500 meters for campus navigation)
export const buildCampusGraph = (buildings: Building[]): Graph => {
  const graph: Graph = {};
  const MAX_DISTANCE = 500; // meters - reasonable walking distance between connected points

  // Initialize all buildings in graph
  buildings.forEach((building) => {
    graph[building.id] = {
      building,
      neighbors: [],
    };
  });

  // Connect buildings based on proximity (nearest neighbors approach)
  buildings.forEach((building) => {
    const distances = buildings
      .filter((b) => b.id !== building.id)
      .map((b) => ({
        id: b.id,
        distance: calculateDistance(building.coords, b.coords),
      }))
      .filter((d) => d.distance <= MAX_DISTANCE)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Connect to 5 nearest neighbors

    graph[building.id].neighbors = distances;
  });

  return graph;
};

// Dijkstra's algorithm to find shortest path between two buildings
export const dijkstraShortestPath = (
  graph: Graph,
  startId: string,
  endId: string,
): { distance: number; path: string[] } | null => {
  if (!graph[startId] || !graph[endId]) {
    return null;
  }

  const distances: { [key: string]: number } = {};
  const previous: { [key: string]: string | null } = {};
  const unvisited = new Set<string>();

  // Initialize distances
  Object.keys(graph).forEach((id) => {
    distances[id] = id === startId ? 0 : Infinity;
    previous[id] = null;
    unvisited.add(id);
  });

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let current: string | null = null;
    let minDistance = Infinity;

    unvisited.forEach((id) => {
      if (distances[id] < minDistance) {
        minDistance = distances[id];
        current = id;
      }
    });

    if (current === null || minDistance === Infinity) {
      break;
    }

    if (current === endId) {
      // Reconstruct path
      const path: string[] = [];
      let node: string | null = endId;
      while (node !== null) {
        path.unshift(node);
        node = previous[node];
      }
      return { distance: distances[endId], path };
    }

    unvisited.delete(current);

    // Check neighbors
    graph[current].neighbors.forEach(({ id: neighborId, distance: edgeDistance }) => {
      if (unvisited.has(neighborId)) {
        const newDistance = distances[current!] + edgeDistance;
        if (newDistance < distances[neighborId]) {
          distances[neighborId] = newDistance;
          previous[neighborId] = current;
        }
      }
    });
  }

  return null;
};

// Calculate total distance along a path
export const calculatePathDistance = (path: [number, number][]): number => {
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

// Calculate route between two locations
// Uses Dijkstra's algorithm if a graph is provided for shortest path
export const calculateRoute = (
  startCoords: [number, number],
  endCoords: [number, number],
  buildings?: Building[],
): RouteResult => {
  let distance = calculateDistance(startCoords, endCoords);
  let routePath: [number, number][] = [startCoords, endCoords];

  // If buildings provided, find shortest path through the campus graph
  if (buildings && buildings.length > 0) {
    const graph = buildCampusGraph(buildings);

    // Find nearest building to start
    let nearestStart = buildings[0];
    let minStartDist = calculateDistance(startCoords, buildings[0].coords);
    for (const building of buildings) {
      const dist = calculateDistance(startCoords, building.coords);
      if (dist < minStartDist) {
        minStartDist = dist;
        nearestStart = building;
      }
    }

    // Find nearest building to end
    let nearestEnd = buildings[0];
    let minEndDist = calculateDistance(endCoords, buildings[0].coords);
    for (const building of buildings) {
      const dist = calculateDistance(endCoords, building.coords);
      if (dist < minEndDist) {
        minEndDist = dist;
        nearestEnd = building;
      }
    }

    // Get shortest path through graph
    const pathResult = dijkstraShortestPath(graph, nearestStart.id, nearestEnd.id);

    if (pathResult && pathResult.path.length > 1) {
      // Build coordinate path from building IDs
      const coordPath: [number, number][] = [startCoords];

      for (let i = 1; i < pathResult.path.length; i++) {
        const buildingId = pathResult.path[i];
        const building = buildings.find((b) => b.id === buildingId);
        if (building) {
          coordPath.push(building.coords);
        }
      }

      coordPath.push(endCoords);
      routePath = coordPath;
      distance = calculatePathDistance(routePath);
    } else {
      // Fallback to straight line if no path found
      routePath = [startCoords, endCoords];
      distance = calculateDistance(startCoords, endCoords);
    }
  }

  const estimatedTime = estimateWalkingTime(distance);

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
