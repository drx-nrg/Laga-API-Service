import { User } from "@prisma/client";
import { prisma } from "../database/database";
import { ResponseError } from "../error/ResponseError";
import { UpdateUserRequest } from "../model/user-model";
import { UserValidation } from "../validation/user-validation";
import { Validation } from "../validation/validation";

export type PaginateConfig = {
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
}

export interface SchemaProp {
    [key: string]: any
}

export class UserService {
    static async getUsers({ page, size, sortBy, sortDir }: PaginateConfig): Promise<User[]>{
        const users = await prisma.user.findMany({
            select: {
                user_id: true,
                firstname: true,
                lastname: true,
                username: true,
                bio: true,
                profile_picture: true,
                total_xp: true,
                total_score: true,
                created_at: true,
                updated_at: true,
            }
        }) as User[];

        let sortedUsers: User[] = [];

        if(sortDir === "desc"){
            if(["total_score","total_xp"].includes(sortBy)){
                sortedUsers = users.slice().sort((a: SchemaProp, b: SchemaProp) => b[sortBy] - a[sortBy]);
            }
            else if(sortBy === "created_at"){
                sortedUsers = users.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            }
            else if(sortBy === "username"){
                sortedUsers = users.slice().sort((a, b) => b.username.localeCompare(a.username));
            }
        }else if(sortDir === "asc"){
            if(["total_score","total_xp"].includes(sortBy)){
                sortedUsers = users.slice().sort((a: SchemaProp, b: SchemaProp) => a[sortBy] - b[sortBy]);
            }
            else if(sortBy === "created_at"){
                sortedUsers = users.slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            }
            else if(sortBy === "username"){
                sortedUsers = users.slice().sort((a, b) => a.username.localeCompare(b.username));
            } 
        }

        if(size > users.length){
            size = users.length;
        }

        const totalPage = Math.ceil(users.length / (size || 10));

        if(page > totalPage){
            page = totalPage;
        }

        let items: User[] = [];

        const startIndex = page * size;
        const endIndex = startIndex + size;

        for(let i = startIndex; i < endIndex; i++){
            items.push(sortedUsers[i]);
        }

        return items;
    }

    static async getUserDetail(username: string): Promise<User>{
        const user = await prisma.user.findUnique({
            where: {
              username  
            }
        });

        if(!user){
            throw new ResponseError(404, "User not found");
        }

        return user;
    }

    static async updateUser(request: UpdateUserRequest, id: number): Promise<User> {
        const updateRequest = Validation.validate(UserValidation.UPDATE, request);

        const user = await prisma.user.findUnique({
            where: {
                user_id: id
            }
        });

        if(!user){
            throw new ResponseError(404, "User not found");
        }

        return await prisma.user.update({
            where: {
                user_id: id
            },
            data: updateRequest
        });
    }

    static async deleteUser(id: number): Promise<User>{
        const user = await prisma.user.findUnique({
            where: {
                user_id: id
            }
        });

        if(!user){
            throw new ResponseError(404, "User not found");
        }

        return await prisma.user.delete({
            where: {
                user_id: id
            }
        })
    }
}