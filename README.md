# SISTEM QC BERKAS (Document Quality Control System)

## 📋 Deskripsi Aplikasi

Sistem QC Berkas adalah aplikasi web enterprise-grade untuk manajemen dan quality control dokumen dengan fitur:
- Manajemen berkas (CRUD)
- User & role management
- Monitoring dashboard
- Notifikasi real-time
- Ekspor/Impor berkas
- Audit logging

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────┐
│       Presentation Layer (React/Next.js)    │
│    (Components, Pages, UI, API Client)      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│    Application Layer (NestJS Services)      │
│   (Use Cases, Business Logic, Validation)   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│      Domain Layer (Entities, Models)        │
│      (Business Rules, Validations)          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│   Infrastructure Layer (Database, Repos)    │
│   (Prisma, PostgreSQL, External Services)   │
└─────────────────────────────────────────────┘
```

## 📁 Struktur Folder

```
SISTEM-QC-BERKAS/
├── backend/                          # NestJS Application
│   ├── src/
│   │   ├── common/                  # Global utilities & filters
│   │   ├── modules/                 # Feature modules
│   │   │   ├── auth/                # Authentication & Authorization
│   │   │   ├── users/               # User management
│   │   │   ├── roles/               # Role management
│   │   │   ├── berkas/              # Document management
│   │   │   ├── petugas/             # Staff management
│   │   │   ├── notifications/       # Notifications
│   │   │   └── dashboard/           # Dashboard & monitoring
│   │   ├── config/                  # Configuration
│   │   └── main.ts                  # Application entry point
│   ├── prisma/                      # Prisma schema & migrations
│   ├── .env.example                 # Environment variables template
│   └── package.json
│
├── frontend/                         # Next.js Application
│   ├── app/                         # App router
│   │   ├── (auth)/                  # Auth pages
│   │   ├── (dashboard)/             # Dashboard pages
│   │   ├── api/                     # API routes (optional)
│   │   └── layout.tsx               # Root layout
│   ├── components/                  # Reusable components
│   ├── hooks/                       # Custom hooks
│   ├── lib/                         # Utilities & services
│   │   └── api.ts                   # API client
│   ├── .env.example                 # Environment variables
│   └── package.json
│
├── database/                        # Database scripts
│   ├── schema.sql                   # PostgreSQL schema
│   ├── migrations/                  # Migration scripts
│   └── seeds/                       # Seed data
│
├── docs/                            # Documentation
│   ├── ARCHITECTURE.md              # Architecture details
│   ├── API_ENDPOINTS.md             # API documentation
│   ├── DATABASE_SCHEMA.md           # Database schema
│   ├── SETUP_GUIDE.md               # Setup instructions
│   └── DEPLOYMENT.md                # Deployment guide
│
└── docker-compose.yml               # Docker setup (optional)
```

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14, TypeScript, React 18 | UI & Client-side logic |
| Backend | NestJS, TypeScript, Express | API & Server-side logic |
| Database | PostgreSQL 15+ | Data persistence |
| ORM | Prisma | Database abstraction |
| Auth | JWT, bcryptjs | Authentication |
| API Docs | Swagger/OpenAPI | API documentation |
| Validation | class-validator, class-transformer | Input validation |

## ✨ Fitur Utama

### 1. Authentication & Authorization
- Login dengan credentials
- JWT token management
- Role-based access control (RBAC)
- Refresh token mechanism

### 2. CRUD Modules
- **Users**: Kelola akun user dengan roles
- **Berkas**: Kelola dokumen dengan status tracking
- **Petugas**: Kelola staff/officer yang menangani berkas

### 3. File Management
- Upload/Download berkas
- Import dari Excel/CSV
- Export ke Excel/PDF
- Print preview

### 4. Dashboard
- Total berkas metrics
- Status berkas distribution
- Recent activities
- User activity tracking

### 5. Notifications
- Real-time notifications
- Status change alerts
- Email notifications (optional)

### 6. Audit & Logging
- System audit logs
- User activity tracking
- Change history

## 📊 Database Schema

Tabel utama:
- `users` - User accounts
- `roles` - User roles
- `user_roles` - User-role mapping
- `berkas` - Documents
- `berkas_history` - Document change history
- `petugas` - Staff members
- `notifications` - System notifications
- `audit_logs` - Activity logs

## 🚀 API Endpoints Overview

```
Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout

Users Management
GET /api/users
POST /api/users
GET /api/users/:id
PATCH /api/users/:id
DELETE /api/users/:id

Berkas Management
GET /api/berkas
POST /api/berkas
GET /api/berkas/:id
PATCH /api/berkas/:id
DELETE /api/berkas/:id
POST /api/berkas/import
GET /api/berkas/export

Petugas Management
GET /api/petugas
POST /api/petugas
GET /api/petugas/:id
PATCH /api/petugas/:id
DELETE /api/petugas/:id

Dashboard
GET /api/dashboard/metrics
GET /api/dashboard/activities
```

## 🔐 Keamanan

- ✅ JWT token authentication
- ✅ Password hashing (bcryptjs)
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (via Prisma)
- ✅ Environment-based configuration
- ✅ Audit logging

## 📈 Performance & Scalability

- ✅ Pagination support
- ✅ Database indexing
- ✅ Connection pooling
- ✅ Caching ready
- ✅ Horizontal scalability
- ✅ Support untuk 50-100 concurrent users

## 🚢 Deployment

Supported platforms:
- Docker & Docker Compose
- Heroku
- AWS (EC2, ECS)
- DigitalOcean
- Traditional VPS

## 📚 Dokumentasi

Lihat folder `docs/` untuk:
- Architecture details
- API endpoint documentation
- Database schema explanation
- Setup & installation guide
- Deployment procedures

## 🔧 Quick Start

```bash
# Backend setup
cd backend
npm install
npm run migration:run
npm run start:dev

# Frontend setup
cd frontend
npm install
npm run dev
```

## 📝 Environment Setup

Lihat `.env.example` di folder `backend/` dan `frontend/` untuk konfigurasi yang diperlukan.

## 👥 Team & Roles

- Admin: Full access to all features
- (Future) Staff: Limited access, dapat manage berkas
- (Future) Viewer: Read-only access

## 📋 Development Status

- [ ] Backend API setup
- [ ] Database schema & migrations
- [ ] Authentication module
- [ ] CRUD modules
- [ ] Frontend setup
- [ ] UI components
- [ ] Dashboard
- [ ] Notifications
- [ ] Testing
- [ ] Documentation
- [ ] Deployment

## 📞 Support

For issues or questions, please create an issue or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: January 2026
#   q c - a p p  
 #   q c - a p p  
 #   q c - a p p  
 