// =============================================================================
// POST /api/transport/demo-status
// Developer / evaluator helper to toggle registration status for testing
// all 5 required system states:
// - PENDING
// - APPROVED
// - CHANGES_REQUIRED
// - REJECTED
// - EXPIRED
// =============================================================================

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { updateRegistrationStatus } from "@/lib/data";
import type { RegistrationStatus } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const student = await requireAuth();
    const body = await request.json();
    const newStatus = body.status as RegistrationStatus;
    const reason = body.reason as string | undefined;

    if (!["PENDING", "APPROVED", "CHANGES_REQUIRED", "REJECTED", "EXPIRED"].includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value." },
        { status: 400 }
      );
    }

    const updated = updateRegistrationStatus(student.studentId, newStatus, reason);

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Status updated to ${newStatus} for student session.`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
