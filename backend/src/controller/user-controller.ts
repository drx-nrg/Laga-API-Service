import { NextFunction, Request, Response } from "express";
import { CreateUserRequest, UpdateUserRequest, UserRequest } from "../model/user-model";
import { PaginateConfig, UserService } from "../service/user-service";
import { User } from "@prisma/client";
import { AuthService } from "../service/auth-service";

export class UserController {
    static async index(req: Request, res: Response, next: NextFunction){
        try {
            const paginateConfig: PaginateConfig = {
                page: Number(req.query.page) || 0,
                size: Number(req.query.size) || 10,
                sortBy: req.query.sortBy?.toString() || "username",
                sortDir: req.query.sortDir?.toString() || "asc",
            }
            const response = await UserService.getUsers(paginateConfig);
            res.status(200).json({
                status: "success",
                message: "User data retrieved successfully",
                data: response
            })
        } catch (error) {
            next(error);
        }
    }

    static async show(req: Request, res: Response, next: NextFunction){
        try {
            const username: string = req.params.username || "";
            const response: User = await UserService.getUserDetail(username)
            res.status(200).json({
                status: "success",
                message: "User data successfully retrieved",
                data: response
            })
        } catch (error) {
            next(error);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction){
        try {
            const request: UpdateUserRequest = req.body as UpdateUserRequest;
            const userID: number = Number(req.params.id) || 0;
            const response: User = await UserService.updateUser(request, userID);
            res.status(200).json({
                status: "success",
                message: `User data with ID ${userID} sucessfully updated`,
                data: response
            });
        } catch (error) {
            next(error);
        }
    }
    
    static async destroy(req: Request, res: Response, next: NextFunction){
        try {
            const userID = Number(req.params.id) || 0;
            await UserService.deleteUser(userID);
            res.status(200).json({
                status: "success",
                message: `User data with ID ${userID} sucessfully deleted`,
            });
        } catch (error) {
            next(error);
        }
    }
}