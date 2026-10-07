// =============================================================================
// /api/transport/me — Authenticated Student's Own Transportation Endpoint
//
// GET: Returns authenticated student's own record
// PATCH: Updates commuting details (Route / Pickup Point) for authenticated student
//
// CRITICAL ACCESS CONTROL:
// - Resolves student strictly from server session (requireAuth)
// - Never allows querying by studentId
// =============================================================================

import { NextResponse } from "next/server";
import { getAuthenticatedStudent, requireAuth } from "@/lib/auth";
import { getMyRegistration, updateStudentRegistration } from "@/lib/data";
import { transportDetailsSchema } from "@/lib/validations";

export async function GET() {
  try {
    const student = await getAuthenticatedStudent();
    if (!student) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No active session found.",
      });
    }

    const registration =
      (student.studentId ? getMyRegistration(student.studentId) : null) ||
      (student.email ? getMyRegistration(student.email) : null);

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
    return NextResponse.json({
      success: true,
      data: null,
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const student = await requireAuth();
    const body = await request.json();

    const parsed = transportDetailsSchema.safeParse({
      routeId: body.routeId,
      pickupPointId: body.pickupPointId,
      transportationType: body.transportationType,
      vehicleNumber: body.vehicleNumber,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed for updated transport details.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const targetKey = student.studentId || student.email;
    const updated = updateStudentRegistration(targetKey, parsed.data);

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Transportation details updated successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
