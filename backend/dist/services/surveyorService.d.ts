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
        name: string;
        project: {
            name: string;
            id: number;
        } | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.Role;
        mobileNumber: string;
        projectId: number | null;
        locationId: number | null;
        isActive: boolean;
        location: {
            name: string;
            id: number;
        } | null;
    }>;
    static getSurveyors(filters: SurveyorFilters): Promise<{
        name: string;
        project: {
            name: string;
            id: number;
        } | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.Role;
        mobileNumber: string;
        projectId: number | null;
        locationId: number | null;
        isActive: boolean;
        location: {
            name: string;
            id: number;
        } | null;
        _count: {
            attendances: number;
            bikeMeterReadings: number;
        };
    }[]>;
    static getSurveyorById(surveyorId: number): Promise<{
        name: string;
        project: {
            name: string;
            id: number;
        } | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.Role;
        mobileNumber: string;
        projectId: number | null;
        locationId: number | null;
        isActive: boolean;
        location: {
            name: string;
            id: number;
        } | null;
        _count: {
            attendances: number;
            bikeMeterReadings: number;
        };
    }>;
    static updateSurveyor(surveyorId: number, updateData: UpdateSurveyorData): Promise<{
        name: string;
        project: {
            name: string;
            id: number;
        } | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.Role;
        mobileNumber: string;
        projectId: number | null;
        locationId: number | null;
        isActive: boolean;
        location: {
            name: string;
            id: number;
        } | null;
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