# 📋 DOKUMENTASI TEKNIS - MODUL PETUGAS

## 🏗️ ARCHITECTURE OVERVIEW

```
Frontend (Next.js)          Backend (NestJS)         Database (PostgreSQL)
├─ Page: petugas/page.tsx   ├─ Controller              ├─ User
├─ Modal: PetugasModal      ├─ Service                 ├─ Petugas (One-to-One with User)
├─ Modal: DeletePetugasModal├─ Repository              ├─ Berkas (One-to-Many with Petugas)
└─ API Client               └─ DTO                     └─ BerkasHistory
```

## 📂 FILE STRUCTURE

### Frontend

```
src/
├── app/
│   └── petugas/
│       └── page.tsx                    # Main petugas management page
├── components/
│   └── modals/
│       ├── PetugasModal.tsx            # Modal for create/edit petugas
│       └── DeletePetugasModal.tsx      # Confirmation modal for delete
├── lib/
│   └── api.ts                          # API client with interceptors
└── types/
    └── index.ts                        # TypeScript interfaces
```

### Backend

```
src/modules/petugas/
├── controllers/
│   └── petugas.controller.ts           # REST endpoints
├── services/
│   └── petugas.service.ts              # Business logic
├── dto/
│   ├── create-petugas.dto.ts           # Create validation
│   └── update-petugas.dto.ts           # Update validation
└── petugas.module.ts                   # Module configuration
```

## 🔌 API ENDPOINTS

### CREATE - POST /api/petugas

**Request:**

```json
{
  "nama": "Budi Santoso",
  "nip": "198505101",
  "jabatan": "Operator QC",
  "departemen": "Quality Control",
  "userId": "user-uuid-here",
  "phoneNumber": "081234567890",
  "email": "budi@example.com",
  "isActive": true
}
```

**Response Success (201):**

```json
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "id": "petugas-uuid",
    "nama": "Budi Santoso",
    "nip": "198505101",
    "jabatan": "Operator QC",
    "departemen": "Quality Control",
    "userId": "user-uuid",
    "phoneNumber": "081234567890",
    "email": "budi@example.com",
    "isActive": true,
    "createdAt": "2026-01-29T10:00:00Z",
    "updatedAt": "2026-01-29T10:00:00Z"
  }
}
```

**Error Response:**

```json
{
  "statusCode": 400,
  "message": "NIP already exists",
  "error": "BadRequestException"
}
```

### READ - GET /api/petugas

**Query Parameters:**

- `page`: integer (default: 1)
- `limit`: integer (default: 20)
- `isActive`: boolean (optional)
- `departemen`: string (optional)

**Response:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "data": [
      {
        "id": "petugas-uuid-1",
        "nama": "Budi Santoso",
        "nip": "198505101",
        "jabatan": "Operator QC",
        "departemen": "Quality Control",
        "userId": "user-uuid-1",
        "phoneNumber": "081234567890",
        "email": "budi@example.com",
        "isActive": true,
        "createdAt": "2026-01-29T10:00:00Z",
        "updatedAt": "2026-01-29T10:00:00Z",
        "user": {
          "id": "user-uuid-1",
          "email": "budi@example.com",
          "firstName": "Budi",
          "lastName": "Santoso"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

### READ DETAIL - GET /api/petugas/:id

**Response:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "petugas-uuid",
    "nama": "Budi Santoso",
    "nip": "198505101",
    "jabatan": "Operator QC",
    "departemen": "Quality Control",
    "userId": "user-uuid",
    "phoneNumber": "081234567890",
    "email": "budi@example.com",
    "isActive": true,
    "createdAt": "2026-01-29T10:00:00Z",
    "updatedAt": "2026-01-29T10:00:00Z",
    "user": {...},
    "berkas": [...],
    "berkasCount": {
      "total": 5,
      "processed": 3,
      "approved": 2,
      "rejected": 1
    }
  }
}
```

### UPDATE - PATCH /api/petugas/:id

**Request (Minimal):**

```json
{
  "nama": "Budi Santoso Wijaya",
  "nip": "198505102",
  "jabatan": "Senior QC Officer"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "petugas-uuid",
    "nama": "Budi Santoso Wijaya",
    "nip": "198505102",
    "jabatan": "Senior QC Officer",
    ...
  }
}
```

### DELETE - DELETE /api/petugas/:id

**Response Success (200):**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "message": "Petugas deleted successfully"
  }
}
```

**Error Response (Cannot delete with active berkas):**

```json
{
  "statusCode": 400,
  "message": "Cannot delete petugas with active berkas",
  "error": "BadRequestException"
}
```

## 🗄️ DATABASE SCHEMA

### Petugas Table

```sql
CREATE TABLE "Petugas" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nama" VARCHAR NOT NULL,
  "nip" VARCHAR UNIQUE NOT NULL,  -- Unique constraint
  "jabatan" VARCHAR,
  "departemen" VARCHAR,
  "userId" UUID UNIQUE NOT NULL,  -- One-to-One with User
  "phoneNumber" VARCHAR,
  "email" VARCHAR,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT "fk_petugas_user"
    FOREIGN KEY ("userId")
    REFERENCES "User"("id")
    ON DELETE RESTRICT
);

CREATE INDEX "idx_petugas_nip" ON "Petugas"("nip");
CREATE INDEX "idx_petugas_userId" ON "Petugas"("userId");
CREATE INDEX "idx_petugas_isActive" ON "Petugas"("isActive");
```

### Relationships

```
User (1) ──────── (1) Petugas
                     │
                     │ (1)
                     │
                 (M) │
             Berkas ─┘
```

## 🔐 VALIDATION RULES

### CREATE (CreatePetugasDto)

| Field       | Type          | Required | Rules                                         |
| ----------- | ------------- | -------- | --------------------------------------------- |
| nama        | string        | ✅       | Min 2 chars                                   |
| nip         | string        | ✅       | Unique constraint in DB                       |
| jabatan     | string        | ✅       |                                               |
| departemen  | string        | ✅       |                                               |
| userId      | string (UUID) | ✅       | Must exist in User table, Unique (one-to-one) |
| phoneNumber | string        | ❌       | Optional                                      |
| email       | string        | ❌       | Optional, valid email format                  |
| isActive    | boolean       | ❌       | Default: true                                 |

### UPDATE (UpdatePetugasDto)

| Field       | Type    | Required | Rules                           |
| ----------- | ------- | -------- | ------------------------------- |
| nama        | string  | ❌       | If provided, min 2 chars        |
| nip         | string  | ❌       | If provided, must be unique     |
| jabatan     | string  | ❌       |                                 |
| departemen  | string  | ❌       |                                 |
| phoneNumber | string  | ❌       |                                 |
| email       | string  | ❌       | If provided, valid email format |
| isActive    | boolean | ❌       |                                 |

## 🔍 BUSINESS LOGIC

### Create Petugas

1. ✅ Validate NIP is unique
2. ✅ Validate User exists
3. ✅ Check User doesn't already have Petugas profile
4. ✅ Create Petugas record
5. ✅ Return formatted response

### Update Petugas

1. ✅ Validate Petugas exists
2. ✅ If NIP is updated, validate new NIP is unique (and different from current)
3. ✅ Update record
4. ✅ Return formatted response

### Delete Petugas

1. ✅ Validate Petugas exists
2. ✅ Check if Petugas has active Berkas (status != 'archived')
3. ❌ If has active Berkas: reject with error
4. ✅ If no active Berkas: delete Petugas record

## 🎨 FRONTEND COMPONENTS

### PetugasModal.tsx

**Props:**

```typescript
interface PetugasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editPetugas?: Petugas | null;
  users?: User[];
}
```

**Features:**

- Create mode: empty form + user selection dropdown
- Edit mode: form pre-filled from editPetugas
- Edit mode: user field hidden (read-only one-to-one)
- Form validation before submit
- Error display
- Loading state during submission

### DeletePetugasModal.tsx

**Props:**

```typescript
interface DeletePetugasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  petugasName: string;
  petugasId: string;
}
```

**Features:**

- Confirmation with petugas name
- Warning about active berkas
- Error handling

### petugas/page.tsx

**Features:**

- Data fetching with proper response handling
- Table display with all CRUD actions
- Modal management for add/edit/delete/view
- Data refresh without page reload
- Error handling and display

## 🧪 TEST SCENARIOS

### Happy Path

1. Create petugas with all fields
2. View in table
3. Edit petugas
4. View details
5. Delete petugas (after archiving berkas)

### Error Cases

1. Create with duplicate NIP
2. Create with user that already has petugas
3. Edit with duplicate NIP
4. Delete with active berkas
5. Network errors

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Database migration applied (prisma migrate deploy)
- [ ] Prisma client generated (prisma generate)
- [ ] Backend compiled without errors
- [ ] Frontend built without errors
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] CORS configured correctly
- [ ] Authentication guards applied

## 📝 NOTES

### NIP Uniqueness

- NIP has UNIQUE constraint in database
- Validated in both CREATE and UPDATE
- Error message: "NIP already exists"

### User-Petugas Relationship

- One-to-One relationship via userId foreign key
- userId is UNIQUE in Petugas table
- onDelete: RESTRICT (cannot delete user if petugas exists)

### Soft Delete

- Currently using HARD DELETE
- isActive flag exists but not used for soft delete logic
- To implement soft delete: update DELETE endpoint to set isActive = false instead

### Data Privacy

- Password from User not returned in response
- Sensitive fields filtered via select statements

---

**Version**: 1.0
**Last Updated**: 29 January 2026
**Maintained By**: Senior Fullstack Engineer
