"use strict";
// Placeholder for geo-fencing utilities (v2 feature)
// This will be used for point-in-polygon checks for geo-fence validation
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWithinGeoFence = exports.isValidCoordinate = exports.calculateDistance = exports.isPointInPolygon = void 0;
// Point-in-polygon algorithm (Ray casting algorithm)
const isPointInPolygon = (point, polygon) => {
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
exports.isPointInPolygon = isPointInPolygon;
// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (coord1, coord2) => {
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
exports.calculateDistance = calculateDistance;
// Convert degrees to radians
const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};
// Validate GPS coordinates
const isValidCoordinate = (coord) => {
    return (coord.latitude >= -90 &&
        coord.latitude <= 90 &&
        coord.longitude >= -180 &&
        coord.longitude <= 180);
};
exports.isValidCoordinate = isValidCoordinate;
// Check if surveyor is within their assigned geo-fence (v2 feature)
const isWithinGeoFence = (currentLocation, geoFence) => {
    if (!geoFence.isActive) {
        return true; // If geo-fence is inactive, allow attendance
    }
    return (0, exports.isPointInPolygon)(currentLocation, geoFence.coordinates);
};
exports.isWithinGeoFence = isWithinGeoFence;
//# sourceMappingURL=geoUtils.js.map