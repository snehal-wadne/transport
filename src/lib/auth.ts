// =============================================================================
// Mock Auth — simulates server-side session / JWT identity resolution.
// In production, replace with real auth (NextAuth, Clerk, custom JWT, etc.)
// =============================================================================

import type { StudentProfile } from "./types";

/**
 * Simulates resolving the authenticated student from a session/token.
 * In production this would:
 *  1. Read the session cookie or Authorization header
 *  2. Validate the JWT / session
 *  3. Query the DB for the student profile
 *  4. Return the profile or throw 401
 *
 * The frontend NEVER sends a studentId — the server determines identity.
 */
export async function getAuthenticatedStudent(): Promise<StudentProfile> {
  // Simulated delay to mimic DB/auth lookup
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    fullName: "Harshal Patil",
    studentId: "PRN2024001",
    email: "harshal.patil@college.edu",
    mobile: "9876543210",
    academicYear: "2024-2025",
    className: "TE (Third Year)",
    branch: "Computer Engineering",
    avatarUrl: undefined,
  };
}

/**
 * Validates that the current request belongs to the authenticated student.
 * Returns the student profile if valid, throws otherwise.
 *
 * In production, this reads cookies/headers — never trusts req body for identity.
 */
export async function requireAuth(): Promise<StudentProfile> {
  const student = await getAuthenticatedStudent();

  if (!student) {
    throw new Error("Unauthorized: No authenticated session found.");
  }

  return student;
}
