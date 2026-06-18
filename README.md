# Nexora — B2B SaaS Workspace Platform

A production-grade multi-tenant B2B SaaS platform that enables organizations to build custom data modules, manage records, and collaborate with team members — all with complete data isolation between organizations.

Built with **Spring Boot**, **React**, **MongoDB**, and **MySQL**.

---

## 🚀 Features

### Core
- 🏢 **Multi-tenant architecture** — complete org-level data isolation using `orgId`
- ⊞ **Dynamic module builder** — create custom modules with any field types (text, number, date, dropdown, file, etc.)
- ◫ **Sub-modules & nesting** — recursive sub-module support within any module
- 📄 **Record management** — full CRUD with search, filter, and pagination
- 👥 **Role-based access control** — ADMIN / STAFF / VIEWER roles per organization

### Authentication & Security
- 🔐 **JWT authentication** — stateless, secure token-based auth
- 🔒 **Spring Security** — route and method-level protection
- 📧 **Email invite system** — invite team members via email with role assignment
- 🔑 **Forgot password** — OTP-based password reset flow

### Plans & Billing
- 💳 **Tiered subscription plans** — STARTER (Free) / PROFESSIONAL / ENTERPRISE
- 🔒 **Plan-based feature gating** — frontend + backend enforcement
- 💰 **PayU payment gateway** — real payment integration with SHA-512 hash verification
- ⏳ **14-day free trial** — automatic trial for Professional plan

### Advanced Features
- 🗑️ **Recycle bin** — soft delete with 30-day restore window (Pro)
- 📋 **Activity logs** — full audit trail of all actions across the workspace (Pro)
- ↓ **PDF export** — export records as PDF (Pro)
- 📊 **Analytics dashboard** — usage stats, charts, and plan limit tracking
- 🌐 **Super Admin panel** — platform-wide org management, analytics, and settings

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3, Spring Security, Spring Data JPA, Spring Data MongoDB |
| Frontend | React 18, Vite, React Router, Axios |
| Database (Users/Auth) | MySQL 8 |
| Database (Modules/Records) | MongoDB |
| Authentication | JWT (jjwt) |
| Payment | PayU Payment Gateway |
| PDF Export | jsPDF |
| Email | Spring Mail (SMTP) |
| Build Tool | Maven |

---

## 📁 Project Structure

nexora/

├── backend/                          # Spring Boot application

│   └── src/main/java/com/example/rms/

│       ├── controller/               # REST controllers

│       │   ├── AuthController.java

│       │   ├── ModuleController.java

│       │   ├── RecordController.java

│       │   ├── UserController.java

│       │   ├── PaymentController.java

│       │   ├── RecycleBinController.java

│       │   └── SuperAdminController.java

│       ├── service/                  # Business logic

│       │   ├── AuthService.java

│       │   ├── ModuleService.java

│       │   ├── RecordService.java

│       │   ├── UserService.java

│       │   ├── PaymentService.java

│       │   ├── ActivityLogService.java

│       │   ├── PlanGuard.java

│       │   ├── SuperAdminService.java

│       │   └── OrgAwareService.java  # Base class for org isolation

│       ├── entity/                   # MySQL JPA entities

│       │   ├── User.java

│       │   ├── Role.java

│       │   ├── Plan.java

│       │   └── EnterpriseEnquiry.java

│       ├── document/                 # MongoDB documents

│       │   ├── ModuleDocument.java

│       │   ├── RecordDocument.java

│       │   └── ActivityLog.java

│       ├── repository/               # Spring Data repositories

│       ├── dto/                      # Data transfer objects

│       ├── security/                 # JWT filter, UserDetails

│       ├── config/                   # Security config, PlanLimits

│       └── exception/                # Global exception handler

│

└── frontend/                         # React application

└── src/

├── pages/                    # Page components

│   ├── Login.jsx

│   ├── PricingPage.jsx

│   ├── RecycleBin.jsx

│   ├── RecentActivity.jsx

│   ├── PaymentSuccess.jsx

│   └── PaymentFailure.jsx

├── components/

│   ├── dashboard/Dashboard.jsx

│   ├── modules/              # Module builder & detail

│   ├── records/              # Record table & dynamic form

│   ├── users/UserManagement.jsx

│   └── layout/              # AppLayout, Sidebar, ProtectedRoute

├── context/

│   ├── AuthContext.jsx       # Auth state + plan helpers

│   └── DataContext.jsx       # Global data state

├── api/                      # Axios API wrappers

└── utils/

├── planLimits.js         # Frontend plan enforcement

└── exportPdf.js          # PDF export utility


---

## ⚙️ Setup & Installation

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- MongoDB 6+
- Maven 3.8+

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/ThakurSadguru/Record-Management-System.git
cd Record-Management-System/backend
```

Configure `src/main/resources/application.properties`:

```properties
# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/rms_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/rms

# JWT
jwt.secret=your_jwt_secret_key_min_32_chars
jwt.expiration=86400000

# Mail (SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password

# PayU (Test)
payu.merchant.key=gtKFFx
payu.merchant.salt=eCwWELxi
payu.payment.url=https://test.payu.in/_payment
```

Create MySQL database:

```sql
CREATE DATABASE rms_db;
```

Run the application:

```bash
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`

---

### Frontend Setup

```bash
cd Record-Management-System/frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔑 Default Credentials



---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and get JWT |
| POST | `/api/auth/register-plan` | Register new org with plan |
| POST | `/api/auth/forgot-password` | Send OTP for password reset |
| POST | `/api/auth/reset-password` | Reset password with OTP |

### Modules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/modules` | Get all modules (org-scoped) |
| GET | `/api/modules/{id}` | Get module by ID |
| POST | `/api/modules` | Create module (Admin only) |
| PUT | `/api/modules/{id}` | Update module (Admin only) |
| DELETE | `/api/modules/{id}` | Soft delete module (Admin only) |

### Records
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/records?moduleId=` | Get records for module |
| GET | `/api/records/search?moduleId=&q=` | Search records |
| POST | `/api/records` | Create record (Admin/Staff) |
| PUT | `/api/records/{id}` | Update record (Admin/Staff) |
| DELETE | `/api/records/{id}` | Soft delete record (Admin only) |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-order` | Create PayU order |
| POST | `/api/payment/verify` | Verify payment and activate plan |

### Super Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/super-admin/stats` | Platform stats |
| GET | `/api/super-admin/organisations` | All organisations |
| PUT | `/api/super-admin/organisations/{orgId}/plan` | Change org plan |
| PUT | `/api/super-admin/organisations/{orgId}/status` | Activate/deactivate org |
| DELETE | `/api/super-admin/organisations/{orgId}` | Delete org |

---

## 💳 Plan Limits

| Feature | Starter (Free) | Professional | Enterprise |
|---------|---------------|--------------|------------|
| Users | 3 | 25 | Unlimited |
| Modules | 5 | Unlimited | Unlimited |
| Records | 1,000 | 100,000 | Unlimited |
| Sub-modules | ❌ | ✅ | ✅ |
| File uploads | ❌ | ✅ | ✅ |
| Activity logs | ❌ | ✅ | ✅ |
| Recycle bin | ❌ | ✅ | ✅ |
| PDF export | ❌ | ✅ | ✅ |
| Price | Free | ₹2,499/mo | Custom |

---

## 🏗️ Architecture

┌─────────────────────────────────────┐

│           React Frontend            │

│           localhost:5173            │

└──────────────┬──────────────────────┘

│ HTTP / Axios

▼

┌─────────────────────────────────────┐

│         Spring Boot Backend         │

│           localhost:8080            │

│                                     │

│  JwtFilter → SecurityContext        │

│  OrgAwareService → orgId isolation  │

│  PlanGuard → plan limit checks      │

└──────────┬──────────────┬───────────┘

│              │

▼              ▼

┌──────────┐   ┌────────────┐

│  MySQL   │   │  MongoDB   │

│  Users   │   │  Modules   │

│  Auth    │   │  Records   │

│  Plans   │   │  Activity  │

└──────────┘   └────────────┘


### Multi-tenancy Model
Every request carries a JWT token. The `JwtFilter` extracts the `orgId` from the token and stores it in the `SecurityContext`. All service methods extend `OrgAwareService` which reads `orgId` automatically — ensuring every database query is scoped to the caller's organisation.

---

## 🧪 PayU Test Credentials

Card Number:  4111 1111 1111 1111

Expiry:       Any future date (e.g. 12/26)

CVV:          123

OTP:          123456
UPI (success): success@payu

UPI (failure): failure@payu



---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👤 Author

**Sadguru Thakur**
- Portfolio: [sadguruthakurportfolio.netlify.app](https://sadguruthakurportfolio.netlify.app)
- GitHub: [@ThakurSadguru](https://github.com/ThakurSadguru)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)

---

## 📄 License

This project is licensed under the MIT License.
