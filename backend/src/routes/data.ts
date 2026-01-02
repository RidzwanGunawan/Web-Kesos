import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { logChange } from '../services/logService';

const prisma = new PrismaClient();
const router = Router();

const validTables = [
  'data_paud', 'data_tk', 'data_sekolah', 'data_slb',
  'data_masyarakat_miskin', 'data_disabilitas', 'data_pmks',
  'data_perpustakaan_rw', 'data_bantuan_sosial',
  'laporan_sholat_idul_fitri', 'laporan_sholat_idul_adha',
  'data_hewan_qurban', 'data_penyaluran_zakat', 'data_lansia_terlantar',
  'data_sarana_kesehatan', 'data_tempat_ibadah'
];

const tableColumnsCache: Record<string, string[]> = {};
const tableColumnsMetaCache: Record<string, { name: string; type: string }[]> = {};

async function getTableColumns(table: string): Promise<string[] | null> {
  if (tableColumnsCache[table]) return tableColumnsCache[table];
  try {
    const rows = await prisma.$queryRawUnsafe<{ COLUMN_NAME: string }[]>(
      'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
      table
    );
    const columns = rows.map((row) => row.COLUMN_NAME);
    if (!columns.length) return null;
    tableColumnsCache[table] = columns;
    return columns;
  } catch (err) {
    console.error(`Failed to read columns for table ${table}:`, err);
    return null;
  }
}

async function getTableColumnsMeta(table: string): Promise<{ name: string; type: string }[] | null> {
  if (tableColumnsMetaCache[table]) return tableColumnsMetaCache[table];
  try {
    const rows = await prisma.$queryRawUnsafe<{ COLUMN_NAME: string; DATA_TYPE: string }[]>(
      'SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION',
      table
    );
    const columns = rows.map((row) => ({ name: row.COLUMN_NAME, type: row.DATA_TYPE }));
    if (!columns.length) return null;
    tableColumnsMetaCache[table] = columns;
    return columns;
  } catch (err) {
    console.error(`Failed to read columns meta for table ${table}:`, err);
    return null;
  }
}

function filterPayloadByColumns(payload: Record<string, unknown>, columns: string[]) {
  const filtered: Record<string, unknown> = {};
  for (const key of Object.keys(payload)) {
    if (key === 'id') continue;
    if (columns.includes(key)) {
      filtered[key] = payload[key];
    }
  }
  return filtered;
}

// GET /api/data/:table/meta - Get column metadata
router.get('/:table/meta', authenticateToken, requirePermission('data.read'), async (req: AuthRequest, res) => {
  const { table } = req.params;

  if (!validTables.includes(table)) {
    return res.status(400).json({ success: false, message: 'Invalid table name' });
  }

  try {
    const meta = await getTableColumnsMeta(table);
    if (!meta) {
      return res.status(400).json({ success: false, message: 'Table not found in database' });
    }
    return res.json({ columns: meta });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/data/:table - Get all records (dengan optional filter)
router.get('/:table', authenticateToken, requirePermission('data.read'), async (req: AuthRequest, res) => {
  const { table } = req.params;
  const { kelurahan, search, page = '1', limit = '50' } = req.query;

  if (!validTables.includes(table)) {
    return res.status(400).json({ success: false, message: 'Invalid table name' });
  }

  try {
    const columns = await getTableColumns(table);
    if (!columns) {
      return res.status(400).json({ success: false, message: 'Table not found in database' });
    }

    let whereClause: any = {};
    const userKelurahan = req.user?.kelurahan || null;

    // Filter by kelurahan jika bukan master
    if (userKelurahan) {
      if (kelurahan && kelurahan !== userKelurahan) {
        return res.status(403).json({ success: false, message: 'No access to this kelurahan' });
      }
      whereClause.kelurahan = userKelurahan;
    } else if (kelurahan) {
      whereClause.kelurahan = kelurahan as string;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    const params: any[] = [];
    let whereSql = '';
    if (whereClause.kelurahan) {
      whereSql = ' WHERE kelurahan = ?';
      params.push(whereClause.kelurahan);
    }

    // Search across all fields (basic implementation)
    if (search) {
      const allData = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM ${table}${whereSql}`,
        ...params
      );
      const filtered = allData.filter((item: any) =>
        Object.values(item).some((val) => String(val).toLowerCase().includes((search as string).toLowerCase()))
      );
      const paginated = filtered.slice(offset, offset + limitNum);
      return res.json({ data: paginated, total: filtered.length });
    }

    const data = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM ${table}${whereSql} ORDER BY id ASC LIMIT ? OFFSET ?`,
      ...params,
      limitNum,
      offset
    );
    const totalRows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as total FROM ${table}${whereSql}`,
      ...params
    );
    const total = Number(totalRows?.[0]?.total ?? 0);

    return res.json({ data, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/data/:table/:id - Get single record
router.get('/:table/:id', authenticateToken, requirePermission('data.read'), async (req: AuthRequest, res) => {
  const { table, id } = req.params;

  if (!validTables.includes(table)) {
    return res.status(400).json({ success: false, message: 'Invalid table name' });
  }

  try {
    const columns = await getTableColumns(table);
    if (!columns) {
      return res.status(400).json({ success: false, message: 'Table not found in database' });
    }

    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM ${table} WHERE id = ? LIMIT 1`,
      parseInt(id)
    );
    const record = rows[0];

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Check access
    const userKelurahan = req.user?.kelurahan || null;
    if (userKelurahan && record.kelurahan && userKelurahan !== record.kelurahan) {
      return res.status(403).json({ success: false, message: 'No access to this record' });
    }

    return res.json(record);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/data/:table - Create record
router.post('/:table', authenticateToken, requirePermission('data.write'), async (req: AuthRequest, res) => {
  const { table } = req.params;
  const { kelurahan, ...payload } = req.body;

  if (!validTables.includes(table)) {
    return res.status(400).json({ success: false, message: 'Invalid table name' });
  }

  if (!kelurahan) {
    return res.status(400).json({ success: false, message: 'Kelurahan is required' });
  }

  const kelurahanExists = await prisma.namaKelurahan.count({ where: { nama_kelurahan: kelurahan } });
  if (!kelurahanExists) {
    return res.status(400).json({ success: false, message: 'Kelurahan tidak terdaftar' });
  }

  // Check access
  const userKelurahan = req.user?.kelurahan || null;
  if (userKelurahan && userKelurahan !== kelurahan) {
    return res.status(403).json({ success: false, message: 'No access to this kelurahan' });
  }

  try {
    const columns = await getTableColumns(table);
    if (!columns) {
      return res.status(400).json({ success: false, message: 'Table not found in database' });
    }

    const filteredPayload = filterPayloadByColumns({ kelurahan, ...payload }, columns);
    const keys = Object.keys(filteredPayload);
    if (!keys.length) {
      return res.status(400).json({ success: false, message: 'No valid fields provided' });
    }

    const values = keys.map((key) => filteredPayload[key]);
    const placeholders = keys.map(() => '?').join(', ');

    await prisma.$executeRawUnsafe(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
      ...values
    );
    const inserted = await prisma.$queryRawUnsafe<any[]>(
      'SELECT LAST_INSERT_ID() as id'
    );
    const insertedId = Number(inserted?.[0]?.id);
    const createdRows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM ${table} WHERE id = ? LIMIT 1`,
      insertedId
    );
    const record = createdRows[0];

    // Log change
    if (record?.id) {
      await logChange(req.user!.username, 'tambah', table, record.id);
    }

    return res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

// PUT /api/data/:table/:id - Update record
router.put('/:table/:id', authenticateToken, requirePermission('data.write'), async (req: AuthRequest, res) => {
  const { table, id } = req.params;
  const payload = req.body;

  if (!validTables.includes(table)) {
    return res.status(400).json({ success: false, message: 'Invalid table name' });
  }

  try {
    const columns = await getTableColumns(table);
    if (!columns) {
      return res.status(400).json({ success: false, message: 'Table not found in database' });
    }

    // Check record exists and access
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM ${table} WHERE id = ? LIMIT 1`,
      parseInt(id)
    );
    const record = rows[0];

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const userKelurahan = req.user?.kelurahan || null;
    if (userKelurahan && userKelurahan !== record.kelurahan) {
      return res.status(403).json({ success: false, message: 'No access to this record' });
    }

    if (payload.kelurahan) {
      const kelurahanExists = await prisma.namaKelurahan.count({ where: { nama_kelurahan: payload.kelurahan } });
      if (!kelurahanExists) {
        return res.status(400).json({ success: false, message: 'Kelurahan tidak terdaftar' });
      }
    }

    const filteredPayload = filterPayloadByColumns(payload, columns);
    const keys = Object.keys(filteredPayload);
    if (!keys.length) {
      return res.status(400).json({ success: false, message: 'No valid fields provided' });
    }
    const values = keys.map((key) => filteredPayload[key]);
    const setClause = keys.map((key) => `${key} = ?`).join(', ');

    await prisma.$executeRawUnsafe(
      `UPDATE ${table} SET ${setClause} WHERE id = ?`,
      ...values,
      parseInt(id)
    );
    const updatedRows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM ${table} WHERE id = ? LIMIT 1`,
      parseInt(id)
    );
    const updated = updatedRows[0];

    // Log change
    await logChange(req.user!.username, 'edit', table, parseInt(id));

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

// DELETE /api/data/:table/:id - Delete record
router.delete('/:table/:id', authenticateToken, requirePermission('data.write'), async (req: AuthRequest, res) => {
  const { table, id } = req.params;

  if (!validTables.includes(table)) {
    return res.status(400).json({ success: false, message: 'Invalid table name' });
  }

  try {
    const columns = await getTableColumns(table);
    if (!columns) {
      return res.status(400).json({ success: false, message: 'Table not found in database' });
    }

    // Check record exists and access
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM ${table} WHERE id = ? LIMIT 1`,
      parseInt(id)
    );
    const record = rows[0];

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const userKelurahan = req.user?.kelurahan || null;
    if (userKelurahan && userKelurahan !== record.kelurahan) {
      return res.status(403).json({ success: false, message: 'No access to this record' });
    }

    await prisma.$executeRawUnsafe(
      `DELETE FROM ${table} WHERE id = ?`,
      parseInt(id)
    );

    // Log change
    await logChange(req.user!.username, 'hapus', table, parseInt(id));

    return res.json({ success: true, message: 'Record deleted' });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

export default router;
