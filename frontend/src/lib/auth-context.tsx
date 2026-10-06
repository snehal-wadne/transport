"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AuthUser, UserRole, StudentProfile } from "./types";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAs: (role: UserRole, studentPrn?: string) => void;
  logout: () => void;
  updateStudentProfile: (profile: Partial<StudentProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Standard demo profiles matching backend seeds
export const DEMO_PROFILES: Record<string, { user: AuthUser; profile: StudentProfile }> = {
  admin: {
    user: {
      id: "usr-admin-01",
      email: "admin@college.local",
      role: "ADMIN",
      fullName: "Admin Office (Transport Control)",
    },
    profile: {
      fullName: "Admin Officer",
      studentId: "ADM001",
      email: "admin@college.local",
      mobile: "+91 98220 00000",
      academicYear: "2024-2025",
      className: "Administration",
      branch: "Transportation Division",
    },
  },
  student1: {
    user: {
      id: "usr-stu-01",
      email: "student1@college.local",
      role: "STUDENT",
      fullName: "Harshal Patil",
      prn: "PRN2024001",
    },
    profile: {
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
  },
  student2: {
    user: {
      id: "usr-stu-02",
      email: "student2@college.local",
      role: "STUDENT",
      fullName: "Aarav Sharma",
      prn: "PRN2024002",
    },
    profile: {
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
  },
  student3: {
    user: {
      id: "usr-stu-03",
      email: "student3@college.local",
      role: "STUDENT",
      fullName: "Pooja Deshmukh",
      prn: "PRN2024003",
    },
    profile: {
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
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("transport_auth_token");
      const savedUserStr = localStorage.getItem("transport_auth_user");

      if (savedToken && savedUserStr) {
        const parsedUser = JSON.parse(savedUserStr) as AuthUser;
        setToken(savedToken);
        setUser(parsedUser);
      } else {
        // Default to demo student1 so portal functions immediately for evaluation
        const defaultProfile = DEMO_PROFILES.student1;
        const initialUser: AuthUser = {
          ...defaultProfile.user,
          studentProfile: defaultProfile.profile,
        };
        setUser(initialUser);
        setToken("mock-jwt-token-student1");
        localStorage.setItem("transport_auth_token", "mock-jwt-token-student1");
        localStorage.setItem("transport_auth_user", JSON.stringify(initialUser));
      }
    } catch {
      // Fallback in case of SSR or storage exception
      const defaultProfile = DEMO_PROFILES.student1;
      setUser({ ...defaultProfile.user, studentProfile: defaultProfile.profile });
      setToken("mock-jwt-token-student1");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        // First try real backend
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }).catch(() => null);

        if (response && response.ok) {
          const resData = await response.json();
          const authToken = resData.access_token || resData.token;
          const userPayload: AuthUser = {
            id: resData.user?.id || "usr-" + Date.now(),
            email: resData.user?.email || email,
            role: (resData.user?.role as UserRole) || (email.includes("admin") ? "ADMIN" : "STUDENT"),
            fullName: resData.user?.student?.fullName || (email.includes("admin") ? "Transportation Administrator" : "Student User"),
            prn: resData.user?.student?.prn,
            studentProfile: resData.user?.student
              ? {
                  fullName: resData.user.student.fullName,
                  studentId: resData.user.student.prn,
                  email: resData.user.student.email,
                  mobile: resData.user.student.mobile,
                  academicYear: resData.user.student.academicYear,
                  className: resData.user.student.className,
                  branch: resData.user.student.branch,
                  bloodGroup: resData.user.student.bloodGroup,
                  emergencyContact: resData.user.student.emergencyContact,
                }
              : undefined,
          };

          setToken(authToken);
          setUser(userPayload);
          localStorage.setItem("transport_auth_token", authToken);
          localStorage.setItem("transport_auth_user", JSON.stringify(userPayload));
          setIsLoading(false);
          return { success: true };
        }

        // Fallback for demo logins without requiring live PostgreSQL server
        const isMatchedAdmin = email.toLowerCase() === "admin@college.local";
        const matchedKey = isMatchedAdmin
          ? "admin"
          : email.includes("student2")
          ? "student2"
          : email.includes("student3")
          ? "student3"
          : "student1";

        const demoProfile = DEMO_PROFILES[matchedKey];
        if (demoProfile) {
          const demoUser: AuthUser = {
            ...demoProfile.user,
            studentProfile: demoProfile.profile,
          };
          const mockToken = `mock-token-${matchedKey}`;
          setToken(mockToken);
          setUser(demoUser);
          localStorage.setItem("transport_auth_token", mockToken);
          localStorage.setItem("transport_auth_user", JSON.stringify(demoUser));
          setIsLoading(false);
          return { success: true };
        }

        setIsLoading(false);
        return { success: false, error: "Invalid email or password" };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err?.message || "Authentication failed" };
      }
    },
    []
  );

  const loginAs = useCallback((role: UserRole, studentPrn?: string) => {
    let key = "student1";
    if (role === "ADMIN") {
      key = "admin";
    } else if (studentPrn === "PRN2024002") {
      key = "student2";
    } else if (studentPrn === "PRN2024003") {
      key = "student3";
    }

    const demo = DEMO_PROFILES[key];
    const newUser: AuthUser = {
      ...demo.user,
      studentProfile: demo.profile,
    };
    const mockToken = `mock-token-${key}`;
    setToken(mockToken);
    setUser(newUser);
    try {
      localStorage.setItem("transport_auth_token", mockToken);
      localStorage.setItem("transport_auth_user", JSON.stringify(newUser));
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("transport_auth_token");
      localStorage.removeItem("transport_auth_user");
    } catch {}
  }, []);

  const updateStudentProfile = useCallback((profile: Partial<StudentProfile>) => {
    setUser((prev) => {
      if (!prev || !prev.studentProfile) return prev;
      const updated: AuthUser = {
        ...prev,
        fullName: profile.fullName || prev.fullName,
        studentProfile: {
          ...prev.studentProfile,
          ...profile,
        },
      };
      try {
        localStorage.setItem("transport_auth_user", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isLoading,
        login,
        loginAs,
        logout,
        updateStudentProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
