import { NextFunction, Response } from "express";
import { RequestWithUser } from "../type/RequestWithUser";
import { ClassroomService } from "../service/classroom-service";
import { PaginateConfig } from "../service/user-service";
import { ClassroomRequest } from "../model/classroom-model";

export class ClassroomController {
    static async index(req: RequestWithUser, res: Response, next: NextFunction): Promise<any>{
        try {
            const { query } = req;
            const config: PaginateConfig = {
                page: Number(query.page) || 0,
                size: Number(query.size) || 10,
                sortDir: query.sortDir?.toString() || "asc",
                sortBy: query.sortBy?.toString() || "title"
            }
            const response = await ClassroomService.getClassrooms(config);
            res.status(200).json({
                status: "success",
                message: "Classroom data successfully retrieved",
                data: response
            })
        } catch (error) {
            next(error);
        }
    }

    static async show(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const slug = req.params.slug || "";
            const response = await ClassroomService.getClassroomDetail(slug);
            res.status(200).json({
                status: "success",
                message: "Classroom data successfully retrieved",
                data: response
            });
        } catch (error) {
            next(error);
        }
    }

    static async store(req: RequestWithUser, res: Response, next: NextFunction){
        try {
            const request = req.body as ClassroomRequest;
            const response = await ClassroomService.createClassroom({ user_id: req.user?.user_id || 0, data: request });
            res.status(201).json({
                status: "success",
                message: "Classroom successfully added",
                data: response
            })
        } catch (error) {
            next(error);
        }
    }
    
    static async update(req: RequestWithUser, res: Response, next: NextFunction){
        try {
            const request = req.body as ClassroomRequest;
            const response = await ClassroomService.updateClassroom({ slug: req.params.slug, user_id: req.user?.user_id || 0, data: request });
            res.status(200).json({
                status: "success",
                message: "Classroom data successfully updated",
                data: response
            });
        } catch (error) {
            next(error)
        }
    }
    
    static async destroy(req: RequestWithUser, res: Response, next: NextFunction){
        try {
            await ClassroomService.deleteClassroom({ slug: req.params.slug, user_id: req.user?.user_id || 0 });
            res.status(200).json({
                status: "success",
                message: "Classroom successfully deleted",
            });
        } catch (error) {
            next(error)
        }
    }
}
