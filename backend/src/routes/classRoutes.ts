import express from "express";
import { getClasses, createClass, deleteClass } from "../controllers/classController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);

router.get("/:projectId/classes", getClasses);
router.post("/:projectId/classes", createClass);
router.delete("/:projectId/classes/:classId", deleteClass);

export default router;