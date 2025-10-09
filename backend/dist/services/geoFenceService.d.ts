import { Coordinate } from '../utils/geoUtils';
export interface CreateGeoFenceData {
    surveyorId: string;
    coordinates: Coordinate[];
    isActive?: boolean;
}
export interface UpdateGeoFenceData {
    coordinates?: Coordinate[];
    isActive?: boolean;
}
export declare class GeoFenceService {
    static createOrUpdateGeoFence(data: CreateGeoFenceData): Promise<{
        surveyor: {
            name: string;
            id: string;
            mobileNumber: string;
            project: string | null;
            location: string | null;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        surveyorId: string;
        coordinates: import("@prisma/client/runtime/library").JsonValue;
    }>;
    static getGeoFence(surveyorId: string): Promise<{
        surveyor: {
            name: string;
            id: string;
            mobileNumber: string;
            project: string | null;
            location: string | null;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        surveyorId: string;
        coordinates: import("@prisma/client/runtime/library").JsonValue;
    }>;
    static updateGeoFence(surveyorId: string, updateData: UpdateGeoFenceData): Promise<{
        surveyor: {
            name: string;
            id: string;
            mobileNumber: string;
            project: string | null;
            location: string | null;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        surveyorId: string;
        coordinates: import("@prisma/client/runtime/library").JsonValue;
    }>;
    static deleteGeoFence(surveyorId: string): Promise<{
        message: string;
    }>;
    static getAllGeoFences(): Promise<({
        surveyor: {
            name: string;
            id: string;
            mobileNumber: string;
            project: string | null;
            location: string | null;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        surveyorId: string;
        coordinates: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    static toggleGeoFenceStatus(surveyorId: string): Promise<{
        surveyor: {
            name: string;
            id: string;
            mobileNumber: string;
            project: string | null;
            location: string | null;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        surveyorId: string;
        coordinates: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
//# sourceMappingURL=geoFenceService.d.ts.map