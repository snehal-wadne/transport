"use client";

import { useState } from "react";
import Header from "@/components/layout/header";
import RegistrationForm from "@/components/registration/registration-form";
import type { StudentProfile, TransportRegistrationRecord, TransportRoute } from "@/lib/types";

// =============================================================================
// Home Page — Student Transportation Registration Portal (Page 1)
//
// ACCESS CONTROL ENFORCEMENT:
// - Authenticated student only views and submits their own transportation details.
// - No endpoints or UI components permit viewing or searching other students.
// - Administrative routes, queues, and comments are strictly omitted.
// - Identity is derived entirely from the server session; frontend studentId is untrusted.
// =============================================================================
export default function HomePage() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [registration, setRegistration] = useState<TransportRegistrationRecord | null>(null);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      {/* ── 1. Portal Header & Student-Only Navigation ─────────────────── */}
      <Header
        student={student}
        registration={registration}
        routes={routes}
        onResetRegistration={() => setRegistration(null)}
      />

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      <main className="flex-1 pb-16">
        <RegistrationForm
          onDataLoaded={(s, r, rts) => {
            setStudent(s);
            setRegistration(r);
            setRoutes(rts);
          }}
          onRegistrationChange={(r) => {
            setRegistration(r);
          }}
        />
      </main>

      {/* ── Institutional Portal Footer ───────────────────────────────── */}
      <footer className="border-t border-[#E2E8F0] bg-white py-6">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#0F172A] tracking-tight">
                City Engineering College • Student Transportation Administration
              </p>
              <p className="text-[11px] text-[#64748B]">
                Transport Office, Room 104, Administrative Block • Helpline: +91 (20) 2560-1200 • transport@college.edu
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
              <span className="inline-block size-2 rounded-full bg-[#16A34A]" />
              <span>Institutional Secure Portal • TLS Encrypted</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
