import { PrismaClient, Role, RegistrationStatus, TransportationType, PaymentStatus, PaymentMode } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding (DEVELOPMENT CREDENTIALS ONLY)...');

  // Clear existing records in correct relation order
  await prisma.transportationVerification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.transportRegistration.deleteMany();
  await prisma.pickupPoint.deleteMany();
  await prisma.route.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Default Admin
  // DEV CREDENTIALS: admin@college.local / Admin@1234
  const adminPasswordHash = await bcrypt.hash('Admin@1234', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@college.local',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`✓ Admin User created: ${adminUser.email}`);

  // 2. Create Routes & Pickup Points
  const route1 = await prisma.route.create({
    data: {
      name: 'Route 1 — Shivajinagar to College Campus',
      routeCode: 'R-01-SN',
      description: 'Via JM Road, FC Road, Law College Road',
      busNumber: 'MH-12-TR-1001',
      driverName: 'Mr. Suresh Shinde',
      driverContact: '+91 98220 11223',
      pickupPoints: {
        create: [
          { name: 'Shivajinagar Bus Stand', sequence: 1, landmark: 'Opposite District Court', estimatedTime: '07:15 AM' },
          { name: 'JM Road (Bal Gandharva)', sequence: 2, landmark: 'Near Garware Bridge', estimatedTime: '07:25 AM' },
          { name: 'FC Road (Fergusson Gate)', sequence: 3, landmark: 'Near Goodluck Chowk', estimatedTime: '07:35 AM' },
          { name: 'Deccan Gymkhana', sequence: 4, landmark: 'Near Sambhaji Park Gate', estimatedTime: '07:45 AM' },
          { name: 'Law College Road', sequence: 5, landmark: 'FTII Circle', estimatedTime: '07:55 AM' },
        ],
      },
    },
    include: { pickupPoints: true },
  });

  const route2 = await prisma.route.create({
    data: {
      name: 'Route 2 — Hadapsar & Kharadi to College Campus',
      routeCode: 'R-02-HD',
      description: 'Via Magarpatta City, Kharadi Bypass, Camp',
      busNumber: 'MH-12-TR-1002',
      driverName: 'Mr. Ramesh Kadam',
      driverContact: '+91 98220 33445',
      pickupPoints: {
        create: [
          { name: 'Hadapsar Bus Depot', sequence: 1, landmark: 'Near Gadital Chowk', estimatedTime: '07:00 AM' },
          { name: 'Magarpatta City Main Gate', sequence: 2, landmark: 'Mega Center Arcade', estimatedTime: '07:15 AM' },
          { name: 'Kharadi Bypass Chowk', sequence: 3, landmark: 'Near Radisson Blu', estimatedTime: '07:30 AM' },
          { name: 'Pune Station / Camp', sequence: 4, landmark: 'Near SGS Mall', estimatedTime: '07:45 AM' },
        ],
      },
    },
    include: { pickupPoints: true },
  });

  const route3 = await prisma.route.create({
    data: {
      name: 'Route 3 — Hinjewadi & Wakad to College Campus',
      routeCode: 'R-03-HW',
      description: 'Via Wakad Bridge, Baner Road, Aundh',
      busNumber: 'MH-12-TR-1003',
      driverName: 'Mr. Deepak Pawar',
      driverContact: '+91 98220 55667',
      pickupPoints: {
        create: [
          { name: 'Hinjewadi Phase 1', sequence: 1, landmark: 'Rajiv Gandhi Infotech Park Gate', estimatedTime: '07:00 AM' },
          { name: 'Wakad Chowk', sequence: 2, landmark: 'Near D-Mart Junction', estimatedTime: '07:15 AM' },
          { name: 'Baner High Street', sequence: 3, landmark: 'Near Orchid School Chowk', estimatedTime: '07:30 AM' },
          { name: 'Aundh Parihar Chowk', sequence: 4, landmark: 'Near Bremen Chowk', estimatedTime: '07:42 AM' },
        ],
      },
    },
    include: { pickupPoints: true },
  });

  const route4 = await prisma.route.create({
    data: {
      name: 'Route 4 — PCMC & Nigdi to College Campus',
      routeCode: 'R-04-PC',
      description: 'Via Old Mumbai-Pune Highway, Akurdi, Chinchwad',
      busNumber: 'MH-12-TR-1004',
      driverName: 'Mr. Anil Gaikwad',
      driverContact: '+91 98220 77889',
      pickupPoints: {
        create: [
          { name: 'Nigdi Pradhikaran', sequence: 1, landmark: 'Near Bhakti Shakti Garden', estimatedTime: '06:50 AM' },
          { name: 'Akurdi Railway Station', sequence: 2, landmark: 'East Plaza', estimatedTime: '07:05 AM' },
          { name: 'Chinchwad Station Chowk', sequence: 3, landmark: 'Near Thermax Chowk', estimatedTime: '07:20 AM' },
        ],
      },
    },
    include: { pickupPoints: true },
  });

  const route5 = await prisma.route.create({
    data: {
      name: 'Route 5 — Kothrud & Karve Nagar to College Campus',
      routeCode: 'R-05-KT',
      description: 'Via Karve Road, Cummins College, Warje',
      busNumber: 'MH-12-TR-1005',
      driverName: 'Mr. Nitin Jadhav',
      driverContact: '+91 98220 99001',
      pickupPoints: {
        create: [
          { name: 'Kothrud Stand (Dahanukar Colony)', sequence: 1, landmark: 'Near Gandhi Bhavan', estimatedTime: '07:15 AM' },
          { name: 'Karve Nagar Chowk', sequence: 2, landmark: 'Near Cummins Engineering Gate', estimatedTime: '07:28 AM' },
          { name: 'Warje Malwadi', sequence: 3, landmark: 'Near Warje Flyover', estimatedTime: '07:40 AM' },
        ],
      },
    },
    include: { pickupPoints: true },
  });

  console.log('✓ 5 Routes & Pickup Points created');

  // 3. Create Test Students
  const studentPasswordHash = await bcrypt.hash('Student@1234', 10);

  // Student 1 (Harshal Patil — APPROVED PASS)
  const studentUser1 = await prisma.user.create({
    data: {
      email: 'student1@college.local',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
    },
  });

  const student1 = await prisma.student.create({
    data: {
      userId: studentUser1.id,
      studentId: 'PRN2024001',
      fullName: 'Harshal Patil',
      email: 'student1@college.local',
      mobile: '9876543210',
      className: 'TE (Third Year)',
      branch: 'Computer Engineering',
      academicYear: '2024-2025',
    },
  });

  // Registration for Student 1 (APPROVED)
  await prisma.transportRegistration.create({
    data: {
      studentId: student1.id,
      transportationId: 'TR26-8F4K92',
      routeId: route5.id,
      pickupPointId: route5.pickupPoints[1].id, // Karve Nagar Chowk
      transportationType: TransportationType.BUS,
      vehicleNumber: 'MH-12-TR-1005',
      status: RegistrationStatus.APPROVED,
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    },
  });

  // Payment for Student 1 (PAID)
  await prisma.payment.create({
    data: {
      studentId: student1.id,
      totalAmount: 18000.0,
      paidAmount: 18000.0,
      pendingAmount: 0.0,
      status: PaymentStatus.PAID,
      paymentMode: PaymentMode.UPI,
      transactionRef: 'UTR882910394821',
      lastPaymentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
  });

  // Student 2 (Rahul Deshmukh — PENDING REGISTRATION)
  const studentUser2 = await prisma.user.create({
    data: {
      email: 'student2@college.local',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      userId: studentUser2.id,
      studentId: 'PRN2024002',
      fullName: 'Rahul Deshmukh',
      email: 'student2@college.local',
      mobile: '9822011224',
      className: 'BE (Final Year)',
      branch: 'Mechanical Engineering',
      academicYear: '2024-2025',
    },
  });

  // Registration for Student 2 (PENDING)
  await prisma.transportRegistration.create({
    data: {
      studentId: student2.id,
      transportationId: 'TR26-3M9X11',
      routeId: route1.id,
      pickupPointId: route1.pickupPoints[2].id, // FC Road
      transportationType: TransportationType.BUS,
      vehicleNumber: 'MH-12-TR-1001',
      status: RegistrationStatus.PENDING,
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
  });

  // Payment for Student 2 (PARTIALLY_PAID)
  await prisma.payment.create({
    data: {
      studentId: student2.id,
      totalAmount: 18000.0,
      paidAmount: 9000.0,
      pendingAmount: 9000.0,
      status: PaymentStatus.PARTIALLY_PAID,
      paymentMode: PaymentMode.NET_BANKING,
      transactionRef: 'NEFT24991029381',
      lastPaymentDate: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
  });

  // Student 3 (Priya Sharma — CHANGES REQUIRED)
  const studentUser3 = await prisma.user.create({
    data: {
      email: 'student3@college.local',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
    },
  });

  const student3 = await prisma.student.create({
    data: {
      userId: studentUser3.id,
      studentId: 'PRN2024003',
      fullName: 'Priya Sharma',
      email: 'student3@college.local',
      mobile: '9822033446',
      className: 'SE (Second Year)',
      branch: 'Information Technology',
      academicYear: '2024-2025',
    },
  });

  // Registration for Student 3 (CHANGES_REQUIRED)
  await prisma.transportRegistration.create({
    data: {
      studentId: student3.id,
      transportationId: 'TR26-7P2W44',
      routeId: route3.id,
      pickupPointId: route3.pickupPoints[0].id, // Hinjewadi Phase 1
      transportationType: TransportationType.VAN,
      vehicleNumber: 'MH-12-TR-1003',
      status: RegistrationStatus.CHANGES_REQUIRED,
      adminNote: 'Van capacity full for Phase 1. Please select Wakad or regular bus route.',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
  });

  // Payment for Student 3 (PENDING)
  await prisma.payment.create({
    data: {
      studentId: student3.id,
      totalAmount: 18000.0,
      paidAmount: 0.0,
      pendingAmount: 18000.0,
      status: PaymentStatus.PENDING,
      paymentMode: PaymentMode.CHALLAN,
      transactionRef: 'CHALLAN-9021',
      lastPaymentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
  });

  // 4. Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: adminUser.id,
        action: 'ADMIN_APPROVED_REGISTRATION',
        entityType: 'TransportRegistration',
        entityId: 'TR26-8F4K92',
        newValue: 'Approved seat on Route 5',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      },
      {
        actorId: adminUser.id,
        action: 'ADMIN_REQUESTED_CHANGES',
        entityType: 'TransportRegistration',
        entityId: 'TR26-7P2W44',
        newValue: 'Van capacity full for Phase 1. Please select Wakad or regular bus route.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      },
    ],
  });

  console.log('✓ 3 Test Students, Registrations, Payments & Audit Logs created');
  console.log('\n======================================================');
  console.log('DEVELOPMENT ACCOUNTS:');
  console.log('Admin:   admin@college.local    / Admin@1234');
  console.log('Student 1: student1@college.local / Student@1234 (Active Pass TR26-8F4K92)');
  console.log('Student 2: student2@college.local / Student@1234 (Pending Verification)');
  console.log('Student 3: student3@college.local / Student@1234 (Changes Required)');
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
