// =============================================================================
// GET /api/transport/status — Returns status of authenticated student's registration
// Security Requirement:
// "The backend must identify the student from the authenticated session.
// Prefer: GET /transport/status"
// =============================================================================

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getMyRegistration } from "@/lib/data";

export async function GET() {
  try {
    const student = await requireAuth();
    const registration = getMyRegistration(student.studentId);

    if (!registration) {
      return NextResponse.json({
        success: true,
        data: {
          hasRegistered: false,
          status: null,
          studentPrn: student.studentId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        hasRegistered: true,
        registrationId: registration.id,
        status: registration.status,
        submittedAt: registration.submittedAt,
        routeId: registration.routeId,
        pickupPointId: registration.pickupPointId,
        transportationType: registration.transportationType,
        officialPaymentStatus: registration.paymentClaim?.officialStatus || "NOT_SUBMITTED",
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "401 Unauthorized: Session required.",
      },
      { status: 401 }
    );
  }
}
