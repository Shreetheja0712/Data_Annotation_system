import { Response } from "express";
import db from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

const ownsProject = async (projectId: number, userId: number) =>
  db.project.findFirst({ where: { id: projectId, userId } });

// GET /api/projects/:projectId/classes
export const getClasses = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);
  if (!(await ownsProject(projectId, req.userId!)))
    return res.status(404).json({ message: "Project not found" });

  const classes = await db.class.findMany({
    where: { projectId },
    orderBy: { id: "asc" },
  });
  res.json(classes);
};

// POST /api/projects/:projectId/classes
export const createClass = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);
  const { className } = req.body;

  if (!className) return res.status(400).json({ message: "className required" });
  if (!(await ownsProject(projectId, req.userId!)))
    return res.status(404).json({ message: "Project not found" });

  // Check duplicate
  const exists = await db.class.findFirst({ where: { projectId, className } });
  if (exists) return res.status(400).json({ message: "Class already exists" });

  const created = await db.class.create({ data: { className, projectId } });
  res.status(201).json(created);
};

// DELETE /api/projects/:projectId/classes/:classId
export const deleteClass = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);
  const classId = Number(req.params.classId);

  if (!(await ownsProject(projectId, req.userId!)))
    return res.status(404).json({ message: "Project not found" });

  const cls = await db.class.findFirst({ where: { id: classId, projectId } });
  if (!cls) return res.status(404).json({ message: "Class not found" });

  await db.class.delete({ where: { id: classId } });
  res.json({ message: "Class deleted" });
};