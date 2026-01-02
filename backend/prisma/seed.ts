import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const kelurahanColumn = await prisma.$queryRawUnsafe<{ total: number }[]>(
    `SELECT COUNT(*) as total
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'User'
       AND COLUMN_NAME = 'kelurahan'`
  )
  if (Number(kelurahanColumn?.[0]?.total ?? 0) === 0) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE User ADD COLUMN kelurahan VARCHAR(191) NULL'
    )
  }
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS Role (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(191) NOT NULL,
      label VARCHAR(191) NOT NULL,
      UNIQUE INDEX Role_name_key (name),
      PRIMARY KEY (id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  )
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS Permission (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(191) NOT NULL,
      label VARCHAR(191) NOT NULL,
      UNIQUE INDEX Permission_name_key (name),
      PRIMARY KEY (id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  )
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS RolePermission (
      id INT NOT NULL AUTO_INCREMENT,
      roleId INT NOT NULL,
      permissionId INT NOT NULL,
      UNIQUE INDEX RolePermission_roleId_permissionId_key (roleId, permissionId),
      PRIMARY KEY (id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  )

  const adminPassword = await bcrypt.hash('admin123', 10)
  const opPassword = await bcrypt.hash('password123', 10)

  const permissions = [
    { name: 'dashboard.view', label: 'Lihat Dashboard' },
    { name: 'data.read', label: 'Baca Data' },
    { name: 'data.write', label: 'Tulis Data' },
    { name: 'logs.view', label: 'Lihat Audit Log' },
    { name: 'users.manage', label: 'Kelola User' },
    { name: 'kelurahan.manage', label: 'Kelola Kelurahan' },
    { name: 'roles.manage', label: 'Kelola Role & Permission' }
  ]

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { label: perm.label },
      create: perm
    })
  }

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: { label: 'Admin' },
    create: { name: 'admin', label: 'Admin' }
  })
  const operatorRole = await prisma.role.upsert({
    where: { name: 'operator' },
    update: { label: 'Operator' },
    create: { name: 'operator', label: 'Operator Kelurahan' }
  })

  const perms = await prisma.permission.findMany()
  const permByName = Object.fromEntries(perms.map((p) => [p.name, p]))

  const adminPerms = [
    'dashboard.view',
    'data.read',
    'data.write',
    'logs.view',
    'users.manage',
    'kelurahan.manage',
    'roles.manage'
  ]
  const operatorPerms = ['dashboard.view', 'data.read', 'data.write', 'logs.view']

  for (const permName of adminPerms) {
    const perm = permByName[permName]
    if (!perm) continue
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id }
    })
  }

  for (const permName of operatorPerms) {
    const perm = permByName[permName]
    if (!perm) continue
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: operatorRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: operatorRole.id, permissionId: perm.id }
    })
  }

  // Upsert admin user
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      nama_lengkap: 'Admin Master',
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      kelurahan: null
    }
  })

  // Upsert operator for Cigadung
  await prisma.user.upsert({
    where: { username: 'op_cgd' },
    update: {},
    create: {
      nama_lengkap: 'Operator Cigadung',
      username: 'op_cgd',
      password: opPassword,
      role: 'operator',
      kelurahan: 'Cigadung'
    }
  })

  await prisma.user.updateMany({
    where: { role: 'master' },
    data: { role: 'admin' }
  })
  await prisma.$executeRawUnsafe(
    `UPDATE User SET kelurahan = 'Cigadung' WHERE role = 'cgd'`
  )
  await prisma.$executeRawUnsafe(
    `UPDATE User SET kelurahan = 'Cihaurgeulis' WHERE role = 'chg'`
  )
  await prisma.$executeRawUnsafe(
    `UPDATE User SET kelurahan = 'Neglasari' WHERE role = 'ngl'`
  )
  await prisma.$executeRawUnsafe(
    `UPDATE User SET kelurahan = 'Sukaluyu' WHERE role = 'skl'`
  )
  await prisma.user.updateMany({
    where: { role: { in: ['cgd', 'chg', 'ngl', 'skl'] } },
    data: { role: 'operator' }
  })

  // Insert kelurahan list (idempotent)
  const kelurahans = ['Cigadung', 'Cihaurgeulis', 'Neglasari', 'Sukaluyu']
  for (const nama of kelurahans) {
    await prisma.namaKelurahan.upsert({
      where: { nama_kelurahan: nama },
      update: {},
      create: { nama_kelurahan: nama }
    })
  }

  const dataTables = [
    'data_paud', 'data_tk', 'data_sekolah', 'data_slb',
    'data_masyarakat_miskin', 'data_disabilitas', 'data_pmks',
    'data_perpustakaan_rw', 'data_bantuan_sosial',
    'laporan_sholat_idul_fitri', 'laporan_sholat_idul_adha',
    'data_hewan_qurban', 'data_penyaluran_zakat', 'data_lansia_terlantar',
    'data_sarana_kesehatan', 'data_tempat_ibadah'
  ]

  for (const table of dataTables) {
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS ${table} (
        id INT NOT NULL AUTO_INCREMENT,
        kelurahan VARCHAR(191) NOT NULL,
        nama VARCHAR(191) NOT NULL,
        alamat VARCHAR(191) NULL,
        jumlah INT NULL,
        tahun INT NULL,
        keterangan VARCHAR(255) NULL,
        PRIMARY KEY (id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
  }

  const tableTopics: Record<string, string[]> = {
    data_paud: ['PAUD Cendekia', 'PAUD Pelita', 'PAUD Harapan'],
    data_tk: ['TK Mawar', 'TK Melati', 'TK Anggrek'],
    data_sekolah: ['SDN 01', 'SMPN 05', 'SMAN 3'],
    data_slb: ['SLB Bahagia', 'SLB Cahaya', 'SLB Kasih'],
    data_masyarakat_miskin: ['Keluarga Prasejahtera', 'RTM', 'Penerima BLT'],
    data_disabilitas: ['Disabilitas Fisik', 'Disabilitas Sensorik', 'Disabilitas Intelektual'],
    data_pmks: ['PMKS Anak', 'PMKS Dewasa', 'PMKS Lansia'],
    data_perpustakaan_rw: ['Perpustakaan RW 01', 'Perpustakaan RW 03', 'Perpustakaan RW 05'],
    data_bantuan_sosial: ['Bantuan Sembako', 'Bantuan Tunai', 'Bantuan Pendidikan'],
    laporan_sholat_idul_fitri: ['Lapangan Utama', 'Masjid Raya', 'Taman Kota'],
    laporan_sholat_idul_adha: ['Lapangan Timur', 'Masjid Jami', 'Lapangan Barat'],
    data_hewan_qurban: ['Sapi', 'Kambing', 'Domba'],
    data_penyaluran_zakat: ['Zakat Fitrah', 'Zakat Mal', 'Infaq'],
    data_lansia_terlantar: ['Lansia Rentan', 'Lansia Terlantar', 'Lansia Penerima Bansos'],
    data_sarana_kesehatan: ['Puskesmas', 'Posyandu', 'Klinik Pratama'],
    data_tempat_ibadah: ['Masjid', 'Mushola', 'Gereja']
  }

  const jalan = ['Cendana', 'Anggrek', 'Melati', 'Kenanga', 'Mawar', 'Teratai', 'Rajawali', 'Bambu', 'Sawo', 'Merpati']
  const kelurahanList = ['Cigadung', 'Cihaurgeulis', 'Neglasari', 'Sukaluyu']

  function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function pick<T>(arr: T[]) {
    return arr[randInt(0, arr.length - 1)]
  }

  for (const table of dataTables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${table}`)

    const topics = tableTopics[table] || ['Data Umum']
    for (let i = 0; i < 12; i += 1) {
      const nama = `${pick(topics)} ${randInt(1, 30)}`
      const alamat = `Jl. ${pick(jalan)} No. ${randInt(1, 120)}`
      const jumlah = randInt(10, 180)
      const tahun = randInt(2021, 2024)
      const keterangan = i % 3 === 0 ? 'Perlu verifikasi' : i % 3 === 1 ? 'Terverifikasi' : 'Update berkala'
      const kelurahan = pick(kelurahanList)

      await prisma.$executeRawUnsafe(
        `INSERT INTO ${table} (kelurahan, nama, alamat, jumlah, tahun, keterangan)
         VALUES (?, ?, ?, ?, ?, ?)`,
        kelurahan,
        nama,
        alamat,
        jumlah,
        tahun,
        keterangan
      )
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
