import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

interface AuthTokenPayload extends JwtPayload {
  userId: string;
}

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Check cookies first, fall back to Authorization Bearer header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
      return;
    }
    const secret = process.env.SECRET_KEY;
    if (!secret) {
      throw new Error("SECRET_KEY environment variable is not defined");
    }
    const decode = jwt.verify(token, secret) as AuthTokenPayload;

    if (!decode || !decode.userId) {
      res.status(401).json({
        message: "Invalid Token",
        success: false,
      });
      return;
    }

    req.id = decode.userId;

    next();
  } catch (error) {
    next(error);
  }
};

export default isAuthenticated;
