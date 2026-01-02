import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { requireAnyPermission, requirePermission } from '../middleware/permissions';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authenticateToken, requireAnyPermission(['dashboard.view', 'data.read']), async (req, res) => {
  try {
    const kelurahan = await prisma.namaKelurahan.findMany();
    return res.json(kelurahan.map(k => k.nama_kelurahan));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/manage', authenticateToken, requirePermission('kelurahan.manage'), async (_req, res) => {
  try {
    const kelurahan = await prisma.namaKelurahan.findMany({ orderBy: { id: 'asc' } });
    return res.json({ data: kelurahan });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', authenticateToken, requirePermission('kelurahan.manage'), async (req, res) => {
  const { nama_kelurahan } = req.body;
  if (!nama_kelurahan) {
    return res.status(400).json({ success: false, message: 'Nama kelurahan dibutuhkan' });
  }

  try {
    const created = await prisma.namaKelurahan.create({
      data: { nama_kelurahan }
    });
    return res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, requirePermission('kelurahan.manage'), async (req, res) => {
  const { id } = req.params;
  const { nama_kelurahan } = req.body;
  if (!nama_kelurahan) {
    return res.status(400).json({ success: false, message: 'Nama kelurahan dibutuhkan' });
  }

  try {
    const updated = await prisma.namaKelurahan.update({
      where: { id: parseInt(id) },
      data: { nama_kelurahan }
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, requirePermission('kelurahan.manage'), async (req, res) => {
  const { id } = req.params;
  try {
    const kel = await prisma.namaKelurahan.findUnique({ where: { id: parseInt(id) } });
    if (!kel) return res.status(404).json({ success: false, message: 'Kelurahan tidak ditemukan' });

    const userCount = await prisma.user.count({ where: { kelurahan: kel.nama_kelurahan } });
    if (userCount > 0) {
      return res.status(400).json({ success: false, message: 'Kelurahan masih dipakai oleh user' });
    }

    await prisma.namaKelurahan.delete({ where: { id: parseInt(id) } });
    return res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

export default router;
