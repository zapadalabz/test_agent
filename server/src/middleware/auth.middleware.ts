// server/src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Explicitly define the payload structure
export interface TokenPayload {
  userId: string;
  role: string;
}

// 2. Extend Request with the optional TokenPayload
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  try {
    // 3. Cast the decoded token to our strict interface
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // 1. Ensure the user exists on the request (meaning requireAuth ran first)
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized: No user found on request' });
    return;
  }

  // 2. Check if their role is strictly 'admin'
  if (req.user.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden: Admin privileges required' });
    return;
  }

  // 3. If they are an admin, let them through!
  next();
};