import { User } from "@prisma/client"

export type AuthUserResponse = {
    firstname: string,
    lastname: string,
    username: string,
    email: string,
    token?: string
}

export interface UserRequest {
    username: string,
    password: string
}

export interface CreateUserRequest extends UserRequest {
    firstname: string,
    lastname: string,
    email: string,
}

export interface UpdateUserRequest {
    firstname: string,
    lastname: string,
    username: string,
    bio: string
}

export type UserJWTPayload = {
    id: number,
    username: string,
    email: string
}

export function toAuthUserResponse(user: User): AuthUserResponse {
    return {
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email 
    }
}