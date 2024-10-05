import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ResponseError } from './../error/ResponseError';
import { errorFormatter } from "../lib/error-formatter";

export const errorMiddleware = async (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof ZodError) {
        res.status(400).json({
            status: "invalid",
            message: "Invalid Field",
            errors: errorFormatter(error)
        });
    } else if (error instanceof ResponseError) {
        res.status(error.status).json({
            status: "invalid",
            message: error.message
        });
    } else {
        res.status(500).json({
            status: "invalid",
            message: "Internal Server Error"
        });
    }
}