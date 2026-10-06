// =============================================================================
// GET /api/students/me — Returns the authenticated student's profile
// Security: Identity resolved from server session.
// No studentId parameter accepted.
// =============================================================================

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const student = await requireAuth();
    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "401 Unauthorized: Session missing or invalid.",
      },
      { status: 401 }
    );
  }
}
