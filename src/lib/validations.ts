import { z } from "zod";

// =============================================================================
// Zod Validation Schemas for Transportation Registration
// =============================================================================

/** Validates student info section (read-only identity fields pre-filled from session) */
export const studentInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  studentId: z
    .string()
    .min(4, "Student ID / PRN is required"),
  email: z
    .string()
    .email("Please enter a valid college email address"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  academicYear: z
    .string()
    .min(1, "Academic year is required"),
  className: z
    .string()
    .min(1, "Class is required"),
  branch: z
    .string()
    .min(1, "Branch is required"),
});

/** Validates transport details section */
export const transportDetailsSchema = z.object({
  routeId: z
    .string()
    .min(1, "Please select a transportation route"),
  pickupPointId: z
    .string()
    .min(1, "Please select a pickup point"),
  transportationType: z.enum(["bus", "van", "shuttle"], {
    required_error: "Please select a transportation type",
  }),
  vehicleNumber: z
    .string()
    .optional(),
});

/**
 * Validates payment claim information entered by student.
 * NOTE: This is strictly a submitted claim/request.
 * Official payment status is always controlled by Admin.
 */
export const paymentClaimSchema = z.object({
  transactionRef: z
    .string()
    .min(6, "Transaction reference / UTR number must be at least 6 characters")
    .max(50, "Transaction reference is too long"),
  paymentMode: z.enum(["UPI", "NET_BANKING", "CHALLAN", "DEMAND_DRAFT"], {
    required_error: "Please select payment mode",
  }),
  paymentDate: z
    .string()
    .min(1, "Payment date is required"),
  claimedAmount: z
    .string()
    .min(1, "Claimed amount is required"),
});

/** Full client registration form schema */
export const registrationFormSchema = z.object({
  ...studentInfoSchema.shape,
  ...transportDetailsSchema.shape,
  ...paymentClaimSchema.shape,
});

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;
