// =============================================================================
// GET /api/transport/me — Returns the authenticated student's own registration
// Security Requirement:
// "The backend must identify the student from the authenticated session.
// Prefer: GET /transport/me"
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
        data: null,
        message: "No active transportation registration found for current student.",
      });
    }

    return NextResponse.json({
      success: true,
      data: registration,
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
