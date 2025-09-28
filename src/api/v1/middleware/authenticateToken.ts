import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpCode } from '../helpers/HttpCode';

interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(HttpCode.UNAUTHORIZED).json({ status: HttpCode.UNAUTHORIZED, message: "Unauthorized" });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(HttpCode.UNAUTHORIZED).json({ status: HttpCode.UNAUTHORIZED, message: err.message });

      req.user = decoded as JwtPayload;

      next();
    });

  } catch (error) {
    res.status(HttpCode.UNAUTHORIZED).json({ status: HttpCode.UNAUTHORIZED, message: 'Invalid token' });
  }
};
