import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv'
import { AuthController } from '../controller/auth-controller';
import { AuthService } from '../service/auth-service';
import { authMiddleware } from '../middleware/auth-middleware';

dotenv.config();

export const authRoutes: Router = express.Router();

authRoutes.get('/google', (req: Request, res: Response) => res.redirect(AuthService.authorizationUrl));
authRoutes.get('/google/callback', AuthController.oauth2Login)
authRoutes.post('/signup', AuthController.register);
authRoutes.post('/signin', AuthController.login);
authRoutes.post('/signout', authMiddleware, AuthController.logout);
authRoutes.post('/refresh-token', authMiddleware, AuthController.refresh);
