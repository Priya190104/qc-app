# SETUP & INSTALLATION GUIDE

## Prerequisites

Pastikan sudah terinstall:

- **Node.js** >= 18.x (LTS)
- **npm** >= 9.x atau **yarn** >= 3.x
- **PostgreSQL** >= 14.x
- **Git**
- **VS Code** (recommended)

### Verifikasi Installation

```bash
node --version    # v18.x.x
npm --version     # 9.x.x
psql --version    # PostgreSQL 14.x
git --version     # git version 2.x
```

---

## 1. ENVIRONMENT SETUP

### 1.1 Clone Repository

```bash
git clone https://github.com/your-org/sistem-qc-berkas.git
cd SISTEM-QC-BERKAS
```

### 1.2 Backend Environment Setup

Masuk ke folder backend:

```bash
cd backend
cp .env.example .env
```

Edit `.env` dengan konfigurasi Anda:

```env
# Server Configuration
NODE_ENV=development
APP_NAME=SISTEM-QC-BERKAS
APP_PORT=3001
APP_URL=http://localhost:3001

# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/sistem_qc_berkas"
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_NAME=sistem_qc_berkas

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRATION=3600
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_REFRESH_EXPIRATION=604800

# Logging
LOG_LEVEL=debug
LOG_FORMAT=simple

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# File Upload
MAX_FILE_SIZE=52428800  # 50MB in bytes
UPLOAD_DIR=./uploads

# Email Configuration (optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# Admin Credentials (initial setup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPassword123!

# Redis Configuration (optional, for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 1.3 Frontend Environment Setup

```bash
cd ../frontend
cp .env.example .env
```

Edit `.env`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TIMEOUT=30000

# App Configuration
NEXT_PUBLIC_APP_NAME=SISTEM QC BERKAS
NEXT_PUBLIC_APP_VERSION=1.0.0

# Authentication
NEXT_PUBLIC_TOKEN_STORAGE_KEY=access_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=refresh_token

# Features
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_AUDIT_LOG=true

# Analytics (optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
```

---

## 2. DATABASE SETUP

### 2.1 Create PostgreSQL Database

```bash
# Connect ke PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sistem_qc_berkas;

# Create user (optional, for security)
CREATE USER qc_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE sistem_qc_berkas TO qc_user;

# Exit
\q
```

Atau gunakan pgAdmin GUI untuk membuat database.

### 2.2 Run Database Migrations

```bash
cd backend

# Install dependencies first
npm install

# Run migrations
npx prisma migrate deploy

# Seed default data (roles, admin user)
npx prisma db seed
```

Setelah ini, database akan siap dengan tabel dan default data.

---

## 3. BACKEND SETUP

### 3.1 Install Dependencies

```bash
cd backend
npm install
```

### 3.2 Generate Prisma Client

```bash
npx prisma generate
```

### 3.3 Verify Setup

```bash
# Check database connection
npm run prisma:validate

# Check for any issues
npm run lint
```

### 3.4 Start Backend Server

```bash
# Development mode (with auto-reload)
npm run start:dev

# Production mode
npm run start:prod

# Build for production
npm run build
```

Server akan berjalan di: `http://localhost:3001`

### Verify Backend adalah Working

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-26T12:30:00Z"}
```

---

## 4. FRONTEND SETUP

### 4.1 Install Dependencies

```bash
cd frontend
npm install
```

### 4.2 Development Server

```bash
npm run dev

# Server akan berjalan di http://localhost:3000
```

### 4.3 Build untuk Production

```bash
npm run build
npm run start
```

---

## 5. INITIAL DATA SETUP

### 5.1 Default Roles

Seed script akan membuat roles berikut:

```json
[
  {
    "name": "Admin",
    "description": "Administrator dengan akses penuh",
    "permissions": [
      "berkas.read", "berkas.create", "berkas.update", "berkas.delete",
      "users.read", "users.create", "users.update", "users.delete",
      "petugas.read", "petugas.create", "petugas.update", "petugas.delete",
      "roles.read", "roles.create", "roles.update", "roles.delete",
      "dashboard.read",
      "notifications.read"
    ]
  },
  {
    "name": "Supervisor",
    "description": "Supervisor dengan akses terbatas",
    "permissions": [
      "berkas.read", "berkas.update",
      "petugas.read",
      "dashboard.read",
      "notifications.read"
    ]
  },
  {
    "name": "Staff",
    "description": "Staff yang menangani berkas",
    "permissions": [
      "berkas.read",
      "dashboard.read",
      "notifications.read"
    ]
  },
  {
    "name": "Viewer",
    "description": "Viewer dengan akses read-only",
    "permissions": [
      "berkas.read",
      "dashboard.read"
    ]
  }
]
```

### 5.2 Default Admin User

Seed akan membuat:

```
Email: admin@example.com
Password: AdminPassword123!
Role: Admin
```

**PENTING:** Ubah password ini segera setelah login pertama!

### 5.3 Run Seed Script

```bash
cd backend
npm run prisma:seed
```

---

## 6. DOCKER SETUP (Optional)

### 6.1 Build Docker Images

```bash
# Backend
cd backend
docker build -t sistem-qc-berkas-backend:latest .

# Frontend
cd ../frontend
docker build -t sistem-qc-berkas-frontend:latest .
```

### 6.2 Docker Compose

Di root directory, buat `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: sistem-qc-db
    environment:
      POSTGRES_DB: sistem_qc_berkas
      POSTGRES_USER: qc_user
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U qc_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sistem-qc-backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://qc_user:secure_password@postgres:5432/sistem_qc_berkas
      JWT_SECRET: your_jwt_secret
      APP_PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app_network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: sistem-qc-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - app_network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  app_network:
    driver: bridge
```

### 6.3 Start dengan Docker Compose

```bash
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 7. VERIFICATION CHECKLIST

Verifikasi bahwa semuanya sudah berjalan dengan baik:

### Backend Verification

```bash
# Check server is running
curl http://localhost:3001/api/health

# Check database connection
curl http://localhost:3001/api/db-health

# Check Swagger docs
# Open: http://localhost:3001/api/docs
```

### Frontend Verification

```bash
# Open browser
# http://localhost:3000

# Should see login page
# Try login with:
# Email: admin@example.com
# Password: AdminPassword123!
```

### Database Verification

```bash
psql -U postgres -d sistem_qc_berkas

# List tables
\dt

# Count users
SELECT COUNT(*) FROM users;

# Count roles
SELECT COUNT(*) FROM roles;

# Exit
\q
```

---

## 8. DEVELOPMENT WORKFLOW

### 8.1 Start Development Environment

Terminal 1 - Backend:
```bash
cd backend
npm run start:dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 3 - Database (if needed):
```bash
# Monitor database changes
psql -U postgres -d sistem_qc_berkas
```

### 8.2 Hot Reload

- Backend: Automatic dengan NestJS hot reload
- Frontend: Automatic dengan Next.js hot reload
- Database: Manual (run migrations again)

### 8.3 Testing

```bash
# Backend unit tests
cd backend
npm run test

# Backend e2e tests
npm run test:e2e

# Frontend tests
cd ../frontend
npm run test
```

---

## 9. TROUBLESHOOTING

### Issue: Database Connection Error

```
Error: ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Start PostgreSQL (Windows)
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start

# Start PostgreSQL (macOS)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql
```

### Issue: Port Already in Use

```
Error: listen EADDRINUSE :::3001
```

**Solution:**
```bash
# Change port in .env
APP_PORT=3002

# Or kill process using port
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :3001
kill -9 <PID>
```

### Issue: JWT Token Invalid

```
Error: Unauthorized - Invalid token
```

**Solution:**
- Pastikan JWT_SECRET sama di .env
- Token sudah expired? Generate baru dengan login lagi
- Clear browser localStorage dan login kembali

### Issue: CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Update CORS_ORIGIN di backend .env
- Pastikan frontend URL di whitelist

```env
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

### Issue: Prisma Migration Error

```
Error: Migration pending
```

**Solution:**
```bash
# Reset database (development only!)
npx prisma migrate reset

# Or resolve pending migration
npx prisma migrate resolve --rolled-back migration_name
```

---

## 10. USEFUL COMMANDS

### Backend Commands

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Database operations
npm run prisma:migrate        # Create migration
npm run prisma:deploy         # Apply migrations
npm run prisma:generate       # Generate client
npm run prisma:seed           # Seed data
npm run prisma:studio         # Open Prisma Studio

# Testing
npm run test
npm run test:e2e
npm run test:cov              # With coverage

# Code quality
npm run lint
npm run format
npm run type-check
```

### Frontend Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Testing
npm run test
npm run test:coverage

# Linting
npm run lint
npm run format
npm run type-check
```

### Docker Commands

```bash
# Build image
docker build -t sistem-qc-berkas:latest .

# Run container
docker run -p 3001:3001 sistem-qc-berkas:latest

# Docker Compose
docker-compose up -d        # Start
docker-compose down         # Stop
docker-compose ps           # Status
docker-compose logs -f      # Logs
```

---

## 11. NEXT STEPS

Setelah setup selesai:

1. ✅ Login dengan admin account
2. ✅ Ubah password admin
3. ✅ Create roles & permissions sesuai kebutuhan
4. ✅ Create user accounts
5. ✅ Create petugas data
6. ✅ Create initial berkas
7. ✅ Test workflow end-to-end
8. ✅ Setup monitoring & logging
9. ✅ Configure email notifications (optional)
10. ✅ Deploy ke staging

---

## 12. SUPPORT & DOCUMENTATION

Untuk informasi lebih lanjut:

- API Documentation: `http://localhost:3001/api/docs` (Swagger)
- Architecture: Lihat `docs/ARCHITECTURE.md`
- Database: Lihat `docs/DATABASE_SCHEMA.md`
- API Endpoints: Lihat `docs/API_ENDPOINTS.md`

---

**Happy Coding! 🚀**
