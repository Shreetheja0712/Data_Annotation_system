import express from "express";
import {
  getAnnotations,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  clearAnnotations,
} from "../controllers/annotationController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);

router.get("/:projectId/images/:imageId/annotations", getAnnotations);
router.post("/:projectId/images/:imageId/annotations", createAnnotation);
router.put("/:projectId/images/:imageId/annotations/:annotationId", updateAnnotation);
router.delete("/:projectId/images/:imageId/annotations/:annotationId", deleteAnnotation);
router.delete("/:projectId/images/:imageId/annotations", clearAnnotations);

export default router;