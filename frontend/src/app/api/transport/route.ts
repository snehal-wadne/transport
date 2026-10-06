// =============================================================================
// /api/transport — Student Transportation Registration Endpoint
//
// POST: Submit a new transportation registration
// GET:  Get the authenticated student's own registration (or status)
//
// SECURITY ARCHITECTURE:
// 1. Identity is derived strictly from server session (requireAuth).
// 2. Do NOT trust a studentId coming from the frontend. Any studentId sent in
//    the payload is ignored. The server session owns the record.
// 3. Duplicate submissions are rejected.
// 4. Payment data is saved as a submitted claim only; official status is PENDING.
// =============================================================================

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createRegistration, getMyRegistration, resetStudentRegistration } from "@/lib/data";
import { transportDetailsSchema, paymentClaimSchema } from "@/lib/validations";

export async function GET() {
  try {
    const student = await requireAuth();
    const registration = getMyRegistration(student.studentId);

    return NextResponse.json({
      success: true,
      data: registration,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "401 Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate & extract student from session (NOT request body)
    const student = await requireAuth();

    // 2. Prevent duplicate submissions
    const existing = getMyRegistration(student.studentId);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already submitted a transportation registration. Duplicate submissions are not permitted.",
        },
        { status: 409 }
      );
    }

    const body = await request.json();

    // 3. Validate transport details
    const transportParsed = transportDetailsSchema.safeParse({
      routeId: body.routeId,
      pickupPointId: body.pickupPointId,
      transportationType: body.transportationType,
      vehicleNumber: body.vehicleNumber,
    });

    if (!transportParsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed for transportation details",
          details: transportParsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 4. Validate payment claim if provided
    let paymentClaimData = undefined;
    if (body.transactionRef || body.paymentMode) {
      const paymentParsed = paymentClaimSchema.safeParse({
        transactionRef: body.transactionRef,
        paymentMode: body.paymentMode,
        paymentDate: body.paymentDate,
        claimedAmount: body.claimedAmount,
      });

      if (!paymentParsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed for payment claim details",
            details: paymentParsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }
      paymentClaimData = paymentParsed.data;
    }

    // 5. Create registration associated exclusively with the authenticated student
    const record = createRegistration(student, {
      ...transportParsed.data,
      paymentClaim: paymentClaimData,
    });

    return NextResponse.json(
      {
        success: true,
        data: record,
        message: "Transportation registration submitted successfully and is waiting for admin verification.",
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// Development/testing helper to reset registration for current student
export async function DELETE() {
  try {
    const student = await requireAuth();
    resetStudentRegistration(student.studentId);
    return NextResponse.json({
      success: true,
      message: "Registration reset for authenticated student session.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}
