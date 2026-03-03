# SYSTEM ARCHITECTURE DOCUMENTATION

## 1. Overview

SISTEM QC BERKAS menggunakan **Enterprise Layered Architecture** dengan 4 layer utama:

```
┌──────────────────────────────────────────┐
│      Presentation Layer                  │
│  (Controllers, API Endpoints, UI)        │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│      Application Layer                   │
│  (Services, Use Cases, Business Logic)   │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│      Domain Layer                        │
│  (Entities, Value Objects, Rules)        │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│      Infrastructure Layer                │
│  (Database, Repositories, Adapters)      │
└──────────────────────────────────────────┘
```

## 2. Layer Descriptions

### 2.1 Presentation Layer (Frontend + Controllers)

**Frontend (Next.js)**
- Page components dalam `app/` directory
- Reusable UI components dalam `components/`
- Custom hooks untuk business logic
- API client untuk komunikasi backend

**Backend (NestJS Controllers)**
- RESTful API endpoints
- Request validation dengan DTOs
- Response formatting
- Error handling & exception filters

**Responsibility:**
- Menerima request dari client
- Validasi input
- Format response
- Handle error responses

**Tidak boleh:**
- Mengakses database langsung
- Mengandung business logic
- Mengakses infrastructure layer

---

### 2.2 Application Layer (Services & Use Cases)

**NestJS Services**
- Business logic implementation
- Use case orchestration
- Transaction management
- Cross-cutting concerns

**Frontend Custom Hooks**
- State management logic
- API call orchestration
- Business logic untuk UI

**Responsibility:**
- Implement business rules
- Orchestrate use cases
- Handle transactions
- Logging & monitoring
- Error transformation

**Tidak boleh:**
- Mengakses database layer langsung (hanya via repositories)
- Mengandung HTTP concerns
- Mengandung UI logic

---

### 2.3 Domain Layer (Entities & Models)

**Entities**
```typescript
// User Entity
export class User {
  id: string;
  email: string;
  password: string;
  roles: Role[];
  createdAt: Date;
}

// Berkas Entity
export class Berkas {
  id: string;
  nama: string;
  status: 'pending' | 'approved' | 'rejected';
  petugas: Petugas;
  createdAt: Date;
}
```

**Value Objects**
- Email, Password hashing
- Status enums
- Contact information

**Business Rules**
- Password complexity
- Status transition rules
- Permission checks

**Responsibility:**
- Define domain models
- Encapsulate business rules
- Entity validations
- Type safety

---

### 2.4 Infrastructure Layer (Database & Repositories)

**Prisma ORM**
- Database schema
- Migrations
- Type-safe queries

**Repositories**
```typescript
// User Repository
export class UserRepository {
  async create(userData): Promise<User>
  async findById(id): Promise<User>
  async findByEmail(email): Promise<User>
  async update(id, data): Promise<User>
  async delete(id): Promise<void>
}
```

**Responsibility:**
- Database operations
- Repository pattern implementation
- Data persistence
- Query optimization

---

## 3. Data Flow

### 3.1 Request Flow (Backend)

```
1. Client HTTP Request
        ↓
2. Controller (Presentation Layer)
   - Validate DTO
   - Parse request
        ↓
3. Service (Application Layer)
   - Execute business logic
   - Manage transactions
        ↓
4. Repository (Infrastructure Layer)
   - Query database via Prisma
   - Return data
        ↓
5. Service (map to response)
        ↓
6. Controller (format response)
        ↓
7. HTTP Response to Client
```

### 3.2 Frontend Data Flow

```
1. User Action (click button, submit form)
        ↓
2. Component Event Handler
        ↓
3. Custom Hook (with API call)
        ↓
4. API Client (axios request)
        ↓
5. Backend API
   (sama dengan backend flow)
        ↓
6. Response to Hook
        ↓
7. Update Component State
        ↓
8. Re-render Component
```

---

## 4. Module Structure (Backend)

Setiap module memiliki struktur:

```
modules/
├── auth/
│   ├── controllers/
│   │   └── auth.controller.ts
│   ├── services/
│   │   └── auth.service.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── repositories/
│   │   └── user.repository.ts
│   ├── guards/
│   │   └── jwt.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── auth.module.ts
│
├── berkas/
│   ├── controllers/
│   ├── services/
│   ├── dto/
│   ├── entities/
│   ├── repositories/
│   └── berkas.module.ts
│
└── dashboard/
    ├── controllers/
    ├── services/
    ├── dto/
    └── dashboard.module.ts
```

---

## 5. Design Patterns

### 5.1 Repository Pattern
```typescript
// Interface
export interface IUserRepository {
  create(user: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

// Implementation
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}
  
  async create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
```

### 5.2 Service Layer Pattern
```typescript
@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}
  
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Business logic
    const hashedPassword = await hash(createUserDto.password);
    
    // Call repository
    return this.userRepository.create({
      ...createUserDto,
      password: hashedPassword
    });
  }
}
```

### 5.3 DTO Pattern
```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;
  
  @MinLength(8)
  password: string;
  
  @IsArray()
  roleIds: string[];
}
```

### 5.4 Guard Pattern (NestJS)
```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    
    if (!token) return false;
    
    try {
      request.user = this.jwtService.verify(token);
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## 6. Authentication Flow

```
Login Request (email, password)
        ↓
Auth Controller
        ↓
Auth Service
  - Validate credentials
  - Hash password comparison
        ↓
JWT Service
  - Generate access token
  - Generate refresh token
        ↓
Response with tokens
        ↓
Client stores tokens (localStorage/sessionStorage)
        ↓
Subsequent Requests
  - Include JWT in Authorization header
  - JwtAuthGuard validates token
  - Request.user populated with decoded token
```

---

## 7. Database Relations

```
┌─────────────┐
│   Users     │
├─────────────┤
│ id (PK)     │◄──────┐
│ email       │       │
│ password    │       │
└─────────────┘       │
        │              │
        │ (1:M)        │
        ▼              │
┌──────────────────────┤
│   User_Roles (JT)    │
├──────────────────────┤
│ userId (FK)          │
│ roleId (FK)          │
└──────────────────────┤
        │              │
        │              │(1:M)
        ▼              │
┌─────────────┐        │
│   Roles     │        │
├─────────────┤        │
│ id (PK)     │────────┘
│ name        │
│ permissions │
└─────────────┘

┌─────────────┐
│   Berkas    │
├─────────────┤
│ id (PK)     │
│ nama        │
│ status      │
│ petugasId   │◄──────┐
│ createdAt   │       │
└─────────────┘       │
        │(1:M)        │
        ▼              │
┌──────────────────┐   │
│ Berkas_History   │   │
├──────────────────┤   │
│ id (PK)          │   │
│ berkasId (FK)    │   │
│ oldStatus        │   │
│ newStatus        │   │
│ changedBy        │   │
│ changedAt        │   │
└──────────────────┘   │
                       │
                       │
┌──────────────┐       │
│   Petugas    │       │
├──────────────┤       │
│ id (PK)      │───────┘
│ nama         │
│ userId (FK)  │
└──────────────┘
```

---

## 8. Error Handling

### Unified Exception Handling
```typescript
// Global Exception Filter
@Catch(Exception)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = 500;
    let message = 'Internal server error';
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }
    
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Custom Exceptions
```typescript
export class UserNotFoundException extends NotFoundException {
  constructor() {
    super('User not found');
  }
}

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('Invalid credentials');
  }
}
```

---

## 9. Security Considerations

1. **Authentication**
   - JWT tokens dengan expiration
   - Refresh token rotation
   - Secure token storage (httpOnly cookies recommended)

2. **Authorization**
   - Role-Based Access Control (RBAC)
   - Resource-based authorization
   - Permission checking at service level

3. **Data Protection**
   - Password hashing dengan bcryptjs
   - CORS configuration
   - Input validation & sanitization
   - SQL injection prevention (via Prisma)

4. **Audit & Logging**
   - Log all important operations
   - Track user activities
   - Maintain audit trail

---

## 10. Dependency Injection

**NestJS DI Container**
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    {
      provide: 'USER_REPOSITORY',
      useClass: UserRepository,
    }
  ]
})
export class UserModule {}
```

**Usage**
```typescript
@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY') private userRepository: IUserRepository
  ) {}
}
```

---

## 11. Testing Strategy

### Backend Testing
```
Unit Tests
- Service methods
- Repository queries
- Business logic

Integration Tests
- Controller endpoints
- Database operations
- Authentication flow

E2E Tests
- Full request/response cycle
- User workflows
```

### Frontend Testing
```
Component Tests
- Rendering
- User interactions
- Props passing

Integration Tests
- API calls
- State management
- Navigation
```

---

## 12. Scalability Considerations

1. **Horizontal Scaling**
   - Stateless services
   - Database connection pooling
   - Cache layer (Redis)

2. **Performance**
   - Database indexing
   - Query optimization
   - Pagination implementation
   - Caching strategies

3. **Load Balancing**
   - API Gateway
   - Request distribution
   - Session management

---

## 13. Development Workflow

```
1. Create Feature Branch
   git checkout -b feature/user-management

2. Backend Development
   - Create models/entities
   - Create repositories
   - Create services
   - Create controllers
   - Add tests

3. Frontend Development
   - Create components
   - Create hooks
   - Create pages
   - Add tests

4. Integration Testing
   - API testing
   - E2E testing

5. Code Review
   - PR created
   - Review changes
   - Approval

6. Merge & Deploy
   - Merge to main
   - Run CI/CD
   - Deploy to staging
   - Test in staging
   - Deploy to production
```

---

## Summary

Arsitektur ini dirancang untuk:
- ✅ Scalability (horizontal & vertical)
- ✅ Maintainability (clear separation of concerns)
- ✅ Testability (dependency injection)
- ✅ Security (authentication, authorization, audit)
- ✅ Performance (optimization, caching)
- ✅ Flexibility (easy to add new features)

Setiap layer memiliki tanggung jawab yang jelas dan tidak boleh mengakses layer yang tidak berdekatan secara langsung.
