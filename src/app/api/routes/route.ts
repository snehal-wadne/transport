// =============================================================================
// GET /api/routes — Returns all available transport routes with pickup points
// Public route data (managed by admin, read by students)
// =============================================================================

import { NextResponse } from "next/server";
import { getRoutes } from "@/lib/data";

export async function GET() {
  try {
    const routes = getRoutes();
    return NextResponse.json({ success: true, data: routes });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch routes" },
      { status: 500 }
    );
  }
}
