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
        document.cookie = `transport_auth_token=${encodeURIComponent(savedToken)}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `transport_user_email=${encodeURIComponent(parsedUser.email)}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `transport_user_payload=${encodeURIComponent(JSON.stringify(parsedUser))}; path=/; max-age=604800; SameSite=Lax`;
      } else {
        setUser(null);
        setToken(null);
      }
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const trimmedEmail = email.trim().toLowerCase();

        // First try real backend
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail, password }),
        }).catch(() => null);

        if (response && response.ok) {
          const resData = await response.json();
          const authToken = resData.access_token || resData.token;
          const userPayload: AuthUser = {
            id: resData.user?.id || "usr-" + Date.now(),
            email: resData.user?.email || trimmedEmail,
            role: (resData.user?.role as UserRole) || (trimmedEmail.includes("admin") ? "ADMIN" : "STUDENT"),
            fullName: resData.user?.student?.fullName || (trimmedEmail.includes("admin") ? "Transportation Administrator" : "Student User"),
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
          document.cookie = `transport_auth_token=${encodeURIComponent(authToken)}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `transport_user_email=${encodeURIComponent(trimmedEmail)}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `transport_user_payload=${encodeURIComponent(JSON.stringify(userPayload))}; path=/; max-age=604800; SameSite=Lax`;
          setIsLoading(false);
          return { success: true };
        }

        // Check predefined demo profiles
        if (trimmedEmail === "admin@college.local" || trimmedEmail.includes("admin")) {
          const demo = DEMO_PROFILES.admin;
          const userObj: AuthUser = { ...demo.user, studentProfile: demo.profile };
          setToken("mock-token-admin");
          setUser(userObj);
          localStorage.setItem("transport_auth_token", "mock-token-admin");
          localStorage.setItem("transport_auth_user", JSON.stringify(userObj));
          document.cookie = `transport_auth_token=mock-token-admin; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `transport_user_email=${encodeURIComponent(trimmedEmail)}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `transport_user_payload=${encodeURIComponent(JSON.stringify(userObj))}; path=/; max-age=604800; SameSite=Lax`;
          setIsLoading(false);
          return { success: true };
        }

        if (trimmedEmail === "student1@college.local") {
          const demo = DEMO_PROFILES.student1;
          const userObj: AuthUser = { ...demo.user, studentProfile: demo.profile };
          setToken("mock-token-student1");
          setUser(userObj);
          localStorage.setItem("transport_auth_token", "mock-token-student1");
          localStorage.setItem("transport_auth_user", JSON.stringify(userObj));
          document.cookie = `transport_auth_token=mock-token-student1; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `transport_user_email=${encodeURIComponent(trimmedEmail)}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `transport_user_payload=${encodeURIComponent(JSON.stringify(userObj))}; path=/; max-age=604800; SameSite=Lax`;
          setIsLoading(false);
          return { success: true };
        }

        if (trimmedEmail === "student2@college.local") {
          const demo = DEMO_PROFILES.student2;
          const userObj: AuthUser = { ...demo.user, studentProfile: demo.profile };
          setToken("mock-token-student2");
          setUser(userObj);
          localStorage.setItem("transport_auth_token", "mock-token-student2");
          localStorage.setItem("transport_auth_user", JSON.stringify(userObj));
          document.cookie = `transport_auth_token=mock-token-student2; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `transport_user_email=${encodeURIComponent(trimmedEmail)}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `transport_user_payload=${encodeURIComponent(JSON.stringify(userObj))}; path=/; max-age=604800; SameSite=Lax`;
          setIsLoading(false);
          return { success: true };
        }

        if (trimmedEmail === "student3@college.local") {
          const demo = DEMO_PROFILES.student3;
          const userObj: AuthUser = { ...demo.user, studentProfile: demo.profile };
          setToken("mock-token-student3");
          setUser(userObj);
          localStorage.setItem("transport_auth_token", "mock-token-student3");
          localStorage.setItem("transport_auth_user", JSON.stringify(userObj));
          document.cookie = `transport_auth_token=mock-token-student3; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `transport_user_email=${encodeURIComponent(trimmedEmail)}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `transport_user_payload=${encodeURIComponent(JSON.stringify(userObj))}; path=/; max-age=604800; SameSite=Lax`;
          setIsLoading(false);
          return { success: true };
        }

        // FOR ANY OTHER EMAIL (CUSTOM STUDENT, e.g. snehal@gmail.com):
        let savedCustomUsers: Record<string, AuthUser> = {};
        try {
          savedCustomUsers = JSON.parse(localStorage.getItem("transport_custom_users") || "{}");
        } catch {}

        let customUser = savedCustomUsers[trimmedEmail];
        if (!customUser) {
          const emailPrefix = trimmedEmail.split("@")[0];
          const displayName =
            emailPrefix
              .replace(/[0-9]/g, "")
              .split(/[._-]/)
              .filter(Boolean)
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(" ") || "New Student";

          customUser = {
            id: "usr-" + Date.now(),
            email: trimmedEmail,
            role: "STUDENT",
            fullName: displayName,
            studentProfile: {
              fullName: "",
              studentId: "",
              email: trimmedEmail,
              mobile: "",
              academicYear: "2024-2025",
              className: "",
              branch: "",
              bloodGroup: "O+",
              emergencyContact: "",
            },
          };
          savedCustomUsers[trimmedEmail] = customUser;
          localStorage.setItem("transport_custom_users", JSON.stringify(savedCustomUsers));
        }

        const customToken =
          "token-custom-" +
          btoa(
            JSON.stringify({
              id: customUser.id,
              email: customUser.email,
              fullName: customUser.fullName,
              prn: customUser.prn,
            })
          );

        setToken(customToken);
        setUser(customUser);
        localStorage.setItem("transport_auth_token", customToken);
        localStorage.setItem("transport_auth_user", JSON.stringify(customUser));
        document.cookie = `transport_auth_token=${encodeURIComponent(customToken)}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `transport_user_email=${encodeURIComponent(trimmedEmail)}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `transport_user_payload=${encodeURIComponent(JSON.stringify(customUser))}; path=/; max-age=604800; SameSite=Lax`;
        setIsLoading(false);
        return { success: true };
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
      document.cookie = `transport_auth_token=${encodeURIComponent(mockToken)}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `transport_user_email=${encodeURIComponent(newUser.email)}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `transport_user_payload=${encodeURIComponent(JSON.stringify(newUser))}; path=/; max-age=604800; SameSite=Lax`;
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("transport_auth_token");
      localStorage.removeItem("transport_auth_user");
      document.cookie = "transport_auth_token=; path=/; max-age=0";
      document.cookie = "transport_user_email=; path=/; max-age=0";
      document.cookie = "transport_user_payload=; path=/; max-age=0";
    } catch {}
  }, []);

  const updateStudentProfile = useCallback((profile: Partial<StudentProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated: AuthUser = {
        ...prev,
        fullName: profile.fullName || prev.fullName,
        prn: profile.studentId || prev.prn,
        studentProfile: {
          ...(prev.studentProfile || {
            fullName: "",
            studentId: "",
            email: prev.email,
            mobile: "",
            academicYear: "2024-2025",
            className: "",
            branch: "",
            bloodGroup: "O+",
            emergencyContact: "",
          }),
          ...profile,
        },
      };
      try {
        localStorage.setItem("transport_auth_user", JSON.stringify(updated));
        if (updated.email) {
          const savedCustom = JSON.parse(localStorage.getItem("transport_custom_users") || "{}");
          savedCustom[updated.email.toLowerCase()] = updated;
          localStorage.setItem("transport_custom_users", JSON.stringify(savedCustom));
        }
        document.cookie = `transport_user_email=${encodeURIComponent(updated.email)}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `transport_user_payload=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=604800; SameSite=Lax`;
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
