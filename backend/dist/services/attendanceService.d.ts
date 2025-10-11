import { AttendanceType } from '@prisma/client';
export interface MarkAttendanceData {
    userId: number;
    type: AttendanceType;
    latitude: number;
    longitude: number;
    photoBuffer: Buffer;
}
export interface AttendanceFilters {
    userId?: number;
    date?: string;
    startDate?: string;
    endDate?: string;
    type?: AttendanceType;
    page?: number;
    limit?: number;
}
export interface PaginatedAttendanceResult {
    attendance: any[];
    total: number;
    page: number;
    pages: number;
}
export declare class AttendanceService {
    static markAttendance(data: MarkAttendanceData): Promise<{
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
        latitude: number;
        longitude: number;
        date: Date;
        userId: number;
        photoPath: string;
        capturedAt: Date;
        approved: boolean;
        approvedAt: Date | null;
        approvedBy: number | null;
    }>;
    static getAttendanceRecords(filters: AttendanceFilters, userRole: string, requestingUserId: number): Promise<{
        attendance: ({
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
            latitude: number;
            longitude: number;
            date: Date;
            userId: number;
            photoPath: string;
            capturedAt: Date;
            approved: boolean;
            approvedAt: Date | null;
            approvedBy: number | null;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    static getTodayAttendanceStatus(userId: number): Promise<{
        date: string;
        morningMarked: boolean;
        eveningMarked: boolean;
        morningTime: string | null;
        eveningTime: string | null;
    }>;
    static getAttendanceSummary(userId: number, startDate: string, endDate: string): Promise<any[]>;
    static deleteAttendance(attendanceId: string): Promise<{
        message: string;
    }>;
    static approveAttendance(attendanceId: string, adminId: number): Promise<{
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
        latitude: number;
        longitude: number;
        date: Date;
        userId: number;
        photoPath: string;
        capturedAt: Date;
        approved: boolean;
        approvedAt: Date | null;
        approvedBy: number | null;
    }>;
}
//# sourceMappingURL=attendanceService.d.ts.map