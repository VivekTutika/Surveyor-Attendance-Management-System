import { AttendanceType } from '@prisma/client';
export interface UploadBikeMeterData {
    userId: string;
    type: AttendanceType;
    photoBuffer: Buffer;
    kmReading?: number;
}
export interface BikeMeterFilters {
    userId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    type?: AttendanceType;
}
export declare class BikeService {
    static uploadBikeMeterReading(data: UploadBikeMeterData): Promise<{
        user: {
            name: string;
            id: string;
            mobileNumber: string;
            project: string | null;
            location: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        type: import(".prisma/client").$Enums.AttendanceType;
        photoPath: string;
        capturedAt: Date;
        kmReading: number | null;
    }>;
    static getBikeMeterReadings(filters: BikeMeterFilters, userRole: string, requestingUserId: string): Promise<({
        user: {
            name: string;
            id: string;
            mobileNumber: string;
            project: string | null;
            location: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        type: import(".prisma/client").$Enums.AttendanceType;
        photoPath: string;
        capturedAt: Date;
        kmReading: number | null;
    })[]>;
    static getTodayBikeMeterStatus(userId: string): Promise<{
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
            id: string;
            mobileNumber: string;
            project: string | null;
            location: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        type: import(".prisma/client").$Enums.AttendanceType;
        photoPath: string;
        capturedAt: Date;
        kmReading: number | null;
    }>;
    static getBikeMeterSummary(userId: string, startDate: string, endDate: string): Promise<any[]>;
    static deleteBikeMeterReading(readingId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=bikeService.d.ts.map