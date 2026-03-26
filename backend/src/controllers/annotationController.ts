import { Response } from "express";
import db from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

const ownsProject = async (projectId: number, userId: number) =>
  db.project.findFirst({ where: { id: projectId, userId } });

// GET /api/projects/:projectId/images/:imageId/annotations
export const getAnnotations = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);
  const imageId = Number(req.params.imageId);

  if (!(await ownsProject(projectId, req.userId!)))
    return res.status(404).json({ message: "Project not found" });

  const annotations = await db.annotation.findMany({
    where: { imageId },
    include: { class: true },
  });
  res.json(annotations);
};

// POST /api/projects/:projectId/images/:imageId/annotations
// Body: { xMin, yMin, width, height, classId }
export const createAnnotation = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);
  const imageId = Number(req.params.imageId);
  const { xMin, yMin, width, height, classId } = req.body;

  if (xMin == null || yMin == null || width == null || height == null || !classId)
    return res.status(400).json({ message: "xMin, yMin, width, height, classId required" });

  if (!(await ownsProject(projectId, req.userId!)))
    return res.status(404).json({ message: "Project not found" });

  const image = await db.image.findFirst({ where: { id: imageId, projectId } });
  if (!image) return res.status(404).json({ message: "Image not found" });

  const cls = await db.class.findFirst({ where: { id: classId, projectId } });
  if (!cls) return res.status(404).json({ message: "Class not found in this project" });

  const annotation = await db.annotation.create({
    data: { xMin, yMin, width, height, imageId, classId },
    include: { class: true },
  });

  // Increment class usage count
  await db.class.update({ where: { id: classId }, data: { count: { increment: 1 } } });

  res.status(201).json(annotation);
};

// PUT /api/projects/:projectId/images/:imageId/annotations/:annotationId
export const updateAnnotation = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);
  const annotationId = Number(req.params.annotationId);
  const { xMin, yMin, width, height, classId } = req.body;

  if (!(await ownsProject(projectId, req.userId!)))
    return res.status(404).json({ message: "Project not found" });

  const annotation = await db.annotation.findUnique({ where: { id: annotationId } });
  if (!annotation) return res.status(404).json({ message: "Annotation not found" });

  if (classId && classId !== annotation.classId) {
    await db.class.update({ where: { id: annotation.classId }, data: { count: { decrement: 1 } } });
    await db.class.update({ where: { id: classId }, data: { count: { increment: 1 } } });
  }

  const updated = await db.annotation.update({
    where: { id: annotationId },
    data: { xMin, yMin, width, height, classId },
    include: { class: true },
  });
  res.json(updated);
};

// DELETE /api/projects/:projectId/images/:imageId/annotations/:annotationId
export const deleteAnnotation = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);
  const annotationId = Number(req.params.annotationId);

  if (!(await ownsProject(projectId, req.userId!)))
    return res.status(404).json({ message: "Project not found" });

  const annotation = await db.annotation.findUnique({ where: { id: annotationId } });
  if (!annotation) return res.status(404).json({ message: "Annotation not found" });

  await db.annotation.delete({ where: { id: annotationId } });
  await db.class.update({ where: { id: annotation.classId }, data: { count: { decrement: 1 } } });

  res.json({ message: "Annotation deleted" });
};

// DELETE /api/projects/:projectId/images/:imageId/annotations  (clear all for image)
export const clearAnnotations = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);
  const imageId = Number(req.params.imageId);

  if (!(await ownsProject(projectId, req.userId!)))
    return res.status(404).json({ message: "Project not found" });

  const annotations = await db.annotation.findMany({ where: { imageId } });

  // Decrement counts per class
  const classCounts: Record<number, number> = {};
  for (const a of annotations) {
    classCounts[a.classId] = (classCounts[a.classId] || 0) + 1;
  }

  await db.annotation.deleteMany({ where: { imageId } });

  for (const [classId, count] of Object.entries(classCounts)) {
    await db.class.update({
      where: { id: Number(classId) },
      data: { count: { decrement: count } },
    });
  }

  res.json({ message: "All annotations cleared for image" });
};