export type TargetTier = "Service" | "Product" | "Big-Tech";

export type TaskCategory = "DSA" | "Development" | "Contest";

export type TaskStatus = "Pending" | "In Progress" | "Completed";

export interface CookieOptionsType {
  httpOnly: boolean;
  sameSite: "none" | "lax" | "strict";
  secure: boolean;
  maxAge: number;
}

export interface LPABumpPayload {
  taskId: string;
  newLpa: number;
  message: string;
}

//Strongly typed Socket.IO Event contracts
export interface ServerToClientEvents {
  lpaBump: (payload: LPABumpPayload) => void;
}

export interface ClientToServerEvents {
  joinRoom: (userId: string) => void;
}
