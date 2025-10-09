import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { asyncHandler } from '../middlewares/errorHandler';

export class ProjectController {
  // POST /api/projects - Create new project (Admin only)
  static createProject = asyncHandler(async (req: Request, res: Response) => {
    const projectData = req.body;

    const project = await ProjectService.createProject(projectData);

    sendCreated(res, 'Project created successfully', project);
  });

  // GET /api/projects - Get all projects (Admin only)
  static getProjects = asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query as any;

    const projects = await ProjectService.getProjects(filters);

    sendSuccess(res, 'Projects retrieved successfully', projects);
  });

  // GET /api/projects/:id - Get project by ID (Admin only)
  static getProjectById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const project = await ProjectService.getProjectById(parseInt(id));

    sendSuccess(res, 'Project retrieved successfully', project);
  });

  // PUT /api/projects/:id - Update project (Admin only)
  static updateProject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedProject = await ProjectService.updateProject(parseInt(id), updateData);

    sendSuccess(res, 'Project updated successfully', updatedProject);
  });

  // DELETE /api/projects/:id - Delete project (Admin only)
  static deleteProject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await ProjectService.deleteProject(parseInt(id));

    sendSuccess(res, result.message);
  });

  // GET /api/projects/:id/users - Get users assigned to project (Admin only)
  static getProjectUsers = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const users = await ProjectService.getProjectUsers(parseInt(id));

    sendSuccess(res, 'Project users retrieved successfully', users);
  });
}