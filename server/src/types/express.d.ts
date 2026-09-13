import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      id?: string | Types.ObjectId;
      user?: {
        _id: Types.ObjectId | string;
        email?: string;
        userName?: string;
      };
    }
  }
}

export {};