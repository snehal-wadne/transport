import { headers, cookies } from "next/headers";
import type { StudentProfile } from "./types";
import { getCustomStudent, saveCustomStudent } from "./data";

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
 * Resolves the authenticated student from request headers or token or cookies.
 */
export async function getAuthenticatedStudent(tokenOverride?: string): Promise<StudentProfile | null> {
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

  let cookieEmail: string | undefined;
  let cookiePayload: string | undefined;

  try {
    const cookieStore = await cookies();
    if (!token) {
      token = cookieStore.get("transport_auth_token")?.value;
    }
    cookieEmail = cookieStore.get("transport_user_email")?.value;
    cookiePayload = cookieStore.get("transport_user_payload")?.value;
  } catch {
    // Outside request context
  }

  // Check predefined seed profiles
  if (token?.includes("student2")) {
    return PROFILES.student2;
  }
  if (token?.includes("student3")) {
    return PROFILES.student3;
  }
  if (token === "mock-jwt-token-student1" || token === "mock-token-student1") {
    return PROFILES.student1;
  }

  // Check custom token with base64 payload
  if (token?.startsWith("token-custom-")) {
    try {
      const decodedStr = Buffer.from(token.replace("token-custom-", ""), "base64").toString("utf-8");
      const tokenData = JSON.parse(decodedStr);
      if (tokenData.email) {
        const stored = getCustomStudent(tokenData.email);
        if (stored) return stored;
        return {
          fullName: tokenData.fullName || "",
          studentId: tokenData.prn || "",
          email: tokenData.email,
          mobile: tokenData.mobile || "",
          academicYear: tokenData.academicYear || "2024-2025",
          className: tokenData.className || "",
          branch: tokenData.branch || "",
          bloodGroup: "O+",
          emergencyContact: "",
        };
      }
    } catch {}
  }

  // Check cookie user payload
  if (cookiePayload) {
    try {
      const parsed = JSON.parse(decodeURIComponent(cookiePayload));
      if (parsed.email) {
        const stored = getCustomStudent(parsed.email);
        if (stored) return stored;
        if (parsed.studentProfile) return parsed.studentProfile;
        return {
          fullName: parsed.fullName || "",
          studentId: parsed.prn || "",
          email: parsed.email,
          mobile: "",
          academicYear: "2024-2025",
          className: "",
          branch: "",
          bloodGroup: "O+",
          emergencyContact: "",
        };
      }
    } catch {}
  }

  // Check cookie email
  if (cookieEmail) {
    const email = decodeURIComponent(cookieEmail);
    const stored = getCustomStudent(email);
    if (stored) return stored;
    return {
      fullName: "",
      studentId: "",
      email: email,
      mobile: "",
      academicYear: "2024-2025",
      className: "",
      branch: "",
      bloodGroup: "O+",
      emergencyContact: "",
    };
  }

  // If no auth token or cookie at all, return null
  return null;
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
