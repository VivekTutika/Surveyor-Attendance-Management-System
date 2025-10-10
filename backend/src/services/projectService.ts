import { prisma } from '../config/db';

export interface CreateProjectData {
  name: string;
  // description?: string; // Removed - not in schema
}

export interface UpdateProjectData {
  name?: string;
  // description?: string; // Removed - not in schema
}

export interface ProjectFilters {
  search?: string;
}

export class ProjectService {
  // Create new project (Admin only)
  static async createProject(data: CreateProjectData) {
    const { name } = data; // Removed description

    // Check if project with same name already exists
    const existingProject = await prisma.project.findUnique({
      where: { name },
    });

    if (existingProject) {
      throw new Error('Project with this name already exists');
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        // description, // Removed - not in schema
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return project;
  }

  // Get all projects with filters
  static async getProjects(filters: ProjectFilters) {
    const { search } = filters;

    const where: any = {};

    // Search filter (name only - description removed)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        // { description: { contains: search, mode: 'insensitive' } }, // Removed - not in schema
      ];
    }

    const projects = await prisma.project.findMany({
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

    return projects;
  }

  // Get project by ID
  static async getProjectById(projectId: number) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  // Update project (Admin only)
  static async updateProject(projectId: number, updateData: UpdateProjectData) {
    const { name } = updateData; // Removed description

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      throw new Error('Project not found');
    }

    // If updating name, check for conflicts
    if (name && name !== existingProject.name) {
      const conflictingProject = await prisma.project.findUnique({
        where: { name },
      });

      if (conflictingProject) {
        throw new Error('Project name already exists');
      }
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name }),
        // ...(description !== undefined && { description }), // Removed - not in schema
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return updatedProject;
  }

  // Delete project (Admin only)
  static async deleteProject(projectId: number) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if there are users assigned to this project
    if (project._count.users > 0) {
      throw new Error(`Cannot delete project. There are ${project._count.users} users assigned to this project. Please reassign them first.`);
    }

    // Delete project
    await prisma.project.delete({
      where: { id: projectId },
    });

    return { message: 'Project deleted successfully' };
  }

  // Get users assigned to project
  static async getProjectUsers(projectId: number) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const users = await prisma.user.findMany({
      where: { projectId },
      select: {
        id: true,
        name: true,
        mobileNumber: true,
        role: true,
        isActive: true,
        location: {
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