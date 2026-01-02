import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: 'Username dan password dibutuhkan.' });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const permissions = await prisma.permission.findMany({
    where: { roles: { some: { role: { name: user.role } } } },
    select: { name: true }
  });
  const permissionNames = permissions.map((p) => p.name);

  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    nama: user.nama_lengkap,
    kelurahan: user.kelurahan || null
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
  const refresh = jwt.sign({ sub: user.id }, process.env.REFRESH_TOKEN_SECRET || 'refresh', { expiresIn: '7d' });

  // Set httpOnly cookie for refresh token
  res.cookie('refreshToken', refresh, { httpOnly: true, sameSite: 'lax' });

  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      nama: user.nama_lengkap,
      username: user.username,
      role: user.role,
      kelurahan: user.kelurahan || null,
      permissions: permissionNames
    }
  });
}
