import { prisma } from '../config/db';

export interface CreateLocationData {
  name: string;
}

export interface UpdateLocationData {
  name?: string;
}

export interface LocationFilters {
  search?: string;
}

export class LocationService {
  // Create new location (Admin only)
  static async createLocation(data: CreateLocationData) {
    const { name } = data;

    // Check if location with same name already exists
    const existingLocation = await prisma.location.findUnique({
      where: { name },
    });

    if (existingLocation) {
      throw new Error('Location with this name already exists');
    }

    // Create location
    const location = await prisma.location.create({
      data: {
        name,
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return location;
  }

  // Get all locations with filters
  static async getLocations(filters: LocationFilters) {
    const { search } = filters;

    const where: any = {};

    // Search filter (name only)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const locations = await prisma.location.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return locations;
  }

  // Get location by ID
  static async getLocationById(locationId: number) {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    return location;
  }

  // Update location (Admin only)
  static async updateLocation(locationId: number, updateData: UpdateLocationData) {
    const { name } = updateData;

    // Check if location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!existingLocation) {
      throw new Error('Location not found');
    }

    // If updating name, check for conflicts
    if (name && name !== existingLocation.name) {
      const conflictingLocation = await prisma.location.findUnique({
        where: { name },
      });

      if (conflictingLocation) {
        throw new Error('Location name already exists');
      }
    }

    // Update location
    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: {
        ...(name && { name }),
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return updatedLocation;
  }

  // Delete location (Admin only)
  static async deleteLocation(locationId: number) {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    // Check if there are users assigned to this location
    if (location._count.users > 0) {
      throw new Error(`Cannot delete location. There are ${location._count.users} users assigned to this location. Please reassign them first.`);
    }

    // Delete location
    await prisma.location.delete({
      where: { id: locationId },
    });

    return { message: 'Location deleted successfully' };
  }

  // Get users assigned to location
  static async getLocationUsers(locationId: number) {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    const users = await prisma.user.findMany({
      where: { locationId },
      select: {
        id: true,
        name: true,
        mobileNumber: true,
        role: true,
        isActive: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return users;
  }
}