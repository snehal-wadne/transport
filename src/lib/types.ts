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

/** Registration status — only Admin can change from PENDING */
export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Payment modes allowed for student fee deposit claims */
export type PaymentMode = "UPI" | "NET_BANKING" | "CHALLAN" | "DEMAND_DRAFT";

/** Payment status — official status is strictly administered by Admin */
export type OfficialPaymentStatus = "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";

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

/** Full registration record (returned from server after submission) */
export interface TransportRegistrationRecord {
  id: string;
  routeId: string;
  pickupPointId: string;
  transportationType: TransportationType;
  vehicleNumber?: string;
  status: RegistrationStatus;
  submittedAt: string;
  studentName: string;
  studentPrn: string;
  studentEmail: string;
  studentBranch: string;
  studentClass: string;
  paymentClaim?: PaymentClaim;
}

/** Standard API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Registration status check response */
export interface RegistrationStatusResponse {
  hasRegistered: boolean;
  registration?: {
    id: string;
    status: RegistrationStatus;
    submittedAt: string;
    paymentStatus: OfficialPaymentStatus;
    routeId: string;
    pickupPointId: string;
  };
}

/** Navigation item for student dashboard */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}
