import { AttendanceType } from '@prisma/client';
export interface UploadBikeMeterData {
    userId: number;
    type: AttendanceType;
    photoBuffer: Buffer;
    kmReading?: number;
}
export interface BikeMeterFilters {
    userId?: number;
    date?: string;
    startDate?: string;
    endDate?: string;
    type?: AttendanceType;
}
export declare class BikeService {
    static uploadBikeMeterReading(data: UploadBikeMeterData): Promise<{
        user: {
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
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.AttendanceType;
        kmReading: number | null;
        date: Date;
        userId: number;
        photoPath: string;
        capturedAt: Date;
    }>;
    static getBikeMeterReadings(filters: BikeMeterFilters, userRole: string, requestingUserId: number): Promise<({
        user: {
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
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.AttendanceType;
        kmReading: number | null;
        date: Date;
        userId: number;
        photoPath: string;
        capturedAt: Date;
    })[]>;
    static getTodayBikeMeterStatus(userId: number): Promise<{
        date: string;
        morningUploaded: boolean;
        eveningUploaded: boolean;
        morningTime: string | null;
        eveningTime: string | null;
        morningKm: number | null;
        eveningKm: number | null;
    }>;
    static updateKmReading(readingId: string, kmReading: number): Promise<{
        user: {
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
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.AttendanceType;
        kmReading: number | null;
        date: Date;
        userId: number;
        photoPath: string;
        capturedAt: Date;
    }>;
    static getBikeMeterSummary(userId: number, startDate: string, endDate: string): Promise<any[]>;
    static deleteBikeMeterReading(readingId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=bikeService.d.ts.map