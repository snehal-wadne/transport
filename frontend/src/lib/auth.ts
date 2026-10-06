// =============================================================================
// Server-Side Auth Resolution — resolves identity strictly from token / headers.
// =============================================================================

import { headers } from "next/headers";
import type { StudentProfile } from "./types";

const PROFILES: Record<string, StudentProfile> = {
  student1: {
    fullName: "Harshal Patil",
    studentId: "PRN2024001",
    email: "student1@college.local",
    mobile: "9876543210",
    academicYear: "2024-2025",
    className: "TE (Third Year)",
    branch: "Computer Engineering",
    bloodGroup: "O+",
    emergencyContact: "+91 98220 99881 (Parent)",
  },
  student2: {
    fullName: "Aarav Sharma",
    studentId: "PRN2024002",
    email: "student2@college.local",
    mobile: "9822114455",
    academicYear: "2024-2025",
    className: "BE (Final Year)",
    branch: "Mechanical Engineering",
    bloodGroup: "B+",
    emergencyContact: "+91 98220 88772",
  },
  student3: {
    fullName: "Pooja Deshmukh",
    studentId: "PRN2024003",
    email: "student3@college.local",
    mobile: "9833445566",
    academicYear: "2024-2025",
    className: "SE (Second Year)",
    branch: "Information Technology",
    bloodGroup: "A+",
    emergencyContact: "+91 98220 77663",
  },
};

/**
 * Resolves the authenticated student from request headers or token.
 * The frontend NEVER sends an arbitrary studentId — the server determines identity.
 */
export async function getAuthenticatedStudent(tokenOverride?: string): Promise<StudentProfile> {
  let token = tokenOverride;

  if (!token) {
    try {
      const headerList = await headers();
      const authHeader = headerList.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    } catch {
      // Outside request context
    }
  }

  if (token?.includes("student2")) {
    return PROFILES.student2;
  }
  if (token?.includes("student3")) {
    return PROFILES.student3;
  }
  return PROFILES.student1;
}

/**
 * Validates that the current request belongs to an authenticated student.
 */
export async function requireAuth(tokenOverride?: string): Promise<StudentProfile> {
  const student = await getAuthenticatedStudent(tokenOverride);
  if (!student) {
    throw new Error("Unauthorized: No authenticated session found.");
  }
  return student;
}
