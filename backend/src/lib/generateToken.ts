import { UserJWTPayload } from "../model/user-model";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (payload: UserJWTPayload): string => {
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.ACCESS_TOKEN_LIFETIME || '15m',
  });
  return token;
};
