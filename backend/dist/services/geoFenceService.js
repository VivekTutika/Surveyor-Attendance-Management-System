"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoFenceService = void 0;
const db_1 = require("../config/db");
const geoUtils_1 = require("../utils/geoUtils");
class GeoFenceService {
    // Create or update geo-fence for a surveyor (Admin only)
    static async createOrUpdateGeoFence(data) {
        const { surveyorId, coordinates, isActive = false } = data;
        // Validate coordinates
        if (!coordinates || coordinates.length < 3) {
            throw new Error('At least 3 coordinates are required to create a geo-fence');
        }
        // Validate each coordinate
        coordinates.forEach((coord, index) => {
            if (!(0, geoUtils_1.isValidCoordinate)(coord)) {
                throw new Error(`Invalid coordinate at index ${index}`);
            }
        });
        // Check if surveyor exists
        const surveyor = await db_1.prisma.user.findUnique({
            where: { id: surveyorId }, // Now correctly typed as number
        });
        if (!surveyor) {
            throw new Error('Surveyor not found');
        }
        if (surveyor.role !== 'SURVEYOR') {
            throw new Error('Geo-fence can only be assigned to surveyors');
        }
        // Create or update geo-fence
        const geoFence = await db_1.prisma.geoFence.upsert({
            where: { surveyorId }, // Now correctly typed as number
            update: {
                coordinates: coordinates,
                isActive,
            },
            create: {
                surveyorId, // Now correctly typed as number
                coordinates: coordinates,
                isActive,
            },
            include: {
                surveyor: {
                    select: {
                        id: true,
                        name: true,
                        mobileNumber: true,
                        project: true,
                        location: true,
                    },
                },
            },
        });
        return geoFence;
    }
    // Get geo-fence for a surveyor
    static async getGeoFence(surveyorId) {
        const geoFence = await db_1.prisma.geoFence.findUnique({
            where: { surveyorId }, // Now correctly typed as number
            include: {
                surveyor: {
                    select: {
                        id: true,
                        name: true,
                        mobileNumber: true,
                        project: true,
                        location: true,
                    },
                },
            },
        });
        if (!geoFence) {
            throw new Error('Geo-fence not found for this surveyor');
        }
        return geoFence;
    }
    // Update geo-fence (Admin only)
    static async updateGeoFence(surveyorId, updateData) {
        const { coordinates, isActive } = updateData;
        // Check if geo-fence exists
        const existingGeoFence = await db_1.prisma.geoFence.findUnique({
            where: { surveyorId }, // Now correctly typed as number
        });
        if (!existingGeoFence) {
            throw new Error('Geo-fence not found for this surveyor');
        }
        // Validate coordinates if provided
        if (coordinates) {
            if (coordinates.length < 3) {
                throw new Error('At least 3 coordinates are required for a geo-fence');
            }
            coordinates.forEach((coord, index) => {
                if (!(0, geoUtils_1.isValidCoordinate)(coord)) {
                    throw new Error(`Invalid coordinate at index ${index}`);
                }
            });
        }
        // Update geo-fence
        const updatedGeoFence = await db_1.prisma.geoFence.update({
            where: { surveyorId }, // Now correctly typed as number
            data: {
                ...(coordinates && { coordinates: coordinates }),
                ...(typeof isActive === 'boolean' && { isActive }),
            },
            include: {
                surveyor: {
                    select: {
                        id: true,
                        name: true,
                        mobileNumber: true,
                        project: true,
                        location: true,
                    },
                },
            },
        });
        return updatedGeoFence;
    }
    // Delete geo-fence (Admin only)
    static async deleteGeoFence(surveyorId) {
        const geoFence = await db_1.prisma.geoFence.findUnique({
            where: { surveyorId }, // Now correctly typed as number
        });
        if (!geoFence) {
            throw new Error('Geo-fence not found for this surveyor');
        }
        await db_1.prisma.geoFence.delete({
            where: { surveyorId }, // Now correctly typed as number
        });
        return { message: 'Geo-fence deleted successfully' };
    }
    // Get all geo-fences (Admin only)
    static async getAllGeoFences() {
        const geoFences = await db_1.prisma.geoFence.findMany({
            include: {
                surveyor: {
                    select: {
                        id: true,
                        name: true,
                        mobileNumber: true,
                        project: true,
                        location: true,
                    },
                },
            },
            orderBy: [
                { isActive: 'desc' },
                { surveyor: { name: 'asc' } },
            ],
        });
        return geoFences;
    }
    // Toggle geo-fence status (Admin only)
    static async toggleGeoFenceStatus(surveyorId) {
        const geoFence = await db_1.prisma.geoFence.findUnique({
            where: { surveyorId }, // Now correctly typed as number
        });
        if (!geoFence) {
            throw new Error('Geo-fence not found for this surveyor');
        }
        const updatedGeoFence = await db_1.prisma.geoFence.update({
            where: { surveyorId }, // Now correctly typed as number
            data: { isActive: !geoFence.isActive },
            include: {
                surveyor: {
                    select: {
                        id: true,
                        name: true,
                        mobileNumber: true,
                        project: true,
                        location: true,
                    },
                },
            },
        });
        return updatedGeoFence;
    }
}
exports.GeoFenceService = GeoFenceService;
//# sourceMappingURL=geoFenceService.js.map