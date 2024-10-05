import { Validation } from "../validation/validation";
import { UserValidation } from "../validation/user-validation";
import { AuthUserResponse, CreateUserRequest, UserJWTPayload, UserRequest, toAuthUserResponse } from "../model/user-model";
import { prisma } from "../database/database";
import { google } from "googleapis";
import bcrypt from 'bcrypt';
import { ResponseError } from "../error/ResponseError";
import { generateToken } from "../lib/generateToken";
import { User } from "@prisma/client";
import { generateRefreshToken } from "../lib/generate-refresh-token";
import { dateConverter } from "../lib/date-converter";
import { verifyToken } from "../lib/verify-token";
import { Response } from "express";

interface SignInResponse<T> {
    dataToSend: T,
    refreshToken: string,
    refreshTokenExpiration: number
}

export class AuthService {
    static readonly oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:8000/api/v1/auth/google/callback'
    );
    
    static readonly scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ];
    
    static readonly authorizationUrl = this.oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: this.scopes,
        include_granted_scopes: true
    });

    static async register(request: CreateUserRequest): Promise<AuthUserResponse>{
        const registerRequest = Validation.validate(UserValidation.REGISTER, request);
        const { username } = registerRequest;

        const userExist = await prisma.user.count({
            where: {
                username
            }
        });

        if(userExist){
            throw new ResponseError(404, "Username already taken");
        }

        registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

        const user = await prisma.user.create({
            data: registerRequest
        });

        return toAuthUserResponse(user);
    }

    static async oauth2Login(code: string): Promise<SignInResponse<AuthUserResponse>>{
        const { tokens } = await this.oauth2Client.getToken(code as string);
        this.oauth2Client.setCredentials(tokens);
        
        const oauth2 = google.oauth2({
            auth: this.oauth2Client,
            version: 'v2'
        });

        const { data } = await oauth2.userinfo.get();

        let user: User = await prisma.user.findUnique({
            where: {
                email: data.email!
            }
        }) as User;

        if(!user){
            const userData = {
                firstname: data.given_name!,
                lastname: data.family_name!,
                username: `${data.given_name}_${data.family_name}`,
                email: data.email!,
                password: null,
                profile_picture: data.picture, 
            }

            user = await prisma.user.create({
                data: userData as User
            })
        }

        const { user_id: id, username, email } = user;
        const { token: refreshToken, expirationDate } = generateRefreshToken(user);
        const accessToken = generateToken({ id, username, email });

        await prisma.refreshToken.create({
            data: {
                user_id: user.user_id,
                token: refreshToken,
                expires_at: expirationDate,
            }
        })

        const dataToSend: AuthUserResponse = toAuthUserResponse(user);
        dataToSend.token = accessToken;

        return { dataToSend, refreshToken, refreshTokenExpiration: dateConverter(process.env.REFRESH_TOKEN_LIFETIME as string) };
    }

    static async login(request: UserRequest): Promise<SignInResponse<AuthUserResponse>>{
        const loginRequest = Validation.validate(UserValidation.LOGIN, request);

        const user = await prisma.user.findFirst({
            where: {
                username: loginRequest.username
            }
        });

        if(!user){
            throw new ResponseError(401, "Username or password is wrong");
        }

        const isValidPassword: boolean = bcrypt.compareSync(loginRequest.password, user.password!);
        if(!isValidPassword){
            throw new ResponseError(401, "Username or password is wrong");
        }

        const { user_id: id, username, email } = user;
        const { token: refreshToken, expirationDate } = generateRefreshToken(user);
        const accessToken = generateToken({ id, username, email });

        await prisma.refreshToken.create({
            data: {
                user_id: user.user_id,
                token: refreshToken,
                expires_at: expirationDate,
            }
        })

        const dataToSend: AuthUserResponse = toAuthUserResponse(user);
        dataToSend.token = accessToken;

        return { dataToSend, refreshToken, refreshTokenExpiration: dateConverter(process.env.REFRESH_TOKEN_LIFETIME as string) };
    }

    static async logout(user_id: number): Promise<any>{
        await prisma.refreshToken.deleteMany({
            where: { user_id }
        });
    }

    static async refreshToken(refreshToken: string): Promise<string>{
        const { err, decoded } = await verifyToken(refreshToken);
        if(err){
            throw new ResponseError(401, "Invalid or expired refresh token, please log in", "unauthorized");
        }

        const { user_id, username } = decoded;
        const user = await prisma.user.findUnique({
            where: { username }
        });
        const validToken = await prisma.refreshToken.findFirst({
            where: {
                token: refreshToken,
                user_id
            }
        });

        if(!user || user.user_id !== user_id || !validToken){
            throw new ResponseError(401, "Invalid or expired refresh token, please log in", "unauthorized");
        }

        const accessToken = generateToken({
            id: user.user_id,
            username: user.username,
            email: user.email,
        } as UserJWTPayload);

        return accessToken;
    }       
}