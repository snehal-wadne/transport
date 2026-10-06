// =============================================================================
// Mock Data & In-Memory Store — routes, students, registrations, payments, audit logs.
// In production, backed by NestJS API + PostgreSQL / Prisma.
// =============================================================================

import type {
  TransportRoute,
  TransportRegistrationRecord,
  TransportRegistration,
  StudentProfile,
  RegistrationStatus,
  PublicVerificationResponse,
  AdminDashboardMetrics,
  AdminRegistrationItem,
  AdminStudentItem,
  AdminPaymentRecord,
  AdminAuditLogItem,
  PaymentMode,
} from "./types";

/** Pre-configured transport routes (Admin-managed) */
export let MOCK_ROUTES: TransportRoute[] = [
  {
    id: "route-1",
    name: "Route 1 — Shivajinagar to College Campus",
    routeCode: "R-01-SN",
    description: "Via JM Road, FC Road, Law College Road",
    busNumber: "MH-12-TR-1001",
    driverName: "Mr. Suresh Shinde",
    driverContact: "+91 98220 11223",
    pickupPoints: [
      { id: "pp-1-1", name: "Shivajinagar Bus Stand", landmark: "Opposite District Court", estimatedTime: "07:15 AM" },
      { id: "pp-1-2", name: "JM Road (Bal Gandharva)", landmark: "Near Garware Bridge", estimatedTime: "07:25 AM" },
      { id: "pp-1-3", name: "FC Road (Fergusson Gate)", landmark: "Near Goodluck Chowk", estimatedTime: "07:35 AM" },
      { id: "pp-1-4", name: "Deccan Gymkhana", landmark: "Near Sambhaji Park Gate", estimatedTime: "07:45 AM" },
      { id: "pp-1-5", name: "Law College Road", landmark: "FTII Circle", estimatedTime: "07:55 AM" },
    ],
  },
  {
    id: "route-2",
    name: "Route 2 — Hadapsar & Kharadi to College Campus",
    routeCode: "R-02-HD",
    description: "Via Magarpatta City, Kharadi Bypass, Camp",
    busNumber: "MH-12-TR-1002",
    driverName: "Mr. Ramesh Kadam",
    driverContact: "+91 98220 33445",
    pickupPoints: [
      { id: "pp-2-1", name: "Hadapsar Bus Depot", landmark: "Near Gadital Chowk", estimatedTime: "07:00 AM" },
      { id: "pp-2-2", name: "Magarpatta City Main Gate", landmark: "Mega Center Arcade", estimatedTime: "07:15 AM" },
      { id: "pp-2-3", name: "Kharadi Bypass Chowk", landmark: "Near Radisson Blu", estimatedTime: "07:30 AM" },
      { id: "pp-2-4", name: "Pune Station / Camp", landmark: "Near SGS Mall", estimatedTime: "07:45 AM" },
    ],
  },
  {
    id: "route-3",
    name: "Route 3 — Hinjewadi & Wakad to College Campus",
    routeCode: "R-03-HW",
    description: "Via Wakad Bridge, Baner Road, Aundh",
    busNumber: "MH-12-TR-1003",
    driverName: "Mr. Deepak Pawar",
    driverContact: "+91 98220 55667",
    pickupPoints: [
      { id: "pp-3-1", name: "Hinjewadi Phase 1", landmark: "Rajiv Gandhi Infotech Park Gate", estimatedTime: "07:00 AM" },
      { id: "pp-3-2", name: "Wakad Chowk", landmark: "Near D-Mart Junction", estimatedTime: "07:15 AM" },
      { id: "pp-3-3", name: "Baner High Street", landmark: "Near Orchid School Chowk", estimatedTime: "07:30 AM" },
      { id: "pp-3-4", name: "Aundh Parihar Chowk", landmark: "Near Bremen Chowk", estimatedTime: "07:42 AM" },
    ],
  },
  {
    id: "route-4",
    name: "Route 4 — PCMC & Nigdi to College Campus",
    routeCode: "R-04-PC",
    description: "Via Old Mumbai-Pune Highway, Akurdi, Chinchwad",
    busNumber: "MH-12-TR-1004",
    driverName: "Mr. Anil Gaikwad",
    driverContact: "+91 98220 77889",
    pickupPoints: [
      { id: "pp-4-1", name: "Nigdi Pradhikaran", landmark: "Near Bhakti Shakti Garden", estimatedTime: "06:50 AM" },
      { id: "pp-4-2", name: "Akurdi Railway Station", landmark: "East Plaza", estimatedTime: "07:05 AM" },
      { id: "pp-4-3", name: "Chinchwad Station Chowk", landmark: "Near Thermax Chowk", estimatedTime: "07:20 AM" },
      { id: "pp-4-4", name: "Pimpri Finolex Chowk", landmark: "Near PCMC Corporation Office", estimatedTime: "07:35 AM" },
    ],
  },
  {
    id: "route-5",
    name: "Route 5 — Kothrud & Karve Nagar to College Campus",
    routeCode: "R-05-KT",
    description: "Via Karve Road, Cummins College, Warje",
    busNumber: "MH-12-TR-1005",
    driverName: "Mr. Nitin Jadhav",
    driverContact: "+91 98220 99001",
    pickupPoints: [
      { id: "pp-5-1", name: "Kothrud Stand (Dahanukar Colony)", landmark: "Near Gandhi Bhavan", estimatedTime: "07:15 AM" },
      { id: "pp-5-2", name: "Karve Nagar Chowk", landmark: "Near Cummins Engineering Gate", estimatedTime: "07:28 AM" },
      { id: "pp-5-3", name: "Warje Malwadi", landmark: "Near Warje Flyover", estimatedTime: "07:40 AM" },
    ],
  },
];

/** Mock Registered Students Directory */
export const MOCK_STUDENTS: AdminStudentItem[] = [
  {
    id: "stu-001",
    fullName: "Harshal Patil",
    prn: "PRN2024001",
    email: "student1@college.local",
    mobile: "9876543210",
    academicYear: "2024-2025",
    className: "TE (Third Year)",
    branch: "Computer Engineering",
    emergencyContact: "+91 98220 99881 (Parent)",
    bloodGroup: "O+",
    transportationId: "TR26-8F4K92",
    transportStatus: "APPROVED",
    routeName: "Route 5 — Kothrud & Karve Nagar",
  },
  {
    id: "stu-002",
    fullName: "Aarav Sharma",
    prn: "PRN2024002",
    email: "student2@college.local",
    mobile: "9822114455",
    academicYear: "2024-2025",
    className: "BE (Final Year)",
    branch: "Mechanical Engineering",
    emergencyContact: "+91 98220 88772",
    bloodGroup: "B+",
    transportationId: "TR26-4B9M11",
    transportStatus: "PENDING",
    routeName: "Route 1 — Shivajinagar",
  },
  {
    id: "stu-003",
    fullName: "Pooja Deshmukh",
    prn: "PRN2024003",
    email: "student3@college.local",
    mobile: "9833445566",
    academicYear: "2024-2025",
    className: "SE (Second Year)",
    branch: "Information Technology",
    emergencyContact: "+91 98220 77663",
    bloodGroup: "A+",
    transportationId: "TR26-7V2L88",
    transportStatus: "CHANGES_REQUIRED",
    routeName: "Route 2 — Hadapsar & Kharadi",
  },
  {
    id: "stu-004",
    fullName: "Neha Kulkarni",
    prn: "PRN2024004",
    email: "neha.kulkarni@college.edu",
    mobile: "9844556677",
    academicYear: "2024-2025",
    className: "TE (Third Year)",
    branch: "Civil Engineering",
    emergencyContact: "+91 98220 66554",
    bloodGroup: "AB+",
    transportationId: "TR26-1X5Z33",
    transportStatus: "REJECTED",
    routeName: "Route 3 — Hinjewadi & Wakad",
  },
  {
    id: "stu-005",
    fullName: "Rohan Mehta",
    prn: "PRN2024005",
    email: "rohan.mehta@college.edu",
    mobile: "9855667788",
    academicYear: "2024-2025",
    className: "FE (First Year)",
    branch: "Electronics & Telecomm",
    emergencyContact: "+91 98220 55443",
    bloodGroup: "O-",
    transportationId: undefined,
    transportStatus: "NOT_REGISTERED",
    routeName: undefined,
  },
];

/** In-memory store for registrations */
const registrationStore = new Map<string, TransportRegistrationRecord>();

// Pre-seed registrations
registrationStore.set("PRN2024001", {
  id: "TR26-8F4K92",
  routeId: "route-5",
  pickupPointId: "pp-5-2",
  transportationType: "bus",
  vehicleNumber: "MH-12-TR-1005",
  status: "APPROVED",
  submittedAt: "2024-07-15T09:30:00.000Z",
  approvedAt: "2024-07-16T14:15:00.000Z",
  expiresAt: "2025-06-30T23:59:59.000Z",
  studentName: "Harshal Patil",
  studentPrn: "PRN2024001",
  studentEmail: "student1@college.local",
  studentBranch: "Computer Engineering",
  studentClass: "TE (Third Year)",
  academicYear: "2024-2025",
  paymentClaim: {
    transactionRef: "UTR882910394821",
    paymentMode: "UPI",
    paymentDate: "2024-07-15",
    claimedAmount: "18000",
    officialStatus: "VERIFIED",
  },
  studentVisibleReason: undefined,
  verificationCode: "CEC-TR-2024-SECURE-TOKEN-PRN001",
});

registrationStore.set("PRN2024002", {
  id: "TR26-4B9M11",
  routeId: "route-1",
  pickupPointId: "pp-1-3",
  transportationType: "bus",
  vehicleNumber: "MH-12-TR-1001",
  status: "PENDING",
  submittedAt: "2024-07-18T11:00:00.000Z",
  studentName: "Aarav Sharma",
  studentPrn: "PRN2024002",
  studentEmail: "student2@college.local",
  studentBranch: "Mechanical Engineering",
  studentClass: "BE (Final Year)",
  academicYear: "2024-2025",
  paymentClaim: {
    transactionRef: "UPI9922883311",
    paymentMode: "UPI",
    paymentDate: "2024-07-18",
    claimedAmount: "9000",
    officialStatus: "PENDING_VERIFICATION",
  },
  studentVisibleReason: undefined,
  verificationCode: "CEC-TR-2024-SECURE-TOKEN-PRN002",
});

registrationStore.set("PRN2024003", {
  id: "TR26-7V2L88",
  routeId: "route-2",
  pickupPointId: "pp-2-1",
  transportationType: "bus",
  vehicleNumber: "MH-12-TR-1002",
  status: "CHANGES_REQUIRED",
  submittedAt: "2024-07-20T10:15:00.000Z",
  studentName: "Pooja Deshmukh",
  studentPrn: "PRN2024003",
  studentEmail: "student3@college.local",
  studentBranch: "Information Technology",
  studentClass: "SE (Second Year)",
  academicYear: "2024-2025",
  studentVisibleReason: "Pickup point capacity at Hadapsar Bus Depot is currently full. Please re-select Magarpatta City Main Gate or Kharadi Bypass.",
  verificationCode: "CEC-TR-2024-SECURE-TOKEN-PRN003",
});

registrationStore.set("PRN2024004", {
  id: "TR26-1X5Z33",
  routeId: "route-3",
  pickupPointId: "pp-3-2",
  transportationType: "bus",
  vehicleNumber: "MH-12-TR-1003",
  status: "REJECTED",
  submittedAt: "2024-07-21T14:45:00.000Z",
  studentName: "Neha Kulkarni",
  studentPrn: "PRN2024004",
  studentEmail: "neha.kulkarni@college.edu",
  studentBranch: "Civil Engineering",
  studentClass: "TE (Third Year)",
  academicYear: "2024-2025",
  studentVisibleReason: "Incomplete payment reference number provided. Please re-apply with a valid college cashier challan.",
  verificationCode: "CEC-TR-2024-SECURE-TOKEN-PRN004",
});

/** In-memory payments list */
export let MOCK_PAYMENTS: AdminPaymentRecord[] = [
  {
    id: "pay-001",
    studentId: "stu-001",
    studentName: "Harshal Patil",
    studentPrn: "PRN2024001",
    routeName: "Route 5 — Kothrud & Karve Nagar",
    academicYear: "2024-2025",
    totalAmount: 18000,
    paidAmount: 18000,
    pendingAmount: 0,
    status: "PAID",
    paymentMode: "UPI",
    transactionRef: "UTR882910394821",
    verifiedAt: "2024-07-16T14:15:00.000Z",
    updatedAt: "2024-07-16T14:15:00.000Z",
  },
  {
    id: "pay-002",
    studentId: "stu-002",
    studentName: "Aarav Sharma",
    studentPrn: "PRN2024002",
    routeName: "Route 1 — Shivajinagar",
    academicYear: "2024-2025",
    totalAmount: 18000,
    paidAmount: 9000,
    pendingAmount: 9000,
    status: "PARTIALLY_PAID",
    paymentMode: "UPI",
    transactionRef: "UPI9922883311",
    verifiedAt: undefined,
    updatedAt: "2024-07-18T11:00:00.000Z",
  },
  {
    id: "pay-003",
    studentId: "stu-003",
    studentName: "Pooja Deshmukh",
    studentPrn: "PRN2024003",
    routeName: "Route 2 — Hadapsar & Kharadi",
    academicYear: "2024-2025",
    totalAmount: 18000,
    paidAmount: 0,
    pendingAmount: 18000,
    status: "PENDING",
    paymentMode: undefined,
    transactionRef: undefined,
    verifiedAt: undefined,
    updatedAt: "2024-07-20T10:15:00.000Z",
  },
  {
    id: "pay-004",
    studentId: "stu-004",
    studentName: "Neha Kulkarni",
    studentPrn: "PRN2024004",
    routeName: "Route 3 — Hinjewadi & Wakad",
    academicYear: "2024-2025",
    totalAmount: 18000,
    paidAmount: 0,
    pendingAmount: 18000,
    status: "PENDING",
    paymentMode: undefined,
    transactionRef: undefined,
    verifiedAt: undefined,
    updatedAt: "2024-07-21T14:45:00.000Z",
  },
];

/** In-memory audit trail */
export let MOCK_AUDIT_LOGS: AdminAuditLogItem[] = [
  {
    id: "aud-001",
    action: "ADMIN_APPROVED_REGISTRATION",
    actorEmail: "admin@college.local",
    actorRole: "ADMIN",
    targetId: "TR26-8F4K92",
    details: { studentPrn: "PRN2024001", routeCode: "R-05-KT", action: "Pass verified and activated" },
    ipAddress: "192.168.1.104",
    createdAt: "2024-07-16T14:15:00.000Z",
  },
  {
    id: "aud-002",
    action: "ADMIN_REQUESTED_CHANGES",
    actorEmail: "admin@college.local",
    actorRole: "ADMIN",
    targetId: "TR26-7V2L88",
    details: { studentPrn: "PRN2024003", remark: "Hadapsar stop capacity full" },
    ipAddress: "192.168.1.104",
    createdAt: "2024-07-20T11:30:00.000Z",
  },
  {
    id: "aud-003",
    action: "ADMIN_REJECTED_REGISTRATION",
    actorEmail: "admin@college.local",
    actorRole: "ADMIN",
    targetId: "TR26-1X5Z33",
    details: { studentPrn: "PRN2024004", reason: "Invalid payment reference" },
    ipAddress: "192.168.1.104",
    createdAt: "2024-07-21T16:00:00.000Z",
  },
  {
    id: "aud-004",
    action: "STUDENT_UPDATED_TRANSPORT",
    actorEmail: "student1@college.local",
    actorRole: "STUDENT",
    targetId: "TR26-8F4K92",
    details: { updatedFields: ["pickupPointId"] },
    ipAddress: "127.0.0.1",
    createdAt: "2024-07-15T09:30:00.000Z",
  },
];

export function getRoutes(): TransportRoute[] {
  return MOCK_ROUTES;
}

export function getMyRegistration(studentId: string): TransportRegistrationRecord | null {
  return registrationStore.get(studentId) ?? null;
}

function generateTransportId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TR26-${randomPart}`;
}

export function createRegistration(
  student: StudentProfile,
  data: TransportRegistration
): TransportRegistrationRecord {
  if (registrationStore.has(student.studentId)) {
    throw new Error(
      "Duplicate submission prevented: You have already submitted a transportation registration."
    );
  }

  const route = MOCK_ROUTES.find((r) => r.id === data.routeId);
  const resolvedBusNumber =
    data.vehicleNumber?.trim() || route?.busNumber || "TBD (Bus Pool)";

  const newId = generateTransportId();

  const record: TransportRegistrationRecord = {
    id: newId,
    routeId: data.routeId,
    pickupPointId: data.pickupPointId,
    transportationType: data.transportationType,
    vehicleNumber: resolvedBusNumber,
    status: "PENDING",
    submittedAt: new Date().toISOString(),
    studentName: student.fullName,
    studentPrn: student.studentId,
    studentEmail: student.email,
    studentBranch: student.branch,
    studentClass: student.className,
    academicYear: student.academicYear,
    paymentClaim: data.paymentClaim
      ? {
          transactionRef: data.paymentClaim.transactionRef,
          paymentMode: data.paymentClaim.paymentMode,
          paymentDate: data.paymentClaim.paymentDate,
          claimedAmount: data.paymentClaim.claimedAmount,
          officialStatus: "PENDING_VERIFICATION",
        }
      : undefined,
    verificationCode: `CEC-TR-2024-${newId}`,
  };

  registrationStore.set(student.studentId, record);
  return record;
}

export function updateStudentRegistration(
  studentId: string,
  updates: Partial<TransportRegistration>
): TransportRegistrationRecord {
  const existing = registrationStore.get(studentId);
  if (!existing) {
    throw new Error("No active transportation registration found to update.");
  }

  const route = updates.routeId
    ? MOCK_ROUTES.find((r) => r.id === updates.routeId)
    : MOCK_ROUTES.find((r) => r.id === existing.routeId);

  const updatedRecord: TransportRegistrationRecord = {
    ...existing,
    routeId: updates.routeId || existing.routeId,
    pickupPointId: updates.pickupPointId || existing.pickupPointId,
    transportationType: updates.transportationType || existing.transportationType,
    vehicleNumber: updates.vehicleNumber || route?.busNumber || existing.vehicleNumber,
    status: "PENDING",
    studentVisibleReason: undefined,
  };

  registrationStore.set(studentId, updatedRecord);
  return updatedRecord;
}

export function updateRegistrationStatus(
  studentId: string,
  newStatus: RegistrationStatus,
  reason?: string
): TransportRegistrationRecord {
  const existing = registrationStore.get(studentId);
  if (!existing) {
    throw new Error("Registration not found.");
  }

  const updated: TransportRegistrationRecord = {
    ...existing,
    status: newStatus,
    approvedAt: newStatus === "APPROVED" ? new Date().toISOString() : existing.approvedAt,
    expiresAt: newStatus === "APPROVED" ? "2025-06-30T23:59:59.000Z" : existing.expiresAt,
    studentVisibleReason: reason,
  };

  registrationStore.set(studentId, updated);
  return updated;
}

export function resetStudentRegistration(studentId: string): void {
  registrationStore.delete(studentId);
}

export function getPublicVerification(
  transportId: string
): PublicVerificationResponse | null {
  for (const record of registrationStore.values()) {
    if (record.id === transportId) {
      const route = MOCK_ROUTES.find((r) => r.id === record.routeId);
      const pickup = route?.pickupPoints.find((p) => p.id === record.pickupPointId);

      const nameParts = record.studentName.split(" ");
      const maskedName =
        nameParts.length > 1
          ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
          : record.studentName;

      let publicStatus: "ACTIVE" | "PENDING_VERIFICATION" | "INACTIVE" | "EXPIRED" =
        "INACTIVE";
      if (record.status === "APPROVED") {
        publicStatus = "ACTIVE";
      } else if (record.status === "PENDING" || record.status === "CHANGES_REQUIRED") {
        publicStatus = "PENDING_VERIFICATION";
      } else if (record.status === "EXPIRED") {
        publicStatus = "EXPIRED";
      }

      return {
        transportationId: record.id,
        status: publicStatus,
        studentName: maskedName,
        academicYear: record.academicYear,
        collegeName: "City Engineering College",
        routeName: route?.name || "Official College Route",
        pickupPointName: pickup?.name || "Official Stop",
        verifiedAt: new Date().toISOString(),
      };
    }
  }

  return null;
}

// =============================================================================
// ADMIN SPECIFIC METHODS
// =============================================================================

export function getAdminMetrics(): AdminDashboardMetrics {
  const registrations = Array.from(registrationStore.values());
  const pendingReview = registrations.filter((r) => r.status === "PENDING").length;
  const approvedPasses = registrations.filter((r) => r.status === "APPROVED").length;
  const changesRequired = registrations.filter((r) => r.status === "CHANGES_REQUIRED").length;
  const rejectedRegistrations = registrations.filter((r) => r.status === "REJECTED").length;

  const totalFeesExpected = MOCK_PAYMENTS.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalFeesCollected = MOCK_PAYMENTS.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalFeesPending = MOCK_PAYMENTS.reduce((sum, p) => sum + p.pendingAmount, 0);

  return {
    totalStudents: MOCK_STUDENTS.length,
    totalRegistrations: registrations.length,
    pendingReview,
    approvedPasses,
    changesRequired,
    rejectedRegistrations,
    totalFeesExpected,
    totalFeesCollected,
    totalFeesPending,
    totalActiveRoutes: MOCK_ROUTES.length,
  };
}

export function getAdminRegistrations(
  statusFilter?: string,
  search?: string
): AdminRegistrationItem[] {
  let list = Array.from(registrationStore.values()).map((r) => {
    const route = MOCK_ROUTES.find((rt) => rt.id === r.routeId);
    const pickup = route?.pickupPoints.find((pp) => pp.id === r.pickupPointId);
    const student = MOCK_STUDENTS.find((s) => s.prn === r.studentPrn);
    const payment = MOCK_PAYMENTS.find((p) => p.studentPrn === r.studentPrn);

    return {
      id: r.id,
      transportationId: r.id,
      studentId: student?.id || "stu-" + r.studentPrn,
      studentName: r.studentName,
      studentPrn: r.studentPrn,
      studentEmail: r.studentEmail,
      studentMobile: student?.mobile || "9876543210",
      studentClass: r.studentClass,
      studentBranch: r.studentBranch,
      academicYear: r.academicYear,
      routeId: r.routeId,
      routeName: route?.name || "Route " + r.routeId,
      pickupPointId: r.pickupPointId,
      pickupPointName: pickup?.name || "Pickup Point",
      transportationType: r.transportationType,
      vehicleNumber: r.vehicleNumber,
      status: r.status,
      submittedAt: r.submittedAt,
      approvedAt: r.approvedAt,
      studentVisibleReason: r.studentVisibleReason,
      payment: payment
        ? {
            id: payment.id,
            totalAmount: payment.totalAmount,
            paidAmount: payment.paidAmount,
            pendingAmount: payment.pendingAmount,
            status: payment.status,
            transactionRef: payment.transactionRef,
            paymentMode: payment.paymentMode,
          }
        : undefined,
    } as AdminRegistrationItem;
  });

  if (statusFilter && statusFilter !== "ALL") {
    list = list.filter((item) => item.status === statusFilter);
  }

  if (search && search.trim().length > 0) {
    const q = search.toLowerCase();
    list = list.filter(
      (item) =>
        item.studentName.toLowerCase().includes(q) ||
        item.studentPrn.toLowerCase().includes(q) ||
        item.routeName.toLowerCase().includes(q) ||
        item.pickupPointName.toLowerCase().includes(q)
    );
  }

  return list;
}

export function adminApproveRegistration(
  transportId: string,
  adminEmail: string = "admin@college.local"
): TransportRegistrationRecord {
  for (const [prn, record] of registrationStore.entries()) {
    if (record.id === transportId) {
      const updated = updateRegistrationStatus(prn, "APPROVED");
      // Update student table
      const stu = MOCK_STUDENTS.find((s) => s.prn === prn);
      if (stu) {
        stu.transportStatus = "APPROVED";
        stu.transportationId = record.id;
      }
      // Record in audit log
      MOCK_AUDIT_LOGS.unshift({
        id: "aud-" + Date.now(),
        action: "ADMIN_APPROVED_REGISTRATION",
        actorEmail: adminEmail,
        actorRole: "ADMIN",
        targetId: record.id,
        details: { prn, studentName: record.studentName, status: "APPROVED" },
        createdAt: new Date().toISOString(),
      });
      return updated;
    }
  }
  throw new Error("Registration not found");
}

export function adminRejectRegistration(
  transportId: string,
  reason: string,
  adminEmail: string = "admin@college.local"
): TransportRegistrationRecord {
  for (const [prn, record] of registrationStore.entries()) {
    if (record.id === transportId) {
      const updated = updateRegistrationStatus(prn, "REJECTED", reason);
      const stu = MOCK_STUDENTS.find((s) => s.prn === prn);
      if (stu) {
        stu.transportStatus = "REJECTED";
      }
      MOCK_AUDIT_LOGS.unshift({
        id: "aud-" + Date.now(),
        action: "ADMIN_REJECTED_REGISTRATION",
        actorEmail: adminEmail,
        actorRole: "ADMIN",
        targetId: record.id,
        details: { prn, reason },
        createdAt: new Date().toISOString(),
      });
      return updated;
    }
  }
  throw new Error("Registration not found");
}

export function adminRequestChangesRegistration(
  transportId: string,
  comment: string,
  adminEmail: string = "admin@college.local"
): TransportRegistrationRecord {
  for (const [prn, record] of registrationStore.entries()) {
    if (record.id === transportId) {
      const updated = updateRegistrationStatus(prn, "CHANGES_REQUIRED", comment);
      const stu = MOCK_STUDENTS.find((s) => s.prn === prn);
      if (stu) {
        stu.transportStatus = "CHANGES_REQUIRED";
      }
      MOCK_AUDIT_LOGS.unshift({
        id: "aud-" + Date.now(),
        action: "ADMIN_REQUESTED_CHANGES",
        actorEmail: adminEmail,
        actorRole: "ADMIN",
        targetId: record.id,
        details: { prn, comment },
        createdAt: new Date().toISOString(),
      });
      return updated;
    }
  }
  throw new Error("Registration not found");
}

export function getAdminStudents(search?: string, branch?: string): AdminStudentItem[] {
  let list = [...MOCK_STUDENTS];
  if (search && search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.prn.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }
  if (branch && branch !== "ALL") {
    list = list.filter((s) => s.branch === branch);
  }
  return list;
}

export function adminDeactivatePass(
  prn: string,
  reason: string,
  adminEmail: string = "admin@college.local"
): void {
  const stu = MOCK_STUDENTS.find((s) => s.prn === prn);
  if (stu) {
    stu.transportStatus = "NOT_REGISTERED";
    stu.transportationId = undefined;
  }
  registrationStore.delete(prn);
  MOCK_AUDIT_LOGS.unshift({
    id: "aud-" + Date.now(),
    action: "ADMIN_REVOKED_PASS",
    actorEmail: adminEmail,
    actorRole: "ADMIN",
    targetId: prn,
    details: { prn, reason },
    createdAt: new Date().toISOString(),
  });
}

export function getAdminPayments(): AdminPaymentRecord[] {
  return [...MOCK_PAYMENTS];
}

export function adminUpdatePayment(
  paymentId: string,
  paidAmount: number,
  mode?: PaymentMode,
  ref?: string,
  adminEmail: string = "admin@college.local"
): AdminPaymentRecord {
  const payment = MOCK_PAYMENTS.find((p) => p.id === paymentId);
  if (!payment) throw new Error("Payment record not found");

  payment.paidAmount = paidAmount;
  payment.pendingAmount = Math.max(0, payment.totalAmount - paidAmount);
  payment.status =
    payment.paidAmount >= payment.totalAmount
      ? "PAID"
      : payment.paidAmount > 0
      ? "PARTIALLY_PAID"
      : "PENDING";
  if (mode) payment.paymentMode = mode;
  if (ref) payment.transactionRef = ref;
  payment.updatedAt = new Date().toISOString();
  if (payment.status === "PAID") {
    payment.verifiedAt = new Date().toISOString();
  }

  MOCK_AUDIT_LOGS.unshift({
    id: "aud-" + Date.now(),
    action: "ADMIN_UPDATED_PAYMENT",
    actorEmail: adminEmail,
    actorRole: "ADMIN",
    targetId: paymentId,
    details: { prn: payment.studentPrn, paidAmount, status: payment.status },
    createdAt: new Date().toISOString(),
  });

  return payment;
}

export function getAdminAuditLogs(): AdminAuditLogItem[] {
  return [...MOCK_AUDIT_LOGS];
}

export function adminCreateRoute(routeData: Omit<TransportRoute, "id" | "pickupPoints">): TransportRoute {
  const newRoute: TransportRoute = {
    ...routeData,
    id: "route-" + (MOCK_ROUTES.length + 1),
    pickupPoints: [],
  };
  MOCK_ROUTES.push(newRoute);
  MOCK_AUDIT_LOGS.unshift({
    id: "aud-" + Date.now(),
    action: "ADMIN_CREATED_ROUTE",
    actorEmail: "admin@college.local",
    actorRole: "ADMIN",
    targetId: newRoute.id,
    details: { routeName: newRoute.name, code: newRoute.routeCode },
    createdAt: new Date().toISOString(),
  });
  return newRoute;
}

export function adminAddPickupPoint(
  routeId: string,
  pointData: Omit<TransportRoute["pickupPoints"][0], "id">
): TransportRoute {
  const route = MOCK_ROUTES.find((r) => r.id === routeId);
  if (!route) throw new Error("Route not found");
  const newPoint = {
    ...pointData,
    id: `pp-${routeId}-${route.pickupPoints.length + 1}`,
  };
  route.pickupPoints.push(newPoint);
  return route;
}
