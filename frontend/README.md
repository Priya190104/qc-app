# Frontend - SISTEM QC BERKAS

Next.js + TypeScript + Tailwind CSS frontend application untuk SISTEM QC BERKAS (Document Quality Control System).

## 🚀 Tech Stack

- **Framework**: Next.js 14.0.0 (App Router)
- **Language**: TypeScript 5.3.2
- **Styling**: Tailwind CSS 3.3.6
- **HTTP Client**: Axios 1.6.0
- **State Management**: Zustand 4.4.1
- **Icons**: Lucide React 0.292.0
- **Date Utilities**: date-fns 2.30.0
- **Development**: ESLint, Prettier

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── auth/                # Authentication pages
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   ├── dashboard/           # Dashboard pages
│   ├── berkas/             # Document management pages
│   ├── petugas/            # Staff management pages
│   ├── akun/               # Account management pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirects to login)
│   └── globals.css         # Global styles
├── components/              # Reusable React components
│   ├── ui/                 # UI components (Button, Input, Card, Alert)
│   ├── layout/             # Layout components (Header, Sidebar, Footer)
│   ├── forms/              # Form components (LoginForm, RegisterForm)
│   └── tables/             # Table components
├── hooks/                   # Custom React hooks
│   └── useAuth.ts          # Authentication hook
├── lib/                     # Utility functions and helpers
│   ├── api.ts              # Axios API client with interceptors
│   └── auth.ts             # Authentication service
├── stores/                  # Zustand state management
│   └── index.ts            # Auth, User, Notification stores
├── types/                   # TypeScript type definitions
│   └── index.ts            # All application types
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Setup Steps

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
# atau
yarn install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` dan sesuaikan:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=SISTEM QC BERKAS
NEXT_PUBLIC_VERSION=1.0.0
NEXT_PUBLIC_ACCESS_TOKEN_KEY=accessToken
NEXT_PUBLIC_REFRESH_TOKEN_KEY=refreshToken
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_AUDIT_LOGS=true
```

4. **Run development server**
```bash
npm run dev
# atau
yarn dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📖 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 🔐 Authentication

### Login
- **Default Admin Email**: admin@example.com
- **Default Password**: AdminPassword123!

### Authentication Flow
1. User logs in dengan email dan password
2. Backend returns `accessToken` dan `refreshToken`
3. Tokens disimpan di localStorage
4. API client automatically menambahkan token ke request headers
5. Token refresh otomatis jika expired

### Routes Protection
- `/auth/login` - Halaman login (public)
- `/auth/register` - Halaman registrasi (public)
- `/dashboard/*` - Protected routes (requires authentication)

## 🎨 UI Components

### Available Components

**UI Components** (`src/components/ui/`)
- `Button` - Reusable button dengan variants (primary, secondary, danger, outline)
- `Input` - Form input dengan label dan error messages
- `Card` - Container component dengan title dan subtitle
- `Alert` - Alert messages dengan different types (success, error, warning, info)

**Form Components** (`src/components/forms/`)
- `LoginForm` - Login form dengan validasi
- `RegisterForm` - Registration form dengan password strength indicator

### Component Usage

```tsx
import { Button, Input, Card, Alert } from '@/components/ui';

// Button
<Button variant="primary" size="lg" isLoading={false}>
  Click me
</Button>

// Input
<Input
  label="Email"
  type="email"
  placeholder="user@example.com"
  error={error}
  helperText="Enter your email address"
/>

// Card
<Card title="My Card" subtitle="Card subtitle">
  Card content here
</Card>

// Alert
<Alert
  type="success"
  title="Success"
  message="Operation completed successfully"
  onClose={() => {}}
/>
```

## 🔌 API Integration

### API Client

API client sudah dikonfigurasi di `src/lib/api.ts` dengan:
- Request/response interceptors
- Automatic token injection
- Automatic token refresh
- Error handling

### Usage Example

```tsx
import { apiClient } from '@/lib/api';
import { User, ApiResponse } from '@/types';

// GET request
const response = await apiClient.get<ApiResponse<User>>('/users/me');
const user = response.data.data;

// POST request
const result = await apiClient.post<ApiResponse<User>>('/users', userData);

// PATCH request
await apiClient.patch(`/users/${id}`, updateData);

// DELETE request
await apiClient.delete(`/users/${id}`);
```

## 🎯 State Management

### Zustand Stores

**Auth Store** (`useAuthStore`)
```tsx
import { useAuthStore } from '@/stores';

const { user, isAuthenticated, setUser, logout } = useAuthStore();
```

**User Store** (`useUserStore`)
```tsx
import { useUserStore } from '@/stores';

const { users, currentUser, addUser, updateUser } = useUserStore();
```

**Notification Store** (`useNotificationStore`)
```tsx
import { useNotificationStore } from '@/stores';

const { notifications, unreadCount, addNotification } = useNotificationStore();
```

## 📝 Form Validation

Login Form:
- Email validation (format and required)
- Password validation (min 6 characters)

Register Form:
- Email validation
- First name & last name required
- Password strength requirements:
  - Min 8 characters
  - Contains uppercase letters
  - Contains lowercase letters
  - Contains numbers
  - Contains special characters (@$!%*?&)
- Password confirmation match

## 🚀 Deployment

### Build & Deploy

```bash
# Build production
npm run build

# Test production build locally
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t sistem-qc-berkas-frontend .

# Run container
docker run -p 3000:3000 sistem-qc-berkas-frontend
```

## 📊 API Endpoints

Lihat `docs/API_ENDPOINTS.md` untuk dokumentasi lengkap semua API endpoints.

### Key Endpoints

**Authentication**
- POST `/auth/login` - User login
- POST `/auth/register` - User registration
- POST `/auth/refresh` - Refresh access token

**Dashboard**
- GET `/dashboard/metrics` - Get dashboard metrics
- GET `/dashboard/activities` - Get recent activities
- GET `/dashboard/recent-changes` - Get recent changes

**Berkas** (Documents)
- GET `/berkas` - List all documents
- POST `/berkas` - Create new document
- GET `/berkas/:id` - Get document details
- PATCH `/berkas/:id` - Update document
- PATCH `/berkas/:id/status` - Change document status
- PATCH `/berkas/:id/assign` - Assign document to staff

**Users**
- GET `/users` - List all users
- POST `/users` - Create new user
- GET `/users/:id` - Get user details
- PATCH `/users/:id` - Update user
- DELETE `/users/:id` - Delete user

## 🐛 Troubleshooting

### Common Issues

**1. API Connection Error**
```
Pastikan backend server berjalan di http://localhost:3001
Check NEXT_PUBLIC_API_URL di .env.local
```

**2. Authentication Token Expired**
```
Frontend akan otomatis refresh token
Jika tidak berhasil, user akan diarahkan ke login page
```

**3. CORS Error**
```
Backend harus mengizinkan CORS dari frontend
Check CORS_ORIGIN di backend .env
```

## 📚 Documentation

- [Backend Documentation](../backend/README.md)
- [Database Schema](../docs/DATABASE_SCHEMA.md)
- [API Endpoints](../docs/API_ENDPOINTS.md)
- [Architecture](../docs/ARCHITECTURE.md)

## 🤝 Contributing

1. Create feature branch
2. Commit changes
3. Push to branch
4. Create Pull Request

## 📄 License

ISC License - Lihat LICENSE file untuk details

## 👨‍💻 Developer

Built with ❤️ for Document Quality Control System

---

**Last Updated**: January 2026
