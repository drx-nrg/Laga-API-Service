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

    static async oauth2Login(code: string){
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
        const { token: refreshToken } = generateRefreshToken(user);
        const accessToken = generateToken({ id, username, email });

        const refreshTokenExpiration = Date.now() + dateConverter(process.env.REFRESH_TOKEN_LIFETIME as string)
        const refreshTokenExpirationDate: Date = new Date(refreshTokenExpiration);

        await prisma.refreshToken.create({
            data: {
                user_id: user.user_id,
                token: refreshToken,
                expires_at: refreshTokenExpirationDate,
            }
        })

        const dataToSend: AuthUserResponse = toAuthUserResponse(user);
        dataToSend.token = accessToken;

        return { dataToSend, refreshToken, refreshTokenExpiration };
    }

    static async login(request: UserRequest): Promise<AuthUserResponse>{
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

        const token: string = generateToken({
            id: Number(user.user_id),
            username: user.username,
            email: user.email
        } as UserJWTPayload);

        const result: AuthUserResponse = toAuthUserResponse(user);
        result.token = token;
        return result;
    }

    static async logout(): Promise<boolean>{
        return true;
    }
}