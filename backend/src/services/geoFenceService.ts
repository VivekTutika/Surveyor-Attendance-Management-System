import { prisma } from '../config/db';
import { Coordinate, isValidCoordinate } from '../utils/geoUtils';

export interface CreateGeoFenceData {
  surveyorId: number;  // Changed from string to number
  coordinates: Coordinate[];
  isActive?: boolean;
}

export interface UpdateGeoFenceData {
  coordinates?: Coordinate[];
  isActive?: boolean;
}

export class GeoFenceService {
  // Create or update geo-fence for a surveyor (Admin only)
  static async createOrUpdateGeoFence(data: CreateGeoFenceData) {
    const { surveyorId, coordinates, isActive = false } = data;

    // Validate coordinates
    if (!coordinates || coordinates.length < 3) {
      throw new Error('At least 3 coordinates are required to create a geo-fence');
    }

    // Validate each coordinate
    coordinates.forEach((coord, index) => {
      if (!isValidCoordinate(coord)) {
        throw new Error(`Invalid coordinate at index ${index}`);
      }
    });

    // Check if surveyor exists
    const surveyor = await prisma.user.findUnique({
      where: { id: surveyorId },  // Now correctly typed as number
    });

    if (!surveyor) {
      throw new Error('Surveyor not found');
    }

    if (surveyor.role !== 'SURVEYOR') {
      throw new Error('Geo-fence can only be assigned to surveyors');
    }

    // Create or update geo-fence
    const geoFence = await prisma.geoFence.upsert({
      where: { surveyorId },  // Now correctly typed as number
      update: {
        coordinates: coordinates as any,
        isActive,
      },
      create: {
        surveyorId,  // Now correctly typed as number
        coordinates: coordinates as any,
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
  static async getGeoFence(surveyorId: number) {  // Changed from string to number
    const geoFence = await prisma.geoFence.findUnique({
      where: { surveyorId },  // Now correctly typed as number
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
  static async updateGeoFence(surveyorId: number, updateData: UpdateGeoFenceData) {  // Changed from string to number
    const { coordinates, isActive } = updateData;

    // Check if geo-fence exists
    const existingGeoFence = await prisma.geoFence.findUnique({
      where: { surveyorId },  // Now correctly typed as number
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
        if (!isValidCoordinate(coord)) {
          throw new Error(`Invalid coordinate at index ${index}`);
        }
      });
    }

    // Update geo-fence
    const updatedGeoFence = await prisma.geoFence.update({
      where: { surveyorId },  // Now correctly typed as number
      data: {
        ...(coordinates && { coordinates: coordinates as any }),
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
  static async deleteGeoFence(surveyorId: number) {  // Changed from string to number
    const geoFence = await prisma.geoFence.findUnique({
      where: { surveyorId },  // Now correctly typed as number
    });

    if (!geoFence) {
      throw new Error('Geo-fence not found for this surveyor');
    }

    await prisma.geoFence.delete({
      where: { surveyorId },  // Now correctly typed as number
    });

    return { message: 'Geo-fence deleted successfully' };
  }

  // Get all geo-fences (Admin only)
  static async getAllGeoFences() {
    const geoFences = await prisma.geoFence.findMany({
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
  static async toggleGeoFenceStatus(surveyorId: number) {  // Changed from string to number
    const geoFence = await prisma.geoFence.findUnique({
      where: { surveyorId },  // Now correctly typed as number
    });

    if (!geoFence) {
      throw new Error('Geo-fence not found for this surveyor');
    }

    const updatedGeoFence = await prisma.geoFence.update({
      where: { surveyorId },  // Now correctly typed as number
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