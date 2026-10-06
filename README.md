# Student Transportation Management System

> **Production-Ready, Enterprise Full-Stack Application**
> Featuring strict student data isolation, role-based authorization (RBAC), digitized transport pass generation with QR code verification, fleet routing, and fee administration.

---

## 1. System Architecture & Repository Layout

The system is strictly divided into two decoupled tiers:

```
transport/
├── frontend/                     # Next.js 16 App Router (React 19, Tailwind CSS v4, shadcn/ui)
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/            # Role-based SSO authentication with 1-click test switcher
│   │   │   ├── student/          # Student Portal routes (Registration, Pass, Edit)
│   │   │   ├── admin/            # Admin Portal (Dashboard, Queue, Students, Routes, Fees, Logs)
│   │   │   ├── verify/[id]/      # Public QR Code pass verification
│   │   │   └── api/              # Secure Next.js route handlers
│   │   ├── components/           # Reusable UI primitives and domain widgets
│   │   └── lib/                  # AuthContext, API client, Zod schemas, data types
│   ├── Dockerfile                # Multi-stage production container build
│   └── package.json
│
├── backend/                      # NestJS 11 + TypeScript + PostgreSQL + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma         # Data models with relational integrity & indexes
│   │   ├── migrations/           # PostgreSQL DDL migration scripts
│   │   └── seed.ts               # Institutional seed script (Admin + 3 Students + 5 Routes)
│   ├── src/
│   │   ├── auth/                 # JWT strategy, Passport, CurrentUser, RolesGuard
│   │   ├── transportation/       # Session-bound transport controller & pass ID generator
│   │   ├── students/             # Data-isolated student profile services
│   │   ├── admin/                # Verification queue, workflow actions, metrics
│   │   ├── routes/               # Transit routes and pickup points manager
│   │   ├── payments/             # Fee reconciliations and installments
│   │   ├── verification/         # Privacy-preserving minimal QR pass verification
│   │   └── audit/                # Immutable append-only audit trail
│   ├── Dockerfile                # Multi-stage production container build
│   └── package.json
│
├── docker-compose.yml            # PostgreSQL 16 + NestJS Backend + Next.js Frontend
├── package.json                  # Root monorepo workspace orchestration scripts
└── README.md                     # Comprehensive documentation
```

---

## 2. Portals & Capabilities

### 🎓 1. Student Portal
1. **Transportation Registration (`/student/registration` or `/`)**
   - Displays authenticated student identity (read-only): Name, PRN, Email, Mobile, Class, Branch.
   - Dynamic route selection with landmark-based pickup points and estimated timings.
   - Transit type selection (College Bus, Van, Shuttle).
   - Optional fee payment claim declaration with reference verification tracking.
   - Submission triggers server-side validation and sets status to `PENDING`.
2. **My Transportation ID (`/student/id-card` or `/my-transportation`)**
   - High-fidelity digital transit card with institution branding, official hologram, student details, route, bus number, and boarding stop.
   - Live QR Code embedding secure verification link (`/verify/[transportationId]`).
   - Workflow banners for `PENDING`, `APPROVED`, `CHANGES_REQUIRED`, `REJECTED`, and `EXPIRED`.
   - Print and download pass triggers.
3. **Edit Transportation Details (`/student/edit`)**
   - Student identity fields remain strictly tamper-proof.
   - Allows changing commuter route and pickup point.
   - Change confirmation modal summarizing changes.
   - **Crucial Workflow Rule:** Modifying commuting details invalidates previous pass approval and automatically transitions status back to `PENDING ADMIN VERIFICATION`.
4. **Public QR Code Pass Verification (`/verify/[id]`)**
   - Scanned by bus conductors or campus security.
   - **Data Minimization:** Exposes strictly minimal fields (Masked Student Name, Pass ID, Validity Status, Route, Pickup Point, Academic Year). Personal phone number, email, address, payment details, and admin notes are NEVER leaked.

### 🛡️ 2. Admin Portal (`/admin/*`)
1. **Administrative Operations Dashboard (`/admin/dashboard`)**
   - Real-time KPI metrics: Total Students, Pending Review Queue, Approved Active Passes, Changes Requested, Fee Collection Progress, Active Bus Fleet.
   - Pending queue preview table with 1-click Approve and Review actions.
   - Fleet route allocation summary and recent audit events.
2. **Applications & Verification Queue (`/admin/registrations`)**
   - Status filters: `ALL`, `PENDING`, `APPROVED`, `CHANGES_REQUIRED`, `REJECTED`.
   - Live search by student name, PRN, or route.
   - Full review modal with academic details, transit route selection, and fee claim.
   - Actions:
     - **Approve**: Issues pass and activates digital transport ID card.
     - **Request Changes**: Attaches remarks to prompt student correction.
     - **Reject**: Records formal reason for decline.
3. **Student Directory (`/admin/students`)**
   - Comprehensive directory with branch filter and search.
   - Profile drawer with emergency contact, blood group, and pass history.
   - Pass deactivation and revocation trigger.
4. **Bus Fleet & Route Manager (`/admin/routes`)**
   - View college transit fleet, assigned drivers, and contact numbers.
   - "Add New Route" dialog with route code and bus assignment.
   - Pickup stop manager for adding stops with landmarks and morning arrival times.
5. **Transportation Fee Audit (`/admin/payments`)**
   - Financial summaries: Total Expected (₹18,000/student), Total Collected, Balance Due.
   - Payment update dialog with auto-recalculation of balance and status (`PAID`, `PARTIALLY_PAID`, `PENDING`).
6. **Security & Compliance Audit Trail (`/admin/audit-logs`)**
   - Immutable log capturing actor email, action type, target ID, changes, and IP address.

---

## 3. Strict Security & Data Isolation Enforcement

| Security Principle | Implementation Mechanism |
| :--- | :--- |
| **No Untrusted Frontend IDs** | The backend NEVER trusts a `studentId` sent in request bodies or URL parameters for student actions. Identity is derived strictly from the server-verified JWT session token (`@CurrentUser('studentId')`). |
| **Cross-Student Access Prevention** | Student A querying Student B's ID directly (`GET /students/:id`) immediately throws `403 Forbidden`. Normal students can only access `/students/me` and `/transport/me`. |
| **Role-Based Access Control (RBAC)** | Administrative endpoints (`/admin/*`) are protected by `JwtAuthGuard` and `RolesGuard` requiring `Role.ADMIN`. Access by non-admins returns `403 Forbidden`. |
| **Approval Tamper Resistance** | Students cannot self-approve passes or alter payment verification status. Edits to existing passes automatically invalidate approvals and reset status to `PENDING`. |
| **Data Minimization on QR Verification** | The public `/verify/:transportationId` endpoint strictly limits output to validity status, route, and stop name. Personal contact details, payments, and admin notes are stripped. |

---

## 4. Test Credentials & Demo Access

The portal includes an institutional single sign-on page (`/login`) with **1-click quick demo selectors**:

| Role | Email | Password | PRN / Profile | Initial State |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@college.local` | `Admin@1234` | Central Transport Office | Full Admin Access |
| **Student 1** | `student1@college.local` | `Student@1234` | Harshal Patil (`PRN2024001`) | **APPROVED** (Pass Active) |
| **Student 2** | `student2@college.local` | `Student@1234` | Aarav Sharma (`PRN2024002`) | **PENDING** (In Review Queue) |
| **Student 3** | `student3@college.local` | `Student@1234` | Pooja Deshmukh (`PRN2024003`) | **CHANGES_REQUIRED** |

---

## 5. Getting Started

### Option A: Local Development

#### 1. Prerequisites
- Node.js 20+
- PostgreSQL 15+ (or use Docker for database only)

#### 2. Backend Setup
```bash
cd transport/backend

# 1. Install dependencies
npm install

# 2. Configure .env (pre-configured for localhost)
cp .env.example .env

# 3. Generate Prisma client & run database migrations
npx prisma generate
npx prisma migrate dev --name init

# 4. Seed default admin, students, Pune bus routes, and passes
npm run prisma:seed

# 5. Start NestJS backend (runs on http://localhost:4000)
npm run start:dev
```
- Swagger API Docs: `http://localhost:4000/api/docs`

#### 3. Frontend Setup
```bash
cd transport/frontend

# 1. Install dependencies
npm install

# 2. Start Next.js development server (runs on http://localhost:3000)
npm run dev
```
- Visit `http://localhost:3000` for the Student Portal.
- Visit `http://localhost:3000/login` to sign in or switch roles.
- Visit `http://localhost:3000/admin/dashboard` for the Admin Portal.

---

### Option B: Docker Compose (Full Stack)

To run the entire system including PostgreSQL, NestJS Backend, and Next.js Frontend with one command:

```bash
cd transport
docker compose up -d --build
```

Services will be accessible at:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:4000`
- **Swagger Documentation:** `http://localhost:4000/api/docs`
- **PostgreSQL:** `localhost:5432`

---

## 6. Running Automated Tests

Run the backend unit and integration test suite:

```bash
cd transport/backend
npm run test
```

### Verified Test Suites:
- `verification.service.spec.ts`: Asserts data minimization and ensures sensitive data (mobile, email, payments) is excluded from QR verification.
- `transport-id-generator.service.spec.ts`: Asserts collision-resistant generation conforming to the `TR{YY}-{6 CHARS}` specification.
- `students.controller.spec.ts`: Asserts that Student A cannot query Student B by ID (throws `403 Forbidden`) and validates session-derived queries.
- `transportation.controller.spec.ts`: Asserts that new registrations start as `PENDING` and editing routes resets status to `PENDING`.
- `admin.controller.spec.ts`: Asserts admin approval, change requests, rejections, and dashboard KPI metrics.

---

## 7. License & Compliance
This software is developed for City Engineering College Transportation Directorate under institutional least-privilege access security standards.
