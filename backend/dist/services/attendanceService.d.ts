import { AttendanceType } from '@prisma/client';
export interface MarkAttendanceData {
    userId: string;
    type: AttendanceType;
    latitude: number;
    longitude: number;
    photoBuffer: Buffer;
}
export interface AttendanceFilters {
    userId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    type?: AttendanceType;
}
export declare class AttendanceService {
    static markAttendance(data: MarkAttendanceData): Promise<{
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
        latitude: number;
        longitude: number;
        capturedAt: Date;
    }>;
    static getAttendanceRecords(filters: AttendanceFilters, userRole: string, requestingUserId: string): Promise<({
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
        latitude: number;
        longitude: number;
        capturedAt: Date;
    })[]>;
    static getTodayAttendanceStatus(userId: string): Promise<{
        date: string;
        morningMarked: boolean;
        eveningMarked: boolean;
        morningTime: string | null;
        eveningTime: string | null;
    }>;
    static getAttendanceSummary(userId: string, startDate: string, endDate: string): Promise<any[]>;
    static deleteAttendance(attendanceId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=attendanceService.d.ts.map