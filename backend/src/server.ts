import "dotenv/config";  //
import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import imageRoutes from "./routes/imageRoutes";
import annotationRoutes from "./routes/annotationRoutes";
import classRoutes from "./routes/classRoutes";
import exportRoutes from "./routes/exportRoutes";


const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Add this after your existing app.use("/uploads", ...) line:
app.use(express.static(path.join(__dirname, "../client")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", imageRoutes);
app.use("/api/projects", annotationRoutes);
app.use("/api/projects", classRoutes);
app.use("/api/projects", exportRoutes);
app.use("/api/projects", projectRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;