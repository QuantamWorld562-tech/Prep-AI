// Extend the Express Request interface to include custom properties
declare namespace Express {
  interface Request {
    id?: string;
  }
}
