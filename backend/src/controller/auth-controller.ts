import { NextFunction, Request, Response } from "express";
import { CreateUserRequest, UserRequest } from "../model/user-model";
import { AuthService } from "../service/auth-service";
import { RequestWithUser } from "../type/RequestWithUser";

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
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction){
        try {
            const request: UserRequest = req.body as UserRequest;
            const { dataToSend: data, refreshToken, refreshTokenExpiration } = await AuthService.login(request);
            
            res.cookie("laga_refresh_token", refreshToken, {
                maxAge: refreshTokenExpiration,
                httpOnly: true,
                secure: false,
            });

            res.status(200).json({
                status: "success",
                message: "User successfully login",
                data: data
            });
        } catch (error) {
            next(error);
        }
    }

    static async logout(req: RequestWithUser, res: Response, next: NextFunction){
        try {
            await AuthService.logout(Number(req.user?.user_id || "0"));
            res.cookie("laga_refresh_token", "", {
                maxAge: 0,
                httpOnly: true,
                secure: false,
            });
            res.status(200).json({
                status: "success",
                message: "User successfully logged out",
            });
        } catch (error) {
            next(error);
        }
    }

    static async refresh(req: Request, res: Response, next: NextFunction){
        try {
            const refreshToken: string = req.cookies["laga_refresh_token"] || "";
            const response = await AuthService.refreshToken(refreshToken);
            res.status(200).json({
                status: "success",
                message: "Token successfully refresh",
                accessToken: response
            });
        } catch (error) {
            next(error);
        }
    }
}