// =============================================================================
// Core Types for Student Transportation Management System
// =============================================================================

/** Authenticated student profile — resolved server-side, never from frontend */
export interface StudentProfile {
  fullName: string;
  studentId: string; // PRN
  email: string;
  mobile: string;
  academicYear: string;
  className: string;
  branch: string;
  avatarUrl?: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

/** A transport route managed by administration */
export interface TransportRoute {
  id: string;
  name: string;
  routeCode: string;
  description?: string;
  busNumber?: string;
  driverName?: string;
  driverContact?: string;
  pickupPoints: PickupPoint[];
}

/** A pickup point belonging to a route */
export interface PickupPoint {
  id: string;
  name: string;
  landmark?: string;
  estimatedTime?: string;
}

/** Transportation type options */
export type TransportationType = "bus" | "van" | "shuttle";

/**
 * Registration status — strictly controlled by Transportation Administration
 * Possible statuses:
 * - PENDING: Under administrative verification
 * - APPROVED: Active and valid transportation pass
 * - CHANGES_REQUIRED: Student needs to update specific commuting details
 * - REJECTED: Registration declined with student-visible reason if permitted
 * - EXPIRED: Pass validity expired for current term
 */
export type RegistrationStatus =
  | "PENDING"
  | "APPROVED"
  | "CHANGES_REQUIRED"
  | "REJECTED"
  | "EXPIRED";

/** Payment modes allowed for student fee deposit claims */
export type PaymentMode = "UPI" | "NET_BANKING" | "CHALLAN" | "DEMAND_DRAFT";

/** Payment status — official status is strictly administered by Admin */
export type OfficialPaymentStatus =
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED";

/** Student-submitted payment claim (Claim/request only, never self-approved) */
export interface PaymentClaim {
  transactionRef: string;
  paymentMode: PaymentMode;
  paymentDate: string;
  claimedAmount: string;
  officialStatus: OfficialPaymentStatus;
}

/** Student's transport registration submission */
export interface TransportRegistration {
  routeId: string;
  pickupPointId: string;
  transportationType: TransportationType;
  vehicleNumber?: string;
  paymentClaim?: {
    transactionRef: string;
    paymentMode: PaymentMode;
    paymentDate: string;
    claimedAmount: string;
  };
}

/** Full registration record (returned from server after session resolution) */
export interface TransportRegistrationRecord {
  id: string; // e.g. TR26-8F4K92
  routeId: string;
  pickupPointId: string;
  transportationType: TransportationType;
  vehicleNumber?: string;
  status: RegistrationStatus;
  submittedAt: string;
  approvedAt?: string;
  expiresAt?: string;
  studentName: string;
  studentPrn: string;
  studentEmail: string;
  studentBranch: string;
  studentClass: string;
  academicYear: string;
  paymentClaim?: PaymentClaim;
  /** Only visible to student if explicitly flagged by backend */
  studentVisibleReason?: string;
  /** Secure verification token for QR code */
  verificationCode?: string;
}

/** Standard API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Public verification response (minimal data only, no private phone/address/payment) */
export interface PublicVerificationResponse {
  transportationId: string;
  status: "ACTIVE" | "PENDING_VERIFICATION" | "INACTIVE" | "EXPIRED";
  studentName: string; // e.g. "Harshal P."
  academicYear: string;
  collegeName: string;
  routeName: string;
  pickupPointName: string;
  verifiedAt: string;
}

/** Navigation item for student dashboard */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}
