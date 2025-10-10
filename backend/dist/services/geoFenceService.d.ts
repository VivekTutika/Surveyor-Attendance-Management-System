import { Coordinate } from '../utils/geoUtils';
export interface CreateGeoFenceData {
    surveyorId: number;
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
            project: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            id: number;
            mobileNumber: string;
            location: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        surveyorId: number;
        coordinates: import("@prisma/client/runtime/library").JsonValue;
    }>;
    static getGeoFence(surveyorId: number): Promise<{
        surveyor: {
            name: string;
            project: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            id: number;
            mobileNumber: string;
            location: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        surveyorId: number;
        coordinates: import("@prisma/client/runtime/library").JsonValue;
    }>;
    static updateGeoFence(surveyorId: number, updateData: UpdateGeoFenceData): Promise<{
        surveyor: {
            name: string;
            project: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            id: number;
            mobileNumber: string;
            location: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        surveyorId: number;
        coordinates: import("@prisma/client/runtime/library").JsonValue;
    }>;
    static deleteGeoFence(surveyorId: number): Promise<{
        message: string;
    }>;
    static getAllGeoFences(): Promise<({
        surveyor: {
            name: string;
            project: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            id: number;
            mobileNumber: string;
            location: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        surveyorId: number;
        coordinates: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    static toggleGeoFenceStatus(surveyorId: number): Promise<{
        surveyor: {
            name: string;
            project: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            id: number;
            mobileNumber: string;
            location: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        surveyorId: number;
        coordinates: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
//# sourceMappingURL=geoFenceService.d.ts.map