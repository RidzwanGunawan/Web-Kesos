import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const prisma = new PrismaClient();
const router = Router();

const tables = [
  'data_paud', 'data_tk', 'data_sekolah', 'data_slb',
  'data_masyarakat_miskin', 'data_disabilitas', 'data_pmks',
  'data_perpustakaan_rw', 'data_bantuan_sosial',
  'laporan_sholat_idul_fitri', 'laporan_sholat_idul_adha',
  'data_hewan_qurban', 'data_penyaluran_zakat', 'data_lansia_terlantar',
  'data_sarana_kesehatan', 'data_tempat_ibadah'
];

router.get('/', authenticateToken, requirePermission('dashboard.view'), async (req: AuthRequest, res) => {
  const { kelurahan } = req.query;
  const userKelurahan = req.user?.kelurahan || null;

  try {
    const stats = [];

    for (const table of tables) {
      const params: any[] = [];
      let whereClause = '';
      if (userKelurahan) {
        if (kelurahan && kelurahan !== userKelurahan) {
          return res.status(403).json({ success: false, message: 'No access to this kelurahan' });
        }
        whereClause = ' WHERE kelurahan = ?';
        params.push(userKelurahan);
      } else if (kelurahan) {
        whereClause = ' WHERE kelurahan = ?';
        params.push(kelurahan);
      }

      let count = 0;
      try {
        const rows = await prisma.$queryRawUnsafe<any[]>(
          `SELECT COUNT(*) as total FROM ${table}${whereClause}`,
          ...params
        );
        count = Number(rows?.[0]?.total ?? 0);
      } catch (err) {
        console.error(`Failed to count table ${table}:`, err);
        count = 0;
      }
      const label = table
        .replace(/^data_/, '')
        .replace(/^laporan_/, '')
        .replace(/_/g, ' ')
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      stats.push({
        kategori: label,
        total: count
      });
    }

    return res.json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
