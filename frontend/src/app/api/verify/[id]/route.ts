// =============================================================================
// GET /api/verify/[id] — Public Verification API Endpoint
//
// CRITICAL PRIVACY CONTROL:
// Returns ONLY minimum necessary public verification details.
// MUST NOT expose private student information such as:
// - Mobile number
// - Personal address
// - Payment amount or bank ref
// - Pending fees
// - Admin internal notes
// - Internal database IDs
// =============================================================================

import { NextResponse } from "next/server";
import { getPublicVerification } from "@/lib/data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const verification = getPublicVerification(id);

  if (!verification) {
    return NextResponse.json(
      {
        success: false,
        error: "404 Not Found: Transportation pass record not found or invalid identifier.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: verification,
  });
}
