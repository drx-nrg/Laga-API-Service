import { ZodType, z } from "zod";

export class UserValidation {
    static readonly MODIFIABLE: ZodType = z.object({
        firstname: z.string().min(1),
        lastname: z.string().min(1),
        username: z.string().min(3),
        email: z.string().email({ message: "Email must be an valid email address" }),
        password: z.string().min(8)
    })

    static readonly LOGIN: ZodType = z.object({
        username: z.string().min(3),
        password: z.string().min(8)
    });
    
    static readonly REGISTER: ZodType = this.MODIFIABLE
    static readonly UPDATE: ZodType = this.MODIFIABLE
}