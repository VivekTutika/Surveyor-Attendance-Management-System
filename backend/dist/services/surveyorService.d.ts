import { Role } from '@prisma/client';
export interface CreateSurveyorData {
    name: string;
    mobileNumber: string;
    password: string;
    projectId?: number;
    locationId?: number;
}
export interface UpdateSurveyorData {
    name?: string;
    mobileNumber?: string;
    projectId?: number;
    locationId?: number;
    isActive?: boolean;
    hasBike?: boolean;
}
export interface SurveyorFilters {
    search?: string;
    projectId?: number;
    locationId?: number;
    isActive?: boolean;
    role?: Role;
}
export declare class SurveyorService {
    static createSurveyor(data: CreateSurveyorData): Promise<{
        [x: string]: {
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
        }[] | {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.AttendanceType;
            kmReading: number | null;
            date: Date;
            userId: number;
            photoPath: string;
            capturedAt: Date;
        }[] | ({
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
        } | {
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
        })[] | ({
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.AttendanceType;
            kmReading: number | null;
            date: Date;
            userId: number;
            photoPath: string;
            capturedAt: Date;
        } | {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.AttendanceType;
            kmReading: number | null;
            date: Date;
            userId: number;
            photoPath: string;
            capturedAt: Date;
        })[] | ({
            id: number;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            approvedAt: Date | null;
            approvedBy: number | null;
            finalKm: number | null;
            surveyorId: number;
            morningReadingId: string | null;
            eveningReadingId: string | null;
            morningKm: number | null;
            eveningKm: number | null;
            computedKm: number | null;
            isApproved: boolean;
        } | {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            approvedAt: Date | null;
            approvedBy: number | null;
            finalKm: number | null;
            surveyorId: number;
            morningReadingId: string | null;
            eveningReadingId: string | null;
            morningKm: number | null;
            eveningKm: number | null;
            computedKm: number | null;
            isApproved: boolean;
        })[] | {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            approvedAt: Date | null;
            approvedBy: number | null;
            finalKm: number | null;
            surveyorId: number;
            morningReadingId: string | null;
            eveningReadingId: string | null;
            morningKm: number | null;
            eveningKm: number | null;
            computedKm: number | null;
            isApproved: boolean;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    }>;
    static getSurveyors(filters: SurveyorFilters): Promise<{
        [x: string]: {
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
        }[] | {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.AttendanceType;
            kmReading: number | null;
            date: Date;
            userId: number;
            photoPath: string;
            capturedAt: Date;
        }[] | ({
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
        } | {
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
        })[] | ({
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.AttendanceType;
            kmReading: number | null;
            date: Date;
            userId: number;
            photoPath: string;
            capturedAt: Date;
        } | {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.AttendanceType;
            kmReading: number | null;
            date: Date;
            userId: number;
            photoPath: string;
            capturedAt: Date;
        })[] | ({
            id: number;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            approvedAt: Date | null;
            approvedBy: number | null;
            finalKm: number | null;
            surveyorId: number;
            morningReadingId: string | null;
            eveningReadingId: string | null;
            morningKm: number | null;
            eveningKm: number | null;
            computedKm: number | null;
            isApproved: boolean;
        } | {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            approvedAt: Date | null;
            approvedBy: number | null;
            finalKm: number | null;
            surveyorId: number;
            morningReadingId: string | null;
            eveningReadingId: string | null;
            morningKm: number | null;
            eveningKm: number | null;
            computedKm: number | null;
            isApproved: boolean;
        })[] | {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            approvedAt: Date | null;
            approvedBy: number | null;
            finalKm: number | null;
            surveyorId: number;
            morningReadingId: string | null;
            eveningReadingId: string | null;
            morningKm: number | null;
            eveningKm: number | null;
            computedKm: number | null;
            isApproved: boolean;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    }[]>;
    static getSurveyorById(surveyorId: number): Promise<{
        [x: string]: {
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
        }[] | {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.AttendanceType;
            kmReading: number | null;
            date: Date;
            userId: number;
            photoPath: string;
            capturedAt: Date;
        }[] | ({
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
        } | {
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
        })[] | ({
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.AttendanceType;
            kmReading: number | null;
            date: Date;
            userId: number;
            photoPath: string;
            capturedAt: Date;
        } | {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.AttendanceType;
            kmReading: number | null;
            date: Date;
            userId: number;
            photoPath: string;
            capturedAt: Date;
        })[] | ({
            id: number;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            approvedAt: Date | null;
            approvedBy: number | null;
            finalKm: number | null;
            surveyorId: number;
            morningReadingId: string | null;
            eveningReadingId: string | null;
            morningKm: number | null;
            eveningKm: number | null;
            computedKm: number | null;
            isApproved: boolean;
        } | {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            approvedAt: Date | null;
            approvedBy: number | null;
            finalKm: number | null;
            surveyorId: number;
            morningReadingId: string | null;
            eveningReadingId: string | null;
            morningKm: number | null;
            eveningKm: number | null;
            computedKm: number | null;
            isApproved: boolean;
        })[] | {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            approvedAt: Date | null;
            approvedBy: number | null;
            finalKm: number | null;
            surveyorId: number;
            morningReadingId: string | null;
            eveningReadingId: string | null;
            morningKm: number | null;
            eveningKm: number | null;
            computedKm: number | null;
            isApproved: boolean;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    }>;
    static updateSurveyor(surveyorId: number, updateData: UpdateSurveyorData): Promise<{
        [x: string]: {
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
        }[] | {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.AttendanceType;
            kmReading: number | null;
            date: Date;
            userId: number;
            photoPath: string;
            capturedAt: Date;
        }[] | ({
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
        } | {
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
        })[] | ({
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.AttendanceType;
            kmReading: number | null;
            date: Date;
            userId: number;
            photoPath: string;
            capturedAt: Date;
        } | {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.AttendanceType;
            kmReading: number | null;
            date: Date;
            userId: number;
            photoPath: string;
            capturedAt: Date;
        })[] | ({
            id: number;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            approvedAt: Date | null;
            approvedBy: number | null;
            finalKm: number | null;
            surveyorId: number;
            morningReadingId: string | null;
            eveningReadingId: string | null;
            morningKm: number | null;
            eveningKm: number | null;
            computedKm: number | null;
            isApproved: boolean;
        } | {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            approvedAt: Date | null;
            approvedBy: number | null;
            finalKm: number | null;
            surveyorId: number;
            morningReadingId: string | null;
            eveningReadingId: string | null;
            morningKm: number | null;
            eveningKm: number | null;
            computedKm: number | null;
            isApproved: boolean;
        })[] | {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            approvedAt: Date | null;
            approvedBy: number | null;
            finalKm: number | null;
            surveyorId: number;
            morningReadingId: string | null;
            eveningReadingId: string | null;
            morningKm: number | null;
            eveningKm: number | null;
            computedKm: number | null;
            isApproved: boolean;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    }>;
    static deleteSurveyor(surveyorId: number): Promise<{
        message: string;
    }>;
    static resetSurveyorPassword(surveyorId: number, newPassword: string): Promise<{
        message: string;
    }>;
    static getSurveyorStatistics(surveyorId: number, startDate?: string, endDate?: string): Promise<{
        surveyor: {
            name: string;
            project: {
                name: string;
                id: number;
            } | null;
            id: number;
            mobileNumber: string;
            projectId: number | null;
            locationId: number | null;
            location: {
                name: string;
                id: number;
            } | null;
        };
        statistics: {
            attendance: {
                morning: number;
                evening: number;
            };
            bikeMeter: {
                morning: number;
                evening: number;
            };
        };
        dateRange: {
            startDate: string | undefined;
            endDate: string | undefined;
        };
    }>;
}
//# sourceMappingURL=surveyorService.d.ts.map