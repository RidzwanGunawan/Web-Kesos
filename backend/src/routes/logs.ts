import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authenticateToken, requirePermission('logs.view'), async (req, res) => {
  const { page = '1', limit = '50' } = req.query;

  try {
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const logs = await prisma.logPerubahan.findMany({
      include: {
        // If you add users relationship in Prisma schema
      },
      orderBy: { waktu: 'desc' },
      skip,
      take
    });

    const total = await prisma.logPerubahan.count();

    return res.json({
      data: logs,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
