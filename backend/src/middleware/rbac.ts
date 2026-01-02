import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    sub: number;
    username: string;
    role: string;
    nama: string;
  };
}

export function rbacMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // Middleware untuk RBAC check
  // Gunakan ini pada route yang membutuhkan pengecekan role tertentu
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

export function checkKelurahanAccess(kelurahan: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    // Master dapat akses semua
    if (req.user.role === 'master') return next();
    
    // Mapping role ke kelurahan
    const roleKelurahanMap: { [key: string]: string } = {
      'cgd': 'Cigadung',
      'chg': 'Cihaurgeulis',
      'ngl': 'Neglasari',
      'skl': 'Sukaluyu'
    };
    
    const userKelurahan = roleKelurahanMap[req.user.role];
    if (!userKelurahan || userKelurahan !== kelurahan) {
      return res.status(403).json({ success: false, message: 'Forbidden: no access to this kelurahan' });
    }
    
    next();
  };
}
