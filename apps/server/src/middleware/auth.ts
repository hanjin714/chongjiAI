import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt.js';
import { Role } from '../constants/enums.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    storeId?: string;
    role: Role;
    name: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: { code: 'UNAUTHORIZED', message: '未提供认证令牌' } 
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ 
      success: false, 
      error: { code: 'UNAUTHORIZED', message: '认证令牌无效或已过期' } 
    });
  }

  req.user = payload;
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: { code: 'UNAUTHORIZED', message: '未登录' } 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: { code: 'FORBIDDEN', message: '无权限访问' } 
      });
    }

    next();
  };
}
