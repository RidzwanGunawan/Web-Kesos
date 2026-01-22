# Web KESOS - Sistem Manajemen Data Kesejahteraan Sosial

## 📌 Tentang Aplikasi

**Web KESOS** adalah platform web yang dirancang untuk membantu pengelolaan data kesejahteraan sosial di tingkat kelurahan/desa. Aplikasi ini memungkinkan operator data untuk:

- 📊 **Mencatat dan mengelola data** berbagai kategori kesejahteraan sosial (PAUD, TK, sekolah, bantuan sosial, data qurban, lansia terlantar, sarana kesehatan, tempat ibadah, dll.)
- 👥 **Manajemen pengguna** dengan kontrol akses berbasis peran (RBAC) — admin & operator kelurahan
- 🧩 **Role & Permission Manager** untuk pengaturan akses yang dinamis
- 🏘️ **Kelurahan dinamis** (CRUD) tanpa hardcode
- 📈 **Dashboard statistik** untuk visualisasi data kategori per kelurahan
- 🔐 **Sistem autentikasi** berbasis JWT untuk API, login aman dengan password hashing
- 📋 **Audit trail / History log** untuk mencatat setiap perubahan data (siapa, kapan, tindakan apa)
- 🌐 **Pemisahan backend-frontend** untuk fleksibilitas, maintainability, dan skalabilitas

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js (TypeScript)
- **Database:** MySQL 8.0+
- **ORM:** Prisma
- **Auth:** JWT (Access Token)
- **Validation:** Zod / Manual schemas
- **Security:** bcrypt (password hashing), CORS, middleware auth + RBAC dinamis

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Styling:** CSS-in-JS / TailwindCSS (optional, untuk enhancement)

### DevOps & Tools
- **Package Manager:** npm
- **Version Control:** Git

## 📁 Struktur Folder

```
web-kesos-main/
├── backend/              # Backend API (Express + TypeScript)
│   ├── src/
│   │   ├── index.ts      # Entry point
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth, RBAC, validation
│   │   └── prisma/       # Database schema & migrations
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
├── frontend/             # Frontend SPA (React + Vite)
│   ├── src/
│   │   ├── main.tsx      # Entry point
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   └── services/     # API client
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── README.md
├── _old_reference/       # Referensi kode lama (PHP) untuk migrasi
├── SETUP.md              # Panduan setup dan menjalankan aplikasi
└── README.md             # File ini (penjelasan umum)
```

## 🚀 Mulai Cepat

Lihat [SETUP.md](./SETUP.md) untuk panduan lengkap setup, konfigurasi database, dan cara menjalankan backend + frontend.

## 📚 Fitur Utama

### 1. **Autentikasi & Otorisasi**
   - Login dengan username + password
   - JWT access token (15 menit)
   - Role-based access control (RBAC) dinamis:
     - **Admin:** akses penuh + manajemen role, user, kelurahan
     - **Operator:** akses terbatas ke kelurahan sendiri

### 2. **Manajemen Data Kategori**
   Dukungan 16 kategori data:
   - Data Pendidikan: PAUD, TK, Sekolah, SLB
   - Data Sosial: Masyarakat Miskin, Disabilitas, PMKS, Lansia Terlantar
   - Data Kegamaan: Laporan Sholat Idul Fitri, Idul Adha, Qurban, Zakat
   - Data Infrastruktur: Perpustakaan RW, Sarana Kesehatan, Tempat Ibadah
   - Data Bantuan: Bantuan Sosial

### 3. **Dashboard & Statistik**
   - Visualisasi jumlah data per kategori (bar chart)
   - Filter per kelurahan
   - Card statistik untuk quick overview

### 4. **Audit Trail**
   - Setiap operasi CRUD dicatat ke `log_perubahan`
   - Informasi: waktu, username, tindakan (tambah/edit/hapus), nama tabel, ID data
   - History page untuk melihat semua perubahan

### 5. **Role & Permission Manager**
   - Buat role baru dan atur permission dari UI
   - Menu dan akses otomatis mengikuti permission

### 6. **Kelurahan Management**
   - Admin menambah/ubah/hapus kelurahan
   - Operator terikat kelurahan tertentu

## 🔒 Keamanan

- ✅ Password di-hash dengan bcrypt (cost factor 10)
- ✅ JWT untuk API authentication
- ✅ Prepared statements (Prisma) untuk mencegah SQL Injection
- ✅ CORS configured untuk kontrol akses cross-origin
- ✅ RBAC middleware dengan permission berbasis DB
- ✅ Rate limiting untuk login endpoint (rekomendasi)

## 📝 Catatan untuk Development

- Database schema di-manage oleh Prisma (`prisma/schema.prisma`)
- Gunakan `npm run dev` di backend dan frontend untuk development dengan hot-reload
- Atau jalankan keduanya dari root: `npm run dev:all`
- API backend berjalan di `http://localhost:4000`
- Frontend dev server di `http://localhost:5173` (dengan proxy ke `/api`)
- Gunakan Docker Compose untuk setup database MySQL lokal

## 📖 Dokumentasi Lebih Lanjut

- [Backend README](./backend/README.md) — Instalasi dependencies, running server, API docs
- [Frontend README](./frontend/README.md) — Instalasi, running dev server, struktur komponen
- [SETUP.md](./SETUP.md) — Panduan lengkap setup awal dan konfigurasi

## 🤝 Kontribusi

Untuk development atau kontribusi, ikuti struktur kode yang sudah ada dan pastikan semua tests lolos sebelum submit PR.

## 📄 Lisensi

Internal project — Hak cipta 2024+.

---

**Last Updated:** January 2025
