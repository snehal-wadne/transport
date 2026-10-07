import {
  getRoutes,
  getMyRegistration,
  createRegistration,
  updateStudentRegistration,
  getPublicVerification,
  getAdminMetrics,
  getAdminRegistrations,
  adminApproveRegistration,
  adminRejectRegistration,
  adminRequestChangesRegistration,
  getAdminStudents,
  adminDeactivatePass,
  getAdminPayments,
  adminUpdatePayment,
  getAdminAuditLogs,
  adminCreateRoute,
  adminAddPickupPoint,
  MOCK_ROUTES,
} from "./data";
import type {
  StudentProfile,
  TransportRegistration,
  TransportRegistrationRecord,
  TransportRoute,
  PublicVerificationResponse,
  AdminDashboardMetrics,
  AdminRegistrationItem,
  AdminStudentItem,
  AdminPaymentRecord,
  AdminAuditLogItem,
  PaymentMode,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("transport_auth_token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T; fromLiveBackend: boolean }> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.ok) {
      const json = await res.json();
      const unwrapped =
        json && typeof json === "object" && "data" in json && "success" in json
          ? json.data
          : json;
      return { data: unwrapped as T, fromLiveBackend: true };
    }
  } catch {
    // Backend offline / network unreachable -> fall back to local handlers
  }

  throw new Error("NETWORK_FALLBACK");
}

export const apiClient = {
  // ── Routes ──────────────────────────────────────────────────────────
  routes: {
    getAll: async (): Promise<TransportRoute[]> => {
      try {
        const { data } = await request<any>("/routes");
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        return getRoutes();
      } catch {
        return getRoutes();
      }
    },
  },

  // ── Student Transport (Strictly Session Scoped) ─────────────────────
  transport: {
    getMyTransport: async (currentStudentPrn?: string): Promise<TransportRegistrationRecord | null> => {
      try {
        const { data } = await request<TransportRegistrationRecord>("/transport/me");
        return data;
      } catch {
        return getMyRegistration(currentStudentPrn || "PRN2024001");
      }
    },

    submit: async (
      student: StudentProfile,
      payload: TransportRegistration
    ): Promise<TransportRegistrationRecord> => {
      try {
        const { data } = await request<TransportRegistrationRecord>("/transport", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        return data;
      } catch {
        return createRegistration(student, payload);
      }
    },

    update: async (
      studentPrn: string,
      updates: Partial<TransportRegistration>
    ): Promise<TransportRegistrationRecord> => {
      try {
        const { data } = await request<TransportRegistrationRecord>("/transport/me", {
          method: "PATCH",
          body: JSON.stringify(updates),
        });
        return data;
      } catch {
        return updateStudentRegistration(studentPrn, updates);
      }
    },
  },

  // ── Public QR Verification ──────────────────────────────────────────
  verification: {
    verifyPass: async (transportId: string): Promise<PublicVerificationResponse | null> => {
      try {
        const { data } = await request<PublicVerificationResponse>(`/verify/${transportId}`);
        return data;
      } catch {
        return getPublicVerification(transportId);
      }
    },
  },

  // ── Admin Portal Operations ─────────────────────────────────────────
  admin: {
    getMetrics: async (): Promise<AdminDashboardMetrics> => {
      try {
        const { data } = await request<AdminDashboardMetrics>("/admin/dashboard");
        return data;
      } catch {
        return getAdminMetrics();
      }
    },

    getRegistrations: async (
      status?: string,
      search?: string
    ): Promise<AdminRegistrationItem[]> => {
      try {
        const query = new URLSearchParams();
        if (status) query.set("status", status);
        if (search) query.set("search", search);
        const { data } = await request<any>(
          `/admin/registrations?${query.toString()}`
        );
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        return getAdminRegistrations(status, search);
      } catch {
        return getAdminRegistrations(status, search);
      }
    },

    approveRegistration: async (
      transportId: string,
      adminEmail?: string
    ): Promise<TransportRegistrationRecord> => {
      try {
        const { data } = await request<TransportRegistrationRecord>(
          `/admin/registrations/${transportId}/approve`,
          { method: "POST" }
        );
        return data;
      } catch {
        return adminApproveRegistration(transportId, adminEmail);
      }
    },

    rejectRegistration: async (
      transportId: string,
      reason: string,
      adminEmail?: string
    ): Promise<TransportRegistrationRecord> => {
      try {
        const { data } = await request<TransportRegistrationRecord>(
          `/admin/registrations/${transportId}/reject`,
          {
            method: "POST",
            body: JSON.stringify({ reason }),
          }
        );
        return data;
      } catch {
        return adminRejectRegistration(transportId, reason, adminEmail);
      }
    },

    requestChanges: async (
      transportId: string,
      comment: string,
      adminEmail?: string
    ): Promise<TransportRegistrationRecord> => {
      try {
        const { data } = await request<TransportRegistrationRecord>(
          `/admin/registrations/${transportId}/request-changes`,
          {
            method: "POST",
            body: JSON.stringify({ comment }),
          }
        );
        return data;
      } catch {
        return adminRequestChangesRegistration(transportId, comment, adminEmail);
      }
    },

    getStudents: async (
      search?: string,
      branch?: string
    ): Promise<AdminStudentItem[]> => {
      try {
        const query = new URLSearchParams();
        if (search) query.set("search", search);
        if (branch) query.set("branch", branch);
        const { data } = await request<any>(
          `/admin/students?${query.toString()}`
        );
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        return getAdminStudents(search, branch);
      } catch {
        return getAdminStudents(search, branch);
      }
    },

    deactivatePass: async (
      prn: string,
      reason: string,
      adminEmail?: string
    ): Promise<void> => {
      try {
        await request(`/admin/students/${prn}/deactivate-transport`, {
          method: "POST",
          body: JSON.stringify({ reason }),
        });
      } catch {
        adminDeactivatePass(prn, reason, adminEmail);
      }
    },

    getPayments: async (): Promise<AdminPaymentRecord[]> => {
      try {
        const { data } = await request<any>("/admin/payments");
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        return getAdminPayments();
      } catch {
        return getAdminPayments();
      }
    },

    updatePayment: async (
      paymentId: string,
      paidAmount: number,
      mode?: PaymentMode,
      ref?: string,
      adminEmail?: string
    ): Promise<AdminPaymentRecord> => {
      try {
        const { data } = await request<AdminPaymentRecord>(
          `/admin/payments/${paymentId}`,
          {
            method: "PATCH",
            body: JSON.stringify({ paidAmount, paymentMode: mode, transactionRef: ref }),
          }
        );
        return data;
      } catch {
        return adminUpdatePayment(paymentId, paidAmount, mode, ref, adminEmail);
      }
    },

    getAuditLogs: async (): Promise<AdminAuditLogItem[]> => {
      try {
        const { data } = await request<any>("/admin/audit-logs");
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        return getAdminAuditLogs();
      } catch {
        return getAdminAuditLogs();
      }
    },

    createRoute: async (
      routeData: Omit<TransportRoute, "id" | "pickupPoints">
    ): Promise<TransportRoute> => {
      try {
        const { data } = await request<TransportRoute>("/admin/routes", {
          method: "POST",
          body: JSON.stringify(routeData),
        });
        return data;
      } catch {
        return adminCreateRoute(routeData);
      }
    },

    addPickupPoint: async (
      routeId: string,
      pointData: Omit<TransportRoute["pickupPoints"][0], "id">
    ): Promise<TransportRoute> => {
      try {
        const { data } = await request<TransportRoute>(
          `/admin/routes/${routeId}/pickup-points`,
          {
            method: "POST",
            body: JSON.stringify(pointData),
          }
        );
        return data;
      } catch {
        return adminAddPickupPoint(routeId, pointData);
      }
    },
  },
};
