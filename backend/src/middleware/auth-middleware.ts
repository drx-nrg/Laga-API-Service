import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserJWTPayload } from "../model/user-model";
import { prisma } from "../database/database";
import { RequestWithUser } from "../type/RequestWithUser";

dotenv.config();

export const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const authHeader: string = req.headers.authorization || "";
    const token: string = authHeader.split(" ")[1];

    if(!token){
        res.status(401).json({
            status: "Unauthorized",
            message: "Invalid or empty token"
        });
        return;
    }

    try {
        const { id, username, email } = jwt.verify(token, process.env.JWT_SECRET as string) as UserJWTPayload;
        const user = await prisma.user.findUnique({
            where: { username: username || "" },
        });
        
        if(!user || user.user_id !== Number(id) || user.email !== email) {
            res.status(401).json({
                status: "Unauthorized",
                message: "Invalid or empty token"
            });

            return;
        }

        req.user = user;
        next();
    } catch (error: any) {
        if(error.name === "TokenExpiredError"){
            res.status(403).json({
                status: "unauthorized",
                message: "Token expired, please refresh!"
            });
        }else{
            res.status(500).json({
                status: "invalid",
                message: "Internal Server Error"
            });
        }
        return; 
    }
}