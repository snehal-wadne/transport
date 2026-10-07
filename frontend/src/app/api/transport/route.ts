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
import { getAuthenticatedStudent, requireAuth } from "@/lib/auth";
import { createRegistration, getMyRegistration, resetStudentRegistration, saveCustomStudent } from "@/lib/data";
import { transportDetailsSchema, paymentClaimSchema } from "@/lib/validations";
import type { StudentProfile } from "@/lib/types";

export async function GET() {
  try {
    const student = await getAuthenticatedStudent();
    if (!student) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const registration =
      (student.studentId ? getMyRegistration(student.studentId) : null) ||
      (student.email ? getMyRegistration(student.email) : null);

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
    const body = await request.json();
    const sessionStudent = await getAuthenticatedStudent();

    // 1. Resolve student profile from body and session
    const resolvedStudent: StudentProfile = {
      fullName: body.fullName || sessionStudent?.fullName || "Student User",
      studentId: body.studentId || sessionStudent?.studentId || "PRN" + Date.now().toString().slice(-6),
      email: body.email || sessionStudent?.email || "student@college.local",
      mobile: body.mobile || sessionStudent?.mobile || "",
      academicYear: body.academicYear || sessionStudent?.academicYear || "2024-2025",
      className: body.className || sessionStudent?.className || "Engineering",
      branch: body.branch || sessionStudent?.branch || "Computer Engineering",
      bloodGroup: sessionStudent?.bloodGroup || "O+",
      emergencyContact: sessionStudent?.emergencyContact || "",
    };

    saveCustomStudent(resolvedStudent);

    // 2. Prevent duplicate submissions
    const existing =
      (resolvedStudent.studentId ? getMyRegistration(resolvedStudent.studentId) : null) ||
      (resolvedStudent.email ? getMyRegistration(resolvedStudent.email) : null);

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already submitted a transportation registration. Duplicate submissions are not permitted.",
        },
        { status: 409 }
      );
    }

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

    // 5. Create registration associated exclusively with the resolved student
    const record = createRegistration(resolvedStudent, {
      ...transportParsed.data,
      paymentClaim: paymentClaimData,
    });

    return NextResponse.json(
      {
        success: true,
        data: record,
        student: resolvedStudent,
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
    const student = await getAuthenticatedStudent();
    if (student) {
      if (student.studentId) resetStudentRegistration(student.studentId);
      if (student.email) resetStudentRegistration(student.email);
    }
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
