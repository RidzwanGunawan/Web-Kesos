# 🚀 Panduan Setup dan Menjalankan Web KESOS

## 📋 Prerequisites

Pastikan sudah terinstal di komputer:
- **Node.js** v18+ (download dari https://nodejs.org/)
- **npm** v9+ (biasanya terinstall bersama Node.js)
- **MySQL** v8.0+ (atau MariaDB 10.6+)
  - Atau gunakan Docker (lihat bagian "Setup dengan Docker" di bawah)
- **Git** (untuk version control)

## ✅ Step-by-Step Setup

### 1️⃣ Clone / Download Proyek

```bash
cd /path/to/your/projects
# Jika sudah download, skip langkah ini
```

### 2️⃣ Setup Backend

#### 2a. Masuk ke folder backend
```bash
cd backend
```

#### 2b. Install dependencies
```bash
npm install
```

Menunggu proses instalasi selesai...

#### 2c. Buat file `.env` dari template
```bash
cp .env.example .env
```

Buka `.env` dan sesuaikan konfigurasi:
```env
DATABASE_URL=mysql://root:password@localhost:3306/db_kesos
JWT_SECRET=your_super_secret_jwt_key_12345
REFRESH_TOKEN_SECRET=your_refresh_secret_67890
PORT=4000
NODE_ENV=development
```

**Penjelasan:**
- `DATABASE_URL`: URL koneksi MySQL. Format: `mysql://username:password@host:port/database`
  - Jika MySQL lokal dengan user `root` password `password`:
    ```
    mysql://root:password@localhost:3306/db_kesos
    ```
- `JWT_SECRET`: String panjang untuk signing access token (gunakan string random yang kuat)
- `REFRESH_TOKEN_SECRET`: Secret untuk refresh cookie (disiapkan untuk kebutuhan auth lanjutan)
- `PORT`: Port backend (default 4000)

#### 2d. Setup database dan Prisma
```bash
# Generate Prisma client
npx prisma generate

# Buat database dan jalankan migrations
npx prisma migrate dev --name init
```

Jika diminta nama migration, ketik `init` atau nama deskriptif lainnya.

#### 2e. (Optional) Seed database dengan data awal
```bash
npm run seed
```

Seed akan membuat:
- Role & permission (RBAC dinamis)
- Data kelurahan
- User default (admin & operator)
- Data dummy untuk tabel kategori

#### 2f. Jalankan backend (development)
```bash
npm run dev
```

Output yang diharapkan:
```
Server running on port 4000
```

Backend siap di `http://localhost:4000`

---

### 3️⃣ Setup Frontend (di terminal baru)

#### 3a. Keluar dari backend folder dan masuk frontend
```bash
cd ../frontend
```

#### 3b. Install dependencies
```bash
npm install
```

#### 3c. (Optional) Set API Base URL untuk ngrok / production
Buat file `frontend/.env.local`:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```
Jika memakai ngrok, ganti dengan URL backend ngrok:
```
VITE_API_BASE_URL=https://<ngrok-backend-url>/api
```

#### 3c. Jalankan dev server
```bash
npm run dev
```

Output yang diharapkan:
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Frontend siap di `http://localhost:5173`

---

### ✅ Jalankan Backend + Frontend Sekaligus (Opsional)

Dari root project:
```bash
npm run dev:all
```

---

### 4️⃣ Test Aplikasi

1. Buka browser ke `http://localhost:5173`
2. Login dengan user default hasil seed:
   - Admin: `admin` / `admin123`
   - Operator: `op_cgd` / `password123`
3. Jika login berhasil, akan redirect ke dashboard
4. Coba lihat statistik, manajemen data, dan history log

---

## 📝 Environment Variables Lengkap

### Backend (`.env` di folder `/backend`)

| Variable | Contoh | Deskripsi |
|----------|--------|-----------|
| `DATABASE_URL` | `mysql://root:pass@localhost:3306/db_kesos` | URL koneksi MySQL |
| `JWT_SECRET` | `abc123xyz789` | Secret untuk signing JWT access token |
| `REFRESH_TOKEN_SECRET` | `def456uvw012` | Secret untuk signing refresh token |
| `PORT` | `4000` | Port backend |
| `NODE_ENV` | `development` \| `production` | Environment mode |

### Frontend (bisa dalam `vite.config.ts` atau `.env`)

Gunakan `.env.local` untuk override base URL saat memakai ngrok atau production.

---

## 🔧 Troubleshooting

### ❌ "Cannot connect to database"
- Pastikan MySQL sudah berjalan
- Cek `DATABASE_URL` di `.env` sudah benar
- Cek username/password MySQL
- Jika menggunakan Docker, pastikan container `mysql` sudah running: `docker ps`

### ❌ "npm ERR! ... not found"
- Jalankan `npm install` lagi di folder yang tepat
- Pastikan Node.js v18+ terinstal: `node -v`

### ❌ "Port 4000 already in use"
- Change `PORT` di `.env` ke port lain (misal 5000)
- Atau kill process yang menggunakan port 4000:
  ```bash
  # macOS/Linux
  lsof -i :4000 | grep LISTEN | awk '{print $2}' | xargs kill
  # atau Windows (PowerShell)
  Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process
  ```

### ❌ Prisma migration error
- Pastikan database sudah dibuat: `CREATE DATABASE db_kesos;`
- Delete file migrasi yang error di `backend/prisma/migrations/`
- Re-run: `npx prisma migrate dev --name init`

### ❌ "CORS error" saat frontend memanggil API
- Pastikan backend sudah running di port 4000
- Cek `vite.config.ts` proxy ke `/api: http://localhost:4000`
- Restart frontend dev server

---

## 📊 Testing API dengan Postman / curl

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nama": "Admin Master",
    "username": "admin",
    "role": "admin"
  }
}
```

### Health Check
```bash
curl http://localhost:4000/api/health
```

---

## ✅ Verifikasi Setup Berhasil

Jika semua langkah di atas selesai, cek:

1. **Backend running:**
   ```bash
   curl http://localhost:4000/api/health
   # Response: {"status":"ok"}
   ```

2. **Frontend accessible:**
   - Buka browser: `http://localhost:5173`
   - Harusnya tampil login page

3. **Database connected:**
   - Backend tidak error saat startup
   - Cek terminal output backend, tidak ada "Cannot connect to database"

---

## 📚 Referensi

- Backend: `backend/README.md`
- Frontend: `frontend/README.md`
- Old code (PHP): `_old_reference/` (gunakan untuk referensi logic)

---

**Last Updated:** January 2025
