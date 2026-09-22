import type { Request, Response, NextFunction } from "express";
import { User, type IUser } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { CookieOptionsType } from "../types/index.js";

const cookieOptions: CookieOptionsType = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─── Sign Up ─────────────────────────────────────────────────────────────────

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      res.status(400).json({ success: false, message: "Missing fields" });
      return;
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      res.status(400).json({ success: false, message: "Email already in use" });
      return;
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      email,
      password: hashPassword,
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY as string,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, cookieOptions).status(201).json({
      success: true,
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Missing fields" });
      return;
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (!user.password) {
      res
        .status(500)
        .json({ success: false, message: "Password data missing" });
      return;
    }

    const matchPassword = bcrypt.compareSync(password, user.password);
    if (!matchPassword) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY as string,
      { expiresIn: "7d" },
    );

    res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({
        success: true,
        message: `Welcome back ${user.userName}`,
        user,
      });
  } catch (error) {
    next(error);
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.clearCookie("token", cookieOptions);
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};
