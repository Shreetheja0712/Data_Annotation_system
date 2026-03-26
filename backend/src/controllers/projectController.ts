import { Response } from "express";
import db from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// GET /api/projects
export const getProjects = async (req: AuthRequest, res: Response) => {
  const projects = await db.project.findMany({
    where: { userId: req.userId },
    include: {
      _count: { select: { images: true, classes: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(projects);
};

// POST /api/projects
export const createProject = async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: "Project name required" });

  const project = await db.project.create({
    data: { name, description, userId: req.userId! },
  });
  res.status(201).json(project);
};

// GET /api/projects/:id
export const getProject = async (req: AuthRequest, res: Response) => {
  const project = await db.project.findFirst({
    where: { id: Number(req.params.id), userId: req.userId },
    include: {
      images: { include: { _count: { select: { annotations: true } } } },
      classes: true,
    },
  });
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
};

// PUT /api/projects/:id
export const updateProject = async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  const project = await db.project.findFirst({
    where: { id: Number(req.params.id), userId: req.userId },
  });
  if (!project) return res.status(404).json({ message: "Project not found" });

  const updated = await db.project.update({
    where: { id: project.id },
    data: { name, description },
  });
  res.json(updated);
};

// DELETE /api/projects/:id
export const deleteProject = async (req: AuthRequest, res: Response) => {
  const project = await db.project.findFirst({
    where: { id: Number(req.params.id), userId: req.userId },
  });
  if (!project) return res.status(404).json({ message: "Project not found" });

  await db.project.delete({ where: { id: project.id } });
  res.json({ message: "Project deleted" });
};