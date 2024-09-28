import { NextFunction, Request, Response } from "express";
import { CreateUserRequest, UserRequest } from "../model/user-model";
import { AuthService } from "../service/auth-service";

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction){
        try {
            const request: CreateUserRequest = req.body as CreateUserRequest;
            const response = await AuthService.register(request);
            res.status(201).json({
                status: "success",
                message: "User successfully registered",
                data: response
            })
        } catch (error) {
            next(error)
        }
    }

    static async oauth2Login(req: Request, res: Response, next: NextFunction){
        try {
            const { code } = req.query;
            const { dataToSend: data, refreshToken, refreshTokenExpiration } = await AuthService.oauth2Login(code as string);
            
            res.cookie("laga_refresh_token", refreshToken, {
                maxAge: refreshTokenExpiration,
                httpOnly: true,
                secure: false,
            });

            res.status(200).json({
                status: "success",
                message: "Authentication success with google credential",
                data: data
            })
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction){
        try {
            const request: UserRequest = req.body as UserRequest;
            const response = await AuthService.login(request);
            res.status(200).json({
                status: "success",
                message: "User successfully login",
                data: response
            })
        } catch (error) {
            next(error);
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction){
        try {
            // Logout logic here
        } catch (error) {
            next(error);
        }
    }
}