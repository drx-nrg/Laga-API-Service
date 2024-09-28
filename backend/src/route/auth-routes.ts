import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv'
import { AuthController } from '../controller/auth-controller';
import { AuthService } from '../service/auth-service';

dotenv.config();

export const authRoutes: Router = express.Router();

authRoutes.get('/google', (req: Request, res: Response) => res.redirect(AuthService.authorizationUrl));
authRoutes.get('/google/callback', AuthController.oauth2Login)
authRoutes.post('/signup', AuthController.register);
authRoutes.post('/signin', AuthController.login);
