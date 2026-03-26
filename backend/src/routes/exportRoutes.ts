import express from "express";
import { exportProject } from "../controllers/exportController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);

router.get("/:projectId/export", exportProject);

export default router;