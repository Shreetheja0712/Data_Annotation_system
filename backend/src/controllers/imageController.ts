import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import db from "../config/db";
import path from "path";
import fs from "fs";
import multer from "multer";

// Multer storage config — saves to /uploads/<projectId>/
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const projectId = req.params.projectId;
    const dir = path.join(__dirname, "../../uploads", projectId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};

export const upload = multer({ storage, fileFilter });

// POST /api/projects/:projectId/images  (multipart, field: "images")
export const uploadImages = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);

  // Verify ownership
  const project = await db.project.findFirst({
    where: { id: projectId, userId: req.userId },
  });
  if (!project) return res.status(404).json({ message: "Project not found" });

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0)
    return res.status(400).json({ message: "No images uploaded" });

  const created = await db.$transaction(
    files.map((file) =>
      db.image.create({
        data: {
          fileName: file.originalname,
          filePath: `/uploads/${projectId}/${file.filename}`,
          projectId,
        },
      })
    )
  );

  res.status(201).json(created);
};

// GET /api/projects/:projectId/images
export const getImages = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);

  const project = await db.project.findFirst({
    where: { id: projectId, userId: req.userId },
  });
  if (!project) return res.status(404).json({ message: "Project not found" });

  const images = await db.image.findMany({
    where: { projectId },
    include: {
      _count: { select: { annotations: true } },
    },
    orderBy: { id: "asc" },
  });

  res.json(images);
};

// DELETE /api/projects/:projectId/images/:imageId
export const deleteImage = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);
  const imageId = Number(req.params.imageId);

  const project = await db.project.findFirst({
    where: { id: projectId, userId: req.userId },
  });
  if (!project) return res.status(404).json({ message: "Project not found" });

  const image = await db.image.findFirst({ where: { id: imageId, projectId } });
  if (!image) return res.status(404).json({ message: "Image not found" });

  // Remove file from disk
  const diskPath = path.join(__dirname, "../../", image.filePath);
  if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);

  await db.image.delete({ where: { id: imageId } });
  res.json({ message: "Image deleted" });
};