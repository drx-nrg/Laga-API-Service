import { Classroom } from "@prisma/client";
import { prisma } from "../database/database";
import { PaginateConfig, SchemaProp } from "./user-service";
import { ResponseError } from "../error/ResponseError";
import { Validation } from "../validation/validation";
import { ClassroomValidation } from "../validation/classroom-validation";
import { ClassroomRequest } from "../model/classroom-model";
import { generateSlug } from "../lib/generate-slug";

export interface PaginatedDataSchema<T> {
    page: number,
    size: number,
    total: number,
    data: T
}

const columnShown = {
    classroom_id: true,
    title: true,
    slug: true,
    description: true,
    creator_id: true,
    classroom_picture: true,
    max_students: true,
    creator: {
        select: {
            user_id: true,
            username: true,
            firstname: true,
            lastname: true,
            bio: true,
            profile_picture: true,
            total_score: true,
            total_xp: true
        }
    },
    students: true,
    topics: true,
    created_at: true,
    updated_at: true,
}

export class ClassroomService {
    static async getClassrooms({ page, size, sortBy, sortDir }: PaginateConfig): Promise<PaginatedDataSchema<Classroom[]>>{
        let classrooms: any = await prisma.classroom.findMany({
            select: columnShown
        });
        classrooms = classrooms.map((cls: any) => {
            const { created_at, updated_at } = cls;
            delete cls.created_at;
            delete cls.updated_at;
            const data = { ...cls, total_students: cls.students.length, created_at, updated_at };
            delete data.students;
            return data
        });

        const totalPage: number = Math.ceil(classrooms.length / size);
        let sortedData: Classroom[] = [];

        if(page > totalPage) page = totalPage;
        if(size > classrooms.length) size = classrooms.length;

        if(sortDir === "asc"){
            if(["total_students", "max_students"].includes(sortBy))
                sortedData = classrooms.toSorted((a: SchemaProp, b: SchemaProp) => a[sortBy] - b[sortBy]);
            else if(sortBy === "title")
                sortedData = classrooms.toSorted((a: SchemaProp, b: SchemaProp) => a.title.localeCompare(b.title));
            else if(sortBy === "created_at")
                sortedData = classrooms.toSorted((a: SchemaProp, b: SchemaProp) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }else if(sortDir === "desc"){
            if(["total_students", "max_students"].includes(sortBy))
                sortedData = classrooms.toSorted((a: SchemaProp, b: SchemaProp) => b[sortBy] - a[sortBy]);
            else if(sortBy === "title")
                sortedData = classrooms.toSorted((a: SchemaProp, b: SchemaProp) => b.title.localeCompare(a.title));
            else if(sortBy === "created_at")
                sortedData = classrooms.toSorted((a: SchemaProp, b: SchemaProp) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        return {
            page,
            size,
            total: totalPage,
            data: sortedData
        };
    }

    static async getClassroomDetail(slug: string): Promise<Classroom> {
        const classroom = await prisma.classroom.findFirst({
            where: { slug },
            select: columnShown
        }) as any;

        if(!classroom){
            throw new ResponseError(404, "Classroom not found");
        }

        const studentIDs = classroom.students.map((cl: any) => Number(cl.user_id));
        delete classroom.creator.password;
        delete classroom.creator.email;
        const data = { 
            ...classroom, 
            creator: classroom.creator,
            total_students: classroom.students.length, 
            students: await prisma.user.findMany({
                where: {
                    user_id: {
                        in: studentIDs
                    }
                },
                select: {
                    user_id: true,
                    firstname: true,
                    lastname: true,
                    username: true,
                    bio: true,
                    total_score: true,
                    total_xp: true,
                    created_at: true,
                    updated_at: true,
                }
            }),
        }

        return data;
    }

    static async createClassroom({ user_id, data }: { user_id: number, data: ClassroomRequest }): Promise<Classroom> {
        const createRequest = Validation.validate(ClassroomValidation.MODIFIABLE, data);
        let slug = generateSlug(createRequest.title);

        const classroom = await prisma.classroom.findUnique({
            where: { slug }
        });

        if(classroom){
            const lastClassroom = await prisma.classroom.findMany();
            slug += `-${lastClassroom[lastClassroom.length - 1].classroom_id}`;
        }

        return await prisma.classroom.create({
            data: { ...createRequest, slug, creator_id: user_id }
        })
    }

    static async updateClassroom({ slug, user_id, data }: { slug: string, user_id: number, data: ClassroomRequest }): Promise<Classroom> {
        const createRequest = Validation.validate(ClassroomValidation.CREATE, data);

        const classroom = await prisma.classroom.findFirst({
            where: { slug }
        });

        if(!classroom){
            throw new ResponseError(404, "Classroom not found");
        }

        if(classroom.creator_id !== user_id){
            throw new ResponseError(403, "You are not the creator");
        }

        return await prisma.classroom.update({
            where: { slug },
            data: createRequest
        });
    }

    static async deleteClassroom({ slug, user_id }: { slug: string, user_id: number }): Promise<Classroom>{
        const classroom = await prisma.classroom.findUnique({
            where: { slug }
        });

        if(!classroom){
            throw new ResponseError(404, "Classroom not found");
        }
        
        if(classroom.creator_id !== user_id){
            throw new ResponseError(403, "You are not the creator");
        }

        return await prisma.classroom.delete({
            where: { slug }
        });
    }
}