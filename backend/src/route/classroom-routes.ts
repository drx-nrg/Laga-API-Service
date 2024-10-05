import express from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { ClassroomController } from "../controller/classroom-controller";

export const classroomRoutes = express.Router();

classroomRoutes.get('/', authMiddleware, ClassroomController.index);
classroomRoutes.get('/:slug', authMiddleware, ClassroomController.show);