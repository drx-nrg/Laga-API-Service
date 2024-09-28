import express, { Router } from 'express';
import { UserController } from '../controller/user-controller';

export const userRoutes: Router = express.Router();

userRoutes.get('/', UserController.index);
userRoutes.get('/:username', UserController.show);
userRoutes.put('/:id', UserController.update);
userRoutes.delete('/:id', UserController.destroy);