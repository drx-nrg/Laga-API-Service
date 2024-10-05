import { ZodType, z } from "zod";

export class ClassroomValidation {
    static readonly MODIFIABLE: ZodType = z.object({
        title: z.string({ message: "Title must be a string" }).min(3).max(200),
        description: z.string({ message: "Title must be a string" }).min(3),
        classroom_picture: z.string().url({ message: "Classroom picture must be a valid image url" }).optional().nullable(),
        max_students: z.number().max(50, { message: "Max Students cannot more than 50" }),
    });

    static readonly CREATE: ZodType = this.MODIFIABLE;
}