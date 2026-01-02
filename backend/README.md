# Backend API - Web KESOS

Backend API untuk Web KESOS built with Node.js, Express, TypeScript, dan Prisma ORM.

## 📋 Prerequisites

- Node.js v18+
- MySQL v8.0+ (atau gunakan Docker)
- npm v9+

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment variables
```bash
cp .env.example .env
# Edit .env dan sesuaikan DATABASE_URL, JWT_SECRET, REFRESH_TOKEN_SECRET
```

### 3. Setup database
```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init
```

### 4. (Optional) Seed database
```bash
npm run seed
```

### 5. Start development server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:4000`

## 📁 Folder Structure

```
src/
├── index.ts              # Entry point
├── config/               # Configuration files
├── routes/               # API routes
├── controllers/          # Route handlers & business logic
├── services/             # Business logic & database operations
├── middleware/           # Express middleware (auth, validation, error handling)
├── types/                # TypeScript types & interfaces
└── utils/                # Utility functions

prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` — Login, returns JWT token

### Users
- `GET /api/users/me` — Get current user info (requires auth)
- `GET /api/users` — List all users (requires `users.manage`)
- `GET /api/users/roles` — List roles (requires `users.manage`)
- `POST /api/users` — Create user (requires `users.manage`)
- `PUT /api/users/:id` — Update user (requires `users.manage`)

### Roles & Permissions
- `GET /api/roles` — List roles + permissions (requires `roles.manage`)
- `GET /api/roles/permissions` — List permissions (requires `roles.manage`)
- `POST /api/roles` — Create role (requires `roles.manage`)
- `PUT /api/roles/:id` — Update role (requires `roles.manage`)
- `PUT /api/roles/:id/permissions` — Update role permissions (requires `roles.manage`)
- `DELETE /api/roles/:id` — Delete role (requires `roles.manage`)

### Kelurahan
- `GET /api/kelurahan` — Get list of kelurahan
- `GET /api/kelurahan/manage` — List kelurahan with IDs (requires `kelurahan.manage`)
- `POST /api/kelurahan` — Create kelurahan (requires `kelurahan.manage`)
- `PUT /api/kelurahan/:id` — Update kelurahan (requires `kelurahan.manage`)
- `DELETE /api/kelurahan/:id` — Delete kelurahan (requires `kelurahan.manage`)

### Data Management
- `GET /api/data/:table/meta` — Get columns meta
- `GET /api/data/:table` — Get data from table (supports query: kelurahan, search, page, limit)
- `GET /api/data/:table/:id` — Get single record
- `POST /api/data/:table` — Create new record (requires `data.write`)
- `PUT /api/data/:table/:id` — Update record (requires `data.write`)
- `DELETE /api/data/:table/:id` — Delete record (requires `data.write`)

### Stats & Logs
- `GET /api/stats` — Get statistics (supports query: kelurahan)
- `GET /api/logs` — Get change logs/audit trail (paginated)

## 🔐 Authentication

Backend menggunakan JWT (JSON Web Tokens) untuk API authentication:

1. **Access Token:** Short-lived (15 minutes), dikirim dalam header `Authorization: Bearer <token>`
2. **Refresh Token:** Long-lived (7 days), disimpan dalam httpOnly cookie, digunakan untuk rotate access token

### Login Flow
```
1. User POST /api/auth/login {username, password}
2. Server verifikasi password dengan bcrypt
3. Server generates:
   - Access token (short-lived JWT)
4. Client stores access token in memory/sessionStorage
5. Client sends token in Authorization header untuk setiap request
```

## 🔐 RBAC (Role-Based Access Control)

RBAC bersifat dinamis dan berbasis permission di DB:
- **Admin:** full access + manage role, user, kelurahan
- **Operator:** akses terbatas ke kelurahan sendiri

Contoh permission:
- `dashboard.view`, `data.read`, `data.write`
- `logs.view`, `users.manage`, `kelurahan.manage`, `roles.manage`

## 🔄 Available Scripts

```bash
npm run dev       # Start development server with hot reload
npm run build     # Compile TypeScript to JavaScript
npm run start     # Run compiled server
npm run seed      # Seed database with initial data
```

## 📝 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | MySQL connection URL |
| `JWT_SECRET` | Yes | - | Secret key for JWT signing |
| `REFRESH_TOKEN_SECRET` | Yes | - | Secret key for refresh token |
| `PORT` | No | 4000 | Server port |
| `NODE_ENV` | No | development | Environment mode |

## 🧪 Testing (Future)

```bash
npm run test      # Run unit tests
npm run test:e2e  # Run E2E tests
```

## 📖 Related Files

- Root `README.md` — Project overview
- Root `SETUP.md` — Full setup guide
- Frontend `README.md` — Frontend documentation
- `_old_reference/` — Old PHP code for reference during porting

## 🤝 Contributing

- Follow TypeScript strict mode
- Use Prisma for all database operations
- Add middleware protection untuk new routes
- Write tests for new endpoints

---

**Last Updated:** January 2025
