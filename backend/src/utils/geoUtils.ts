// Placeholder for geo-fencing utilities (v2 feature)
// This will be used for point-in-polygon checks for geo-fence validation

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface GeoFence {
  id: string;
  coordinates: Coordinate[];
  isActive: boolean;
}

// Point-in-polygon algorithm (Ray casting algorithm)
export const isPointInPolygon = (point: Coordinate, polygon: Coordinate[]): boolean => {
  const { latitude: x, longitude: y } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const { latitude: xi, longitude: yi } = polygon[i];
    const { latitude: xj, longitude: yj } = polygon[j];

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

// Convert degrees to radians
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Validate GPS coordinates
export const isValidCoordinate = (coord: Coordinate): boolean => {
  return (
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180
  );
};

// Check if surveyor is within their assigned geo-fence (v2 feature)
export const isWithinGeoFence = (
  currentLocation: Coordinate,
  geoFence: GeoFence
): boolean => {
  if (!geoFence.isActive) {
    return true; // If geo-fence is inactive, allow attendance
  }

  return isPointInPolygon(currentLocation, geoFence.coordinates);
};