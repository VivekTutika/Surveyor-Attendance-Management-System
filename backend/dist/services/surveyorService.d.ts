import { Role } from '@prisma/client';
export interface CreateSurveyorData {
    name: string;
    mobileNumber: string;
    password: string;
    project?: string;
    location?: string;
}
export interface UpdateSurveyorData {
    name?: string;
    mobileNumber?: string;
    project?: string;
    location?: string;
    isActive?: boolean;
}
export interface SurveyorFilters {
    search?: string;
    project?: string;
    location?: string;
    isActive?: boolean;
    role?: Role;
}
export declare class SurveyorService {
    static createSurveyor(data: CreateSurveyorData): Promise<{
        name: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        mobileNumber: string;
        project: string | null;
        location: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static getSurveyors(filters: SurveyorFilters): Promise<{
        name: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        mobileNumber: string;
        project: string | null;
        location: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            attendances: number;
            bikeMeterReadings: number;
        };
    }[]>;
    static getSurveyorById(surveyorId: string): Promise<{
        name: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        mobileNumber: string;
        project: string | null;
        location: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            attendances: number;
            bikeMeterReadings: number;
        };
    }>;
    static updateSurveyor(surveyorId: string, updateData: UpdateSurveyorData): Promise<{
        name: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        mobileNumber: string;
        project: string | null;
        location: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static deleteSurveyor(surveyorId: string): Promise<{
        message: string;
    }>;
    static resetSurveyorPassword(surveyorId: string, newPassword: string): Promise<{
        message: string;
    }>;
    static getSurveyorStatistics(surveyorId: string, startDate?: string, endDate?: string): Promise<{
        surveyor: {
            name: string;
            id: string;
            mobileNumber: string;
            project: string | null;
            location: string | null;
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