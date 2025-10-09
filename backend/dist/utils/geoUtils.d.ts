export interface Coordinate {
    latitude: number;
    longitude: number;
}
export interface GeoFence {
    id: string;
    coordinates: Coordinate[];
    isActive: boolean;
}
export declare const isPointInPolygon: (point: Coordinate, polygon: Coordinate[]) => boolean;
export declare const calculateDistance: (coord1: Coordinate, coord2: Coordinate) => number;
export declare const isValidCoordinate: (coord: Coordinate) => boolean;
export declare const isWithinGeoFence: (currentLocation: Coordinate, geoFence: GeoFence) => boolean;
//# sourceMappingURL=geoUtils.d.ts.map