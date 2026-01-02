# Frontend - Web KESOS

React + Vite + TypeScript frontend untuk Web KESOS.

## 📋 Prerequisites

- Node.js v18+
- npm v9+
- Backend API running di `http://localhost:4000` (untuk development)

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

Dev server akan berjalan di `http://localhost:5173` dengan proxy `/api` ke backend.

### 3. Build untuk production
```bash
npm run build
```

Output akan berada di folder `dist/`.

## 📁 Folder Structure

```
src/
├── main.tsx              # Entry point
├── pages/                # Page components
│   ├── Landing.tsx       # Landing page
│   ├── Login.tsx         # Login page
│   ├── Dashboard.tsx     # Dashboard page
│   ├── DataManagement.tsx# Manajemen data
│   ├── History.tsx       # Audit log
│   ├── Users.tsx         # Manajemen user
│   ├── Kelurahan.tsx     # Manajemen kelurahan
│   └── Roles.tsx         # Role & permission manager
├── components/           # Reusable components
│   ├── Layout.tsx
│   └── RequireAuth.tsx
├── services/             # API client & utilities
│   ├── api.ts            # Axios instance & API calls
├── types/                # TypeScript types
│   ├── index.ts
│   └── api.ts
└── styles/               # Global styles (optional)
```

## 🔑 Key Features

### Authentication
- Login form dengan username + password
- JWT token stored in memory/sessionStorage
- Auto-refresh token using refresh endpoint
- Logout functionality

### Pages
- **Landing:** Overview produk + CTA
- **Login:** Form login, server-side validation
- **Dashboard:** Statistik data per kategori, filter per kelurahan
- **Manajemen Data:** CRUD operations untuk data, dinamis form per kategori
- **Audit Log:** Riwayat perubahan
- **Manajemen User:** Kelola akun user
- **Kelurahan:** CRUD kelurahan
- **Role & Permission:** Kelola akses secara dinamis

### RBAC in UI
- Admin: akses penuh + manage role/kelurahan/user
- Operator: akses terbatas ke kelurahan mereka
- Menu dan aksi mengikuti permission

### API Integration
- Axios instance dengan default headers (Authorization)
- Auto token injection di setiap request
- Error handling & toast notifications (optional)

## 🌐 Environment Variables

Buat file `.env.local` (git-ignored):
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Atau configure di `vite.config.ts` untuk proxy (sudah done).

## 🔄 Available Scripts

```bash
npm run dev           # Start dev server (hot reload)
npm run build         # Build for production
npm run preview       # Preview production build locally
npm run lint          # Lint code (optional, if eslint configured)
```

## 🧪 Testing (Future)

```bash
npm run test          # Unit tests dengan Vitest
npm run test:e2e      # E2E tests dengan Playwright
```

## 🔌 API Integration

Frontend memanggil backend API melalui Axios wrapper:

### Login
```typescript
const response = await api.post('/auth/login', { username, password })
// Response: { success, token, user }
```

### Get Stats
```typescript
const stats = await api.get('/stats', { params: { kelurahan } })
```

### CRUD Data
```typescript
// Get data
const data = await api.get(`/data/data_paud`, { params: { kelurahan } })

// Create
await api.post(`/data/data_paud`, { nama, alamat, jumlah, tahun, kelurahan })

// Update
await api.put(`/data/data_paud/1`, { nama_sekolah, ... })

// Delete
await api.delete(`/data/data_paud/1`)
```

Setiap request otomatis include `Authorization: Bearer <token>` header.

## 📝 Component Examples

### Login Form
```tsx
import LoginForm from '@/components/LoginForm'
<LoginForm onSuccess={() => navigate('/dashboard')} />
```

### Data Table
```tsx
import DataTable from '@/components/DataTable'
<DataTable 
  data={records} 
  columns={['nama_sekolah', 'alamat', 'jumlah_siswa']} 
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## 🐛 Troubleshooting

### ❌ CORS error
- Ensure backend running at `http://localhost:4000`
- Check `vite.config.ts` proxy configuration
- Restart dev server

### ❌ Token expired
- Implement automatic token refresh using refresh token endpoint
- Clear localStorage/sessionStorage and re-login

### ❌ 404 Not Found for API
- Verify backend is running
- Check API endpoint spelling
- Look at network tab in DevTools

## 📖 Related Files

- Root `README.md` — Project overview
- Root `SETUP.md` — Full setup guide
- Backend `README.md` — Backend API documentation
- `_old_reference/` — Old PHP code for component reference

## 🎨 Styling (Optional Enhancement)

Saat ini menggunakan inline styles. Untuk improvement:
- Install TailwindCSS: `npm install -D tailwindcss postcss autoprefixer`
- Atau gunakan styled-components/emotion
- Create consistent design system

## 🤝 Contributing

- Follow component structure
- Keep components reusable
- Use TypeScript strictly
- Handle loading & error states
- Test locally before commit

---

**Last Updated:** January 2025
