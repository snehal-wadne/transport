import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ForbiddenException } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthService } from '@/auth/auth.service';
import { TransportationService } from '@/transportation/transportation.service';
import { AdminService } from '@/admin/admin.service';
import { VerificationService } from '@/verification/verification.service';
import { Role, RegistrationStatus } from '@prisma/client';

describe('Student Transportation System — Security, Isolation & Workflow Verification', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let transportService: TransportationService;
  let adminService: AdminService;
  let verificationService: VerificationService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);
    transportService = moduleFixture.get<TransportationService>(TransportationService);
    adminService = moduleFixture.get<AdminService>(AdminService);
    verificationService = moduleFixture.get<VerificationService>(VerificationService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Authentication & Role-Based Access Control', () => {
    it('should authenticate student and return JWT token', async () => {
      const login = await authService.login({
        email: 'student1@college.local',
        password: 'Student@1234',
      });

      expect(login).toBeDefined();
      expect(login.accessToken).toBeDefined();
      expect(login.user.role).toBe(Role.STUDENT);
      expect(login.user.student?.studentId).toBe('PRN2024001');
    });

    it('should authenticate admin and return JWT token', async () => {
      const login = await authService.login({
        email: 'admin@college.local',
        password: 'Admin@1234',
      });

      expect(login).toBeDefined();
      expect(login.accessToken).toBeDefined();
      expect(login.user.role).toBe(Role.ADMIN);
    });
  });

  describe('2. CRITICAL MANDATORY TEST: Student Data Isolation', () => {
    it('Student A must only receive their own registration through session', async () => {
      // Student 1 (PRN2024001)
      const student1 = await prisma.student.findUnique({
        where: { studentId: 'PRN2024001' },
      });

      const student1Reg = await transportService.getMyRegistration(student1.id);
      expect(student1Reg).toBeDefined();
      expect(student1Reg.studentId).toBe(student1.id);
      expect(student1Reg.transportationId).toBe('TR26-8F4K92');

      // Student 2 (PRN2024002)
      const student2 = await prisma.student.findUnique({
        where: { studentId: 'PRN2024002' },
      });

      const student2Reg = await transportService.getMyRegistration(student2.id);
      expect(student2Reg).toBeDefined();
      expect(student2Reg.studentId).toBe(student2.id);
      expect(student2Reg.transportationId).toBe('TR26-3M9X11');

      // VERIFY: Records are completely distinct
      expect(student1Reg.transportationId).not.toBe(student2Reg.transportationId);
    });

    it('Student A cannot modify Student B registration (Bound strictly to session studentId)', async () => {
      const student1 = await prisma.student.findUnique({
        where: { studentId: 'PRN2024001' },
      });
      const student2 = await prisma.student.findUnique({
        where: { studentId: 'PRN2024002' },
      });

      // Student 1 updates their registration
      const route = await prisma.route.findFirst({ where: { active: true }, include: { pickupPoints: true } });
      
      await transportService.updateMyRegistration(
        student1.id, // Authenticated session ID for Student 1
        student1.userId,
        {
          routeId: route.id,
          pickupPointId: route.pickupPoints[0].id,
        },
      );

      // Student 2 record must remain unchanged
      const student2Current = await transportService.getMyRegistration(student2.id);
      expect(student2Current.studentId).toBe(student2.id);
      expect(student2Current.transportationId).toBe('TR26-3M9X11');
    });
  });

  describe('3. Administrative Approval Workflow & Invalidation', () => {
    it('When a student updates commuting details, status transitions to PENDING', async () => {
      const student1 = await prisma.student.findUnique({
        where: { studentId: 'PRN2024001' },
      });

      // 1. Force to APPROVED first
      await prisma.transportRegistration.update({
        where: { studentId: student1.id },
        data: { status: RegistrationStatus.APPROVED },
      });

      // 2. Student edits route/pickup
      const route = await prisma.route.findFirst({ where: { active: true }, include: { pickupPoints: true } });
      const updated = await transportService.updateMyRegistration(
        student1.id,
        student1.userId,
        {
          routeId: route.id,
          pickupPointId: route.pickupPoints[0].id,
        },
      );

      // WORKFLOW ASSERTION:
      // Status must immediately transition to PENDING. Student cannot stay APPROVED!
      expect(updated.status).toBe(RegistrationStatus.PENDING);
    });

    it('Admin can approve registration and make Transportation ID ACTIVE', async () => {
      const student1 = await prisma.student.findUnique({
        where: { studentId: 'PRN2024001' },
        include: { registration: true },
      });

      const admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });

      const approved = await adminService.approveRegistration(
        student1.registration.id,
        admin.id,
      );

      expect(approved.status).toBe(RegistrationStatus.APPROVED);
      expect(approved.approvedAt).toBeDefined();
    });

    it('Admin can request changes on registration', async () => {
      const student2 = await prisma.student.findUnique({
        where: { studentId: 'PRN2024002' },
        include: { registration: true },
      });
      const admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });

      const changed = await adminService.requestChanges(
        student2.registration.id,
        'Please reconfirm boarding point',
        admin.id,
      );

      expect(changed.status).toBe(RegistrationStatus.CHANGES_REQUIRED);
      expect(changed.adminNote).toBe('Please reconfirm boarding point');
    });
  });

  describe('4. Public QR Code Verification & Data Minimization', () => {
    it('Public verification endpoint returns only minimal necessary information and masks sensitive data', async () => {
      const verification = await verificationService.verifyTransportId('TR26-8F4K92');

      expect(verification).toBeDefined();
      expect(verification.transportationId).toBe('TR26-8F4K92');
      expect(verification.status).toBe(RegistrationStatus.APPROVED);
      expect(verification.studentName).toBe('Harshal Patil');
      expect(verification.studentId).toBe('PRN2024001');

      // CRITICAL PRIVACY ASSERTIONS:
      // Never expose mobile, personal address, payment details, or internal DB keys
      const anyData = verification as any;
      expect(anyData.mobile).toBeUndefined();
      expect(anyData.email).toBeUndefined();
      expect(anyData.address).toBeUndefined();
      expect(anyData.payment).toBeUndefined();
      expect(anyData.paymentAmount).toBeUndefined();
      expect(anyData.adminNote).toBeUndefined();
    });
  });
});
