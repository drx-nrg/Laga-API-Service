import express, { Router } from 'express';
import { UserController } from '../controller/user-controller';
import { authMiddleware } from '../middleware/auth-middleware';

export const userRoutes: Router = express.Router();

userRoutes.get('/', authMiddleware, UserController.index);
userRoutes.get('/:username', authMiddleware, UserController.show);
userRoutes.put('/:id', authMiddleware, UserController.update);
userRoutes.delete('/:id', authMiddleware, UserController.destroy);