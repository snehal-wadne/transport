// =============================================================================
// Mock Data — routes, pickup points, and in-memory registration store.
// In production, replace with secure database queries (e.g., PostgreSQL / Prisma).
// =============================================================================

import type {
  TransportRoute,
  TransportRegistrationRecord,
  TransportRegistration,
  StudentProfile,
  RegistrationStatus,
  PublicVerificationResponse,
} from "./types";

/** Pre-configured transport routes (Admin-managed) */
export const MOCK_ROUTES: TransportRoute[] = [
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

/**
 * In-memory store for registrations (strictly keyed by authenticated studentId).
 * Pre-seeded with the authenticated student's default registration so Page 2 can be viewed immediately.
 */
const registrationStore = new Map<string, TransportRegistrationRecord>();

// Pre-seed an initial registration for Harshal Patil (PRN2024001)
const defaultRegistrationId = "TR26-8F4K92";
registrationStore.set("PRN2024001", {
  id: defaultRegistrationId,
  routeId: "route-5",
  pickupPointId: "pp-5-2",
  transportationType: "bus",
  vehicleNumber: "MH-12-TR-1005",
  status: "APPROVED", // Default to APPROVED so the active pass is showcased, but can be toggled
  submittedAt: "2024-07-15T09:30:00.000Z",
  approvedAt: "2024-07-16T14:15:00.000Z",
  expiresAt: "2025-06-30T23:59:59.000Z",
  studentName: "Harshal Patil",
  studentPrn: "PRN2024001",
  studentEmail: "harshal.patil@college.edu",
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

/** Get routes (Admin-managed list accessible for route dropdown) */
export function getRoutes(): TransportRoute[] {
  return MOCK_ROUTES;
}

/** Get a student's own registration by their server-verified studentId */
export function getMyRegistration(
  studentId: string
): TransportRegistrationRecord | null {
  return registrationStore.get(studentId) ?? null;
}

/**
 * Helper to generate Transportation ID format like: TR26-8F4K92
 */
function generateTransportId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TR26-${randomPart}`;
}

/**
 * Submit a new registration for the authenticated student.
 * Associates the record ONLY with the student from the server session.
 * Never trusts any frontend studentId.
 */
export function createRegistration(
  student: StudentProfile,
  data: TransportRegistration
): TransportRegistrationRecord {
  // Prevent duplicate submissions
  if (registrationStore.has(student.studentId)) {
    throw new Error(
      "Duplicate submission prevented: You have already submitted a transportation registration."
    );
  }

  // Find designated bus number from route if not provided
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
    // Server enforces PENDING status upon creation — student cannot approve themselves
    status: "PENDING",
    submittedAt: new Date().toISOString(),
    studentName: student.fullName,
    studentPrn: student.studentId,
    studentEmail: student.email,
    studentBranch: student.branch,
    studentClass: student.className,
    academicYear: student.academicYear,
    // If student provided payment claim, record it strictly as a claim
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

/**
 * Update commuting details for student's own registration (Edit Details).
 * Only route, pickup point, vehicle number, and payment claim can be updated.
 * Student identity fields remain tamper-proof.
 */
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
    // Any update puts status back into PENDING if changes were required
    status: existing.status === "CHANGES_REQUIRED" ? "PENDING" : existing.status,
    studentVisibleReason: undefined,
  };

  registrationStore.set(studentId, updatedRecord);
  return updatedRecord;
}

/**
 * Update registration status (Used for testing and administrative actions)
 */
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

/** Reset in-memory registration for testing if needed */
export function resetStudentRegistration(studentId: string): void {
  registrationStore.delete(studentId);
}

/**
 * Public Verification Service:
 * Given a transport ID (e.g. TR26-8F4K92), returns ONLY the minimum necessary public verification details.
 *
 * CRITICAL PRIVACY CONTROL:
 * NEVER exposes:
 * - Mobile number
 * - Personal address
 * - Payment amount
 * - Pending fees
 * - Admin notes
 * - Internal database ID
 * - Other student information
 */
export function getPublicVerification(
  transportId: string
): PublicVerificationResponse | null {
  for (const record of registrationStore.values()) {
    if (record.id === transportId) {
      const route = MOCK_ROUTES.find((r) => r.id === record.routeId);
      const pickup = route?.pickupPoints.find((p) => p.id === record.pickupPointId);

      // Mask student name for privacy, e.g. "Harshal P."
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
