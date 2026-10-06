// =============================================================================
// /api/transport/[id] — FORBIDDEN FOR NORMAL STUDENT ACCESS
// Security Requirement:
// "The student must NEVER be able to:
// - Access another student's transportation ID
// If Student A tries to manipulate a request to access Student B's record:
// Return: 403 Forbidden
// Never return Student B's data."
// =============================================================================

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "403 Forbidden: Direct transportation record lookup by arbitrary ID is strictly prohibited. Access is restricted to authenticated student session endpoint /api/transport/me.",
    },
    { status: 403 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "403 Forbidden: Modifying another student's transportation record is prohibited.",
    },
    { status: 403 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: "403 Forbidden: Modifying another student's transportation record is prohibited.",
    },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: "403 Forbidden: Deleting another student's transportation record is prohibited.",
    },
    { status: 403 }
  );
}
