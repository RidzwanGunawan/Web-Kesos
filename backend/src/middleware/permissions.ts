import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from './auth';

const prisma = new PrismaClient();
const rolePermCache: Record<string, { perms: string[]; cachedAt: number }> = {};
const CACHE_TTL_MS = 60_000;

async function getRolePermissions(role: string): Promise<string[]> {
  const cached = rolePermCache[role];
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.perms;
  }

  const perms = await prisma.permission.findMany({
    where: {
      roles: {
        some: {
          role: { name: role }
        }
      }
    },
    select: { name: true }
  });

  const names = perms.map((p) => p.name);
  rolePermCache[role] = { perms: names, cachedAt: Date.now() };
  return names;
}

export function requirePermission(permission: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const perms = await getRolePermissions(req.user.role);
    if (!perms.includes(permission)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }
    req.user.permissions = perms;
    next();
  };
}

export function requireAnyPermission(permissions: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const perms = await getRolePermissions(req.user.role);
    if (!permissions.some((perm) => perms.includes(perm))) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }
    req.user.permissions = perms;
    next();
  };
}
