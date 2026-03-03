# API ENDPOINTS DOCUMENTATION

## Base URL

```
Development: http://localhost:3001/api
Production: https://api.sistem-qc-berkas.com/api
```

## Authentication

All endpoints (except Login & Register) require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Register

Create new user account.

```
POST /auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "08123456789" (optional)
}

Response (201 Created):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-26T10:30:00Z",
  "token": "eyJhbGc..."
}

Error (400 Bad Request):
{
  "statusCode": 400,
  "message": "Email already exists",
  "error": "BadRequest"
}

Error (422 Unprocessable Entity):
{
  "statusCode": 422,
  "message": [
    "email must be an email",
    "password must contain uppercase, lowercase, and number"
  ]
}
```

### 1.2 Login

Authenticate user and get JWT tokens.

```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "Password123!"
}

Response (200 OK):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": [
    {
      "id": "role-uuid",
      "name": "Admin",
      "permissions": ["berkas.read", "berkas.create", ...]
    }
  ],
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}

Error (401 Unauthorized):
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}

Error (404 Not Found):
{
  "statusCode": 404,
  "message": "User not found",
  "error": "NotFound"
}
```

### 1.3 Refresh Token

Get new access token using refresh token.

```
POST /auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}

Error (401 Unauthorized):
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### 1.4 Logout

Invalidate current session.

```
POST /auth/logout
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "message": "Logged out successfully"
}
```

### 1.5 Get Current User

Get authenticated user profile.

```
GET /auth/me
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "08123456789",
  "roles": [
    {
      "id": "role-uuid",
      "name": "Admin"
    }
  ],
  "lastLoginAt": "2024-01-26T10:30:00Z",
  "createdAt": "2024-01-20T08:00:00Z"
}
```

---

## 2. USERS MANAGEMENT ENDPOINTS

All endpoints require `users.read` or `users.write` permission.

### 2.1 Get All Users

```
GET /users?page=1&limit=20&search=john&sort=createdAt&order=desc
Authorization: Bearer <jwt_token>

Query Parameters:
- page: Page number (default: 1)
- limit: Records per page (default: 20, max: 100)
- search: Search by email, firstName, lastName
- sort: Sort by field (createdAt, email, etc.)
- order: asc or desc (default: desc)
- isActive: Filter by active status (true/false)

Response (200 OK):
{
  "data": [
    {
      "id": "uuid",
      "email": "user1@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "08123456789",
      "isActive": true,
      "lastLoginAt": "2024-01-26T10:30:00Z",
      "createdAt": "2024-01-20T08:00:00Z",
      "roles": [
        {
          "id": "role-uuid",
          "name": "Admin"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 2.2 Get User by ID

```
GET /users/:id
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "08123456789",
  "isActive": true,
  "roles": [
    {
      "id": "role-uuid",
      "name": "Admin",
      "permissions": ["berkas.read", "berkas.create", ...]
    }
  ],
  "lastLoginAt": "2024-01-26T10:30:00Z",
  "createdAt": "2024-01-20T08:00:00Z"
}

Error (404 Not Found):
{
  "statusCode": 404,
  "message": "User not found"
}
```

### 2.3 Create User

```
POST /users
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "08987654321",
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}

Response (201 Created):
{
  "id": "new-user-uuid",
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "08987654321",
  "isActive": true,
  "roles": [
    {
      "id": "role-uuid",
      "name": "Admin"
    }
  ],
  "createdAt": "2024-01-26T12:00:00Z"
}

Error (400 Bad Request):
{
  "statusCode": 400,
  "message": "Email already exists"
}
```

### 2.4 Update User

```
PATCH /users/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body (all optional):
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "08987654321",
  "isActive": true,
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}

Response (200 OK):
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "08987654321",
  "isActive": true,
  "roles": [
    {
      "id": "role-uuid",
      "name": "Admin"
    }
  ],
  "updatedAt": "2024-01-26T12:30:00Z"
}
```

### 2.5 Delete User

```
DELETE /users/:id
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "message": "User deleted successfully"
}

Error (409 Conflict):
{
  "statusCode": 409,
  "message": "Cannot delete user with active berkas"
}
```

### 2.6 Change Password

```
POST /users/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "oldPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}

Response (200 OK):
{
  "message": "Password changed successfully"
}

Error (401 Unauthorized):
{
  "statusCode": 401,
  "message": "Current password is incorrect"
}
```

### 2.7 Reset Password

```
POST /users/:id/reset-password
Authorization: Bearer <jwt_token> (Admin only)
Content-Type: application/json

Request Body:
{
  "newPassword": "NewPassword123!"
}

Response (200 OK):
{
  "message": "Password reset successfully"
}
```

---

## 3. ROLES MANAGEMENT ENDPOINTS

All endpoints require `roles.read` or `roles.write` permission.

### 3.1 Get All Roles

```
GET /roles?page=1&limit=20&isActive=true
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "data": [
    {
      "id": "role-uuid",
      "name": "Admin",
      "description": "Administrator role with full access",
      "permissions": [
        "berkas.read",
        "berkas.create",
        "berkas.update",
        "berkas.delete",
        "users.read",
        "users.create",
        "users.update",
        "users.delete"
      ],
      "isActive": true,
      "createdAt": "2024-01-20T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### 3.2 Get Role by ID

```
GET /roles/:id
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "id": "role-uuid",
  "name": "Admin",
  "description": "Administrator role",
  "permissions": [...],
  "isActive": true,
  "createdAt": "2024-01-20T08:00:00Z"
}
```

### 3.3 Create Role

```
POST /roles
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "name": "Supervisor",
  "description": "Supervisor role with limited access",
  "permissions": [
    "berkas.read",
    "berkas.update",
    "petugas.read"
  ],
  "isActive": true
}

Response (201 Created):
{
  "id": "new-role-uuid",
  "name": "Supervisor",
  "description": "Supervisor role with limited access",
  "permissions": [...],
  "isActive": true,
  "createdAt": "2024-01-26T12:00:00Z"
}
```

### 3.4 Update Role

```
PATCH /roles/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "description": "Updated description",
  "permissions": ["berkas.read", "berkas.update"],
  "isActive": false
}

Response (200 OK):
{
  "id": "role-uuid",
  "name": "Supervisor",
  "description": "Updated description",
  "permissions": [...],
  "isActive": false,
  "updatedAt": "2024-01-26T12:30:00Z"
}
```

### 3.5 Delete Role

```
DELETE /roles/:id
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "message": "Role deleted successfully"
}

Error (409 Conflict):
{
  "statusCode": 409,
  "message": "Cannot delete role with active users"
}
```

---

## 4. BERKAS MANAGEMENT ENDPOINTS

All endpoints require appropriate permissions.

### 4.1 Get All Berkas

```
GET /berkas?page=1&limit=20&status=pending&petugasId=uuid&search=doc
Authorization: Bearer <jwt_token>

Query Parameters:
- page: Page number
- limit: Records per page
- status: Filter by status (pending, in_review, approved, rejected, archived)
- petugasId: Filter by assigned petugas
- createdBy: Filter by creator
- dateFrom: From date (YYYY-MM-DD)
- dateTo: To date (YYYY-MM-DD)
- sort: Sort field
- order: asc/desc

Response (200 OK):
{
  "data": [
    {
      "id": "berkas-uuid",
      "nama": "Document ABC",
      "nomor": "DOC-2024-001",
      "status": "pending",
      "deskripsi": "Important document",
      "filePath": "/uploads/doc-abc.pdf",
      "fileSize": 1024000,
      "fileType": "pdf",
      "petugas": {
        "id": "petugas-uuid",
        "nama": "John Staff",
        "nip": "NIP-001"
      },
      "createdBy": {
        "id": "user-uuid",
        "email": "user@example.com",
        "firstName": "Admin"
      },
      "createdAt": "2024-01-20T08:00:00Z",
      "updatedAt": "2024-01-26T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 4.2 Get Berkas by ID

```
GET /berkas/:id
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "id": "berkas-uuid",
  "nama": "Document ABC",
  "nomor": "DOC-2024-001",
  "status": "pending",
  "deskripsi": "Important document",
  "filePath": "/uploads/doc-abc.pdf",
  "fileSize": 1024000,
  "fileType": "pdf",
  "petugas": {
    "id": "petugas-uuid",
    "nama": "John Staff",
    "nip": "NIP-001",
    "jabatan": "Quality Checker",
    "departemen": "QC"
  },
  "createdBy": {
    "id": "user-uuid",
    "email": "user@example.com"
  },
  "approvedBy": {
    "id": "approver-uuid",
    "email": "approver@example.com"
  },
  "history": [
    {
      "id": "history-uuid",
      "oldStatus": "pending",
      "newStatus": "in_review",
      "changedBy": "Admin User",
      "reason": "Assigning for review",
      "changedAt": "2024-01-21T08:00:00Z"
    }
  ],
  "createdAt": "2024-01-20T08:00:00Z",
  "updatedAt": "2024-01-26T10:30:00Z"
}
```

### 4.3 Create Berkas

```
POST /berkas
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
{
  "nama": "Document ABC",
  "nomor": "DOC-2024-001",
  "deskripsi": "Important document",
  "file": <binary file>,
  "petugasId": "petugas-uuid" (optional)
}

Response (201 Created):
{
  "id": "new-berkas-uuid",
  "nama": "Document ABC",
  "nomor": "DOC-2024-001",
  "status": "pending",
  "deskripsi": "Important document",
  "filePath": "/uploads/doc-abc.pdf",
  "fileSize": 1024000,
  "fileType": "pdf",
  "createdAt": "2024-01-26T12:00:00Z"
}
```

### 4.4 Update Berkas

```
PATCH /berkas/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body (all optional):
{
  "nama": "Updated name",
  "deskripsi": "Updated description",
  "petugasId": "petugas-uuid"
}

Response (200 OK):
{
  "id": "berkas-uuid",
  "nama": "Updated name",
  "deskripsi": "Updated description",
  "updatedAt": "2024-01-26T12:30:00Z"
}
```

### 4.5 Change Berkas Status

```
PATCH /berkas/:id/status
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "status": "approved|rejected",
  "reason": "Reason for status change (required for rejection)"
}

Response (200 OK):
{
  "id": "berkas-uuid",
  "status": "approved",
  "approvedBy": {
    "id": "user-uuid",
    "email": "approver@example.com"
  },
  "updatedAt": "2024-01-26T12:30:00Z"
}

Error (400 Bad Request):
{
  "statusCode": 400,
  "message": "Invalid status transition from pending to archived"
}
```

### 4.6 Assign Berkas to Petugas

```
PATCH /berkas/:id/assign
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "petugasId": "petugas-uuid"
}

Response (200 OK):
{
  "id": "berkas-uuid",
  "petugas": {
    "id": "petugas-uuid",
    "nama": "John Staff",
    "nip": "NIP-001"
  },
  "updatedAt": "2024-01-26T12:30:00Z"
}
```

### 4.7 Delete Berkas

```
DELETE /berkas/:id
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "message": "Berkas deleted successfully"
}
```

### 4.8 Import Berkas (Excel/CSV)

```
POST /berkas/import
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
{
  "file": <binary file>,
  "format": "excel|csv"
}

File Format (Excel):
| nama | nomor | deskripsi | petugasId |
|------|-------|-----------|-----------|
| Doc 1 | DOC-001 | Desc 1 | petugas-uuid |
| Doc 2 | DOC-002 | Desc 2 | petugas-uuid |

Response (200 OK):
{
  "message": "Import successful",
  "imported": 10,
  "failed": 0,
  "errors": []
}

Error (400 Bad Request):
{
  "statusCode": 400,
  "message": "Import failed",
  "imported": 8,
  "failed": 2,
  "errors": [
    {
      "row": 3,
      "error": "Petugas not found"
    }
  ]
}
```

### 4.9 Export Berkas

```
GET /berkas/export?status=pending&format=excel|pdf
Authorization: Bearer <jwt_token>

Query Parameters:
- status: Filter by status (optional)
- format: excel or pdf (default: excel)
- dateFrom: From date (optional)
- dateTo: To date (optional)

Response (200 OK):
Binary file download
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="berkas_export_2024-01-26.xlsx"
```

---

## 5. PETUGAS MANAGEMENT ENDPOINTS

### 5.1 Get All Petugas

```
GET /petugas?page=1&limit=20&isActive=true&departemen=QC
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "data": [
    {
      "id": "petugas-uuid",
      "nama": "John Staff",
      "nip": "NIP-001",
      "jabatan": "Quality Checker",
      "departemen": "QC",
      "phoneNumber": "08123456789",
      "email": "john@example.com",
      "isActive": true,
      "user": {
        "id": "user-uuid",
        "email": "john@example.com",
        "firstName": "John"
      },
      "berkasCount": 5,
      "createdAt": "2024-01-20T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

### 5.2 Get Petugas by ID

```
GET /petugas/:id
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "id": "petugas-uuid",
  "nama": "John Staff",
  "nip": "NIP-001",
  "jabatan": "Quality Checker",
  "departemen": "QC",
  "phoneNumber": "08123456789",
  "email": "john@example.com",
  "isActive": true,
  "user": {
    "id": "user-uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Staff"
  },
  "berkas": [
    {
      "id": "berkas-uuid",
      "nama": "Document ABC",
      "nomor": "DOC-001",
      "status": "in_review"
    }
  ],
  "createdAt": "2024-01-20T08:00:00Z"
}
```

### 5.3 Create Petugas

```
POST /petugas
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "nama": "Jane Smith",
  "nip": "NIP-002",
  "jabatan": "Senior Quality Checker",
  "departemen": "QC",
  "phoneNumber": "08987654321",
  "email": "jane@example.com",
  "userId": "user-uuid"
}

Response (201 Created):
{
  "id": "new-petugas-uuid",
  "nama": "Jane Smith",
  "nip": "NIP-002",
  "jabatan": "Senior Quality Checker",
  "departemen": "QC",
  "phoneNumber": "08987654321",
  "email": "jane@example.com",
  "isActive": true,
  "createdAt": "2024-01-26T12:00:00Z"
}
```

### 5.4 Update Petugas

```
PATCH /petugas/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body (all optional):
{
  "nama": "Jane Smith Updated",
  "jabatan": "Lead Quality Checker",
  "departemen": "QC Management",
  "phoneNumber": "08999999999",
  "email": "jane.updated@example.com",
  "isActive": true
}

Response (200 OK):
{
  "id": "petugas-uuid",
  "nama": "Jane Smith Updated",
  "jabatan": "Lead Quality Checker",
  "updatedAt": "2024-01-26T12:30:00Z"
}
```

### 5.5 Delete Petugas

```
DELETE /petugas/:id
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "message": "Petugas deleted successfully"
}

Error (409 Conflict):
{
  "statusCode": 409,
  "message": "Cannot delete petugas with active berkas"
}
```

---

## 6. DASHBOARD ENDPOINTS

### 6.1 Get Dashboard Metrics

```
GET /dashboard/metrics?dateFrom=2024-01-01&dateTo=2024-01-31
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "summary": {
    "totalBerkas": 150,
    "pendingBerkas": 45,
    "approvedBerkas": 80,
    "rejectedBerkas": 15,
    "archivedBerkas": 10
  },
  "statusDistribution": {
    "pending": {
      "count": 45,
      "percentage": 30
    },
    "in_review": {
      "count": 30,
      "percentage": 20
    },
    "approved": {
      "count": 80,
      "percentage": 53
    },
    "rejected": {
      "count": 15,
      "percentage": 10
    },
    "archived": {
      "count": 10,
      "percentage": 7
    }
  },
  "topPetugas": [
    {
      "id": "petugas-uuid",
      "nama": "John Staff",
      "processedCount": 25,
      "approvedCount": 20,
      "rejectedCount": 5
    }
  ],
  "recentActivities": [
    {
      "type": "berkas_status_changed",
      "description": "Document ABC approved",
      "user": "Admin User",
      "timestamp": "2024-01-26T10:30:00Z"
    }
  ]
}
```

### 6.2 Get User Activities

```
GET /dashboard/activities?userId=user-uuid&page=1&limit=50
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "data": [
    {
      "id": "activity-uuid",
      "user": {
        "id": "user-uuid",
        "email": "user@example.com",
        "firstName": "John"
      },
      "action": "CREATE",
      "entity": "berkas",
      "entityId": "berkas-uuid",
      "description": "Created document ABC",
      "timestamp": "2024-01-26T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "totalPages": 5
  }
}
```

### 6.3 Get System Health

```
GET /dashboard/health
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "database": {
    "status": "healthy",
    "responseTime": "15ms"
  },
  "api": {
    "status": "healthy",
    "uptime": "99.9%"
  },
  "activeUsers": 25,
  "requestsPerMinute": 150,
  "timestamp": "2024-01-26T12:30:00Z"
}
```

---

## 7. NOTIFICATIONS ENDPOINTS

### 7.1 Get Notifications

```
GET /notifications?page=1&limit=20&isRead=false
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "data": [
    {
      "id": "notification-uuid",
      "type": "status_change",
      "title": "Document Status Changed",
      "message": "Document ABC status changed to approved",
      "data": {
        "berkasId": "berkas-uuid",
        "oldStatus": "pending",
        "newStatus": "approved"
      },
      "isRead": false,
      "createdAt": "2024-01-26T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 7.2 Mark Notification as Read

```
PATCH /notifications/:id/read
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "id": "notification-uuid",
  "isRead": true,
  "readAt": "2024-01-26T12:30:00Z"
}
```

### 7.3 Mark All Notifications as Read

```
PATCH /notifications/mark-all-read
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "message": "All notifications marked as read"
}
```

### 7.4 Delete Notification

```
DELETE /notifications/:id
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "message": "Notification deleted successfully"
}
```

---

## 8. ERROR RESPONSES

### Standard Error Format

```
{
  "statusCode": 400,
  "message": "Error description",
  "error": "BadRequest",
  "timestamp": "2024-01-26T12:30:00Z",
  "path": "/api/users"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Server error |

---

## 9. PAGINATION

All list endpoints support pagination:

```
Query Parameters:
- page: Page number (default: 1, min: 1)
- limit: Records per page (default: 20, max: 100)

Response includes:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 10. SORTING & FILTERING

### Sorting

```
GET /berkas?sort=createdAt&order=desc
GET /berkas?sort=nama&order=asc
```

Available sort fields depend on each endpoint.

### Filtering

```
GET /berkas?status=pending&petugasId=uuid&createdBy=user-uuid
GET /users?isActive=true&search=john
```

---

## 11. RATE LIMITING

API menggunakan rate limiting untuk mencegah abuse:

```
Rate Limit: 100 requests per minute per IP
Rate Limit: 1000 requests per hour per user

Headers:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1704950400

Error (429 Too Many Requests):
{
  "statusCode": 429,
  "message": "Too many requests, please try again later"
}
```

---

## 12. EXAMPLE WORKFLOWS

### Workflow 1: Login & Access Dashboard

```
1. POST /auth/login
   Response: accessToken, refreshToken

2. GET /auth/me
   Headers: Authorization: Bearer <accessToken>
   Response: User profile

3. GET /dashboard/metrics
   Headers: Authorization: Bearer <accessToken>
   Response: Dashboard metrics
```

### Workflow 2: Create & Approve Berkas

```
1. POST /berkas
   Create new document
   Response: berkasId

2. PATCH /berkas/:id/assign
   Assign to petugas

3. PATCH /berkas/:id/status
   Change status to "approved"
   Response: Updated berkas with history
```

### Workflow 3: Import & Export

```
1. POST /berkas/import
   Upload Excel file
   Response: Import result

2. GET /berkas/export?format=excel
   Export filtered berkas
   Response: Excel file download
```
