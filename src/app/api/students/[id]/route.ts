// =============================================================================
// /api/students/[id] — FORBIDDEN FOR STUDENT ACCESS
// Security Requirement:
// "The frontend must not contain an API such as: GET /students/:id for normal student access.
// If Student A tries to manipulate a request to access Student B's record:
// Return: 403 Forbidden. Never return Student B's data."
// =============================================================================

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "403 Forbidden: Direct student record lookup by ID is strictly prohibited. Access is restricted to authenticated student session endpoint /api/students/me.",
    },
    { status: 403 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "403 Forbidden: Direct modification or access to another student record is prohibited.",
    },
    { status: 403 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: "403 Forbidden: Direct modification or access to another student record is prohibited.",
    },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: "403 Forbidden: Direct deletion of student record is prohibited.",
    },
    { status: 403 }
  );
}
