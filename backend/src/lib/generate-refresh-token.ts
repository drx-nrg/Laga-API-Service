import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateRefreshToken = (
  user: User
): { token: string; expirationDate: number } => {
  const { user_id, username } = user;
  const token = jwt.sign(
    { user_id, username },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: process.env.REFRESH_TOKEN_LIFETIME as string }
  );
  const expirationDate: number = new Date(Date.now() + (1000 * 60 * 60 * 24 * 7)).getTime();
  return { token, expirationDate };
};
