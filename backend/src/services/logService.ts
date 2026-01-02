import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logChange(username: string, action: 'tambah' | 'edit' | 'hapus', table: string, id: number) {
  try {
    await prisma.logPerubahan.create({
      data: {
        username_pengguna: username,
        aksi: action,
        nama_tabel: table,
        id_data: id
      }
    });
  } catch (err) {
    console.error('Failed to log change:', err);
  }
}
