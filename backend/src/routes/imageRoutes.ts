import express from "express";
import { upload, uploadImages, getImages, deleteImage } from "../controllers/imageController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);

router.post("/:projectId/images", upload.array("images", 500), uploadImages);
router.get("/:projectId/images", getImages);
router.delete("/:projectId/images/:imageId", deleteImage);

export default router;