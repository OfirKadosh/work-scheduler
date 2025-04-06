import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

interface JwtPayload {
  userId: string;
  role: "admin" | "worker";
}

// Middleware לבדוק JWT מה-Headers
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).user = decoded; // מצרפים את המשתמש לבקשה
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
