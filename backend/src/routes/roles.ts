import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authenticateToken, requirePermission('roles.manage'), async (_req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    });
    const data = roles.map((role) => ({
      id: role.id,
      name: role.name,
      label: role.label,
      permissions: role.permissions.map((rp) => rp.permission)
    }));
    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/permissions', authenticateToken, requirePermission('roles.manage'), async (_req, res) => {
  try {
    const permissions = await prisma.permission.findMany({ orderBy: { id: 'asc' } });
    return res.json({ data: permissions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', authenticateToken, requirePermission('roles.manage'), async (req, res) => {
  const { name, label } = req.body;
  if (!name || !label) {
    return res.status(400).json({ success: false, message: 'Nama dan label role dibutuhkan' });
  }

  try {
    const role = await prisma.role.create({ data: { name, label } });
    return res.status(201).json({ success: true, data: role });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, requirePermission('roles.manage'), async (req, res) => {
  const { id } = req.params;
  const { name, label } = req.body;
  if (!name && !label) {
    return res.status(400).json({ success: false, message: 'Tidak ada perubahan' });
  }

  try {
    const role = await prisma.role.update({
      where: { id: parseInt(id) },
      data: {
        ...(name ? { name } : {}),
        ...(label ? { label } : {})
      }
    });
    return res.json({ success: true, data: role });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

router.put('/:id/permissions', authenticateToken, requirePermission('roles.manage'), async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body as { permissions?: number[] };
  if (!permissions || !Array.isArray(permissions)) {
    return res.status(400).json({ success: false, message: 'Permissions dibutuhkan' });
  }

  try {
    const roleId = parseInt(id);
    await prisma.rolePermission.deleteMany({ where: { roleId } });
    for (const permId of permissions) {
      await prisma.rolePermission.create({
        data: { roleId, permissionId: permId }
      });
    }
    return res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, requirePermission('roles.manage'), async (req, res) => {
  const { id } = req.params;
  try {
    const role = await prisma.role.findUnique({ where: { id: parseInt(id) } });
    if (!role) return res.status(404).json({ success: false, message: 'Role tidak ditemukan' });

    const userCount = await prisma.user.count({ where: { role: role.name } });
    if (userCount > 0) {
      return res.status(400).json({ success: false, message: 'Role masih dipakai oleh user' });
    }

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.role.delete({ where: { id: role.id } });
    return res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

export default router;
