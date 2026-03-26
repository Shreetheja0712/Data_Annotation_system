import { Response } from "express";
import db from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";
import archiver from "archiver";

// GET /api/projects/:projectId/export
// Streams a zip containing annotations.csv and classes.txt
export const exportProject = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.projectId);

  const project = await db.project.findFirst({
    where: { id: projectId, userId: req.userId },
  });
  if (!project) return res.status(404).json({ message: "Project not found" });

  // --- Fetch all classes for this project, ordered by id ---
  const classes = await db.class.findMany({
    where: { projectId },
    orderBy: { id: "asc" },
  });

  // Build class_id lookup: db id -> sequential 0-based index
  const classIndexMap: Record<number, number> = {};
  classes.forEach((cls, index) => {
    classIndexMap[cls.id] = index;
  });

  // --- classes.txt ---
  // Format:  <index> <className>
  const classesTxt = classes
    .map((cls, index) => `${index} ${cls.className}`)
    .join("\n");

  // --- Fetch all images with their annotations ---
  const images = await db.image.findMany({
    where: { projectId },
    include: {
      annotations: {
        include: { class: true },
      },
    },
    orderBy: { id: "asc" },
  });

  // --- annotations.csv ---
  const csvRows: string[] = [
    "image_name,object_count_in_image,x_min,y_min,height,width,class_id",
  ];

  for (const image of images) {
    const objectCount = image.annotations.length;
    if (objectCount === 0) continue; // skip unannotated images

    for (const ann of image.annotations) {
      const classId = classIndexMap[ann.classId] ?? ann.classId;
      csvRows.push(
        [
          image.fileName,
          objectCount,
          ann.xMin.toFixed(4),
          ann.yMin.toFixed(4),
          ann.height.toFixed(4),
          ann.width.toFixed(4),
          classId,
        ].join(",")
      );
    }
  }

  const csvContent = csvRows.join("\n");

  // --- Stream as zip ---
  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${project.name}-export.zip"`
  );

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);

  archive.append(csvContent, { name: "annotations.csv" });
  archive.append(classesTxt, { name: "classes.txt" });

  await archive.finalize();
};