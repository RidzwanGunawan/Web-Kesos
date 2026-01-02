import { Router } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const prisma = new PrismaClient();
const router = Router();

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const permissions = await prisma.permission.findMany({
    where: { roles: { some: { role: { name: req.user.role } } } },
    select: { name: true }
  });
  const permissionNames = permissions.map((p) => p.name);
  return res.json({
    id: req.user.sub,
    username: req.user.username,
    role: req.user.role,
    nama: req.user.nama,
    kelurahan: req.user.kelurahan || null,
    permissions: permissionNames
  });
});

router.get('/roles', authenticateToken, requirePermission('users.manage'), async (_req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' }
    });
    return res.json({ data: roles });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/', authenticateToken, requirePermission('users.manage'), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, nama_lengkap: true, username: true, role: true, kelurahan: true, createdAt: true }
    });
    return res.json({ data: users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', authenticateToken, requirePermission('users.manage'), async (req, res) => {
  const { nama_lengkap, username, password, role, kelurahan } = req.body;
  if (!nama_lengkap || !username || !password || !role) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const roleExists = await prisma.role.findUnique({ where: { name: role } });
    if (!roleExists) {
      return res.status(400).json({ success: false, message: 'Role not found' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { nama_lengkap, username, password: hashed, role, kelurahan: kelurahan || null }
    });
    return res.status(201).json({
      success: true,
      data: { id: user.id, nama_lengkap: user.nama_lengkap, username: user.username, role: user.role, kelurahan: user.kelurahan }
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, requirePermission('users.manage'), async (req, res) => {
  const { id } = req.params;
  const { nama_lengkap, username, password, role, kelurahan } = req.body;
  if (!nama_lengkap && !username && !password && !role && !kelurahan) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }

  try {
    const data: any = {};
    if (nama_lengkap) data.nama_lengkap = nama_lengkap;
    if (username) data.username = username;
    if (role) {
      const roleExists = await prisma.role.findUnique({ where: { name: role } });
      if (!roleExists) {
        return res.status(400).json({ success: false, message: 'Role not found' });
      }
      data.role = role;
    }
    if (password) data.password = await bcrypt.hash(password, 10);
    if (kelurahan !== undefined) data.kelurahan = kelurahan;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
      select: { id: true, nama_lengkap: true, username: true, role: true, kelurahan: true }
    });

    return res.json({ success: true, data: user });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

export default router;
