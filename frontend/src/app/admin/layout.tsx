"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, ShieldCheck, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import AdminHeader from "@/components/admin/admin-header";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, role, isLoading, loginAs } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-[#2563EB]" />
          <p className="text-xs font-semibold text-[#64748B]">
            Verifying administrative clearance...
          </p>
        </div>
      </div>
    );
  }

  // ── STRICT SECURITY GUARD: If not ADMIN, display 403 Forbidden ─────
  if (role !== "ADMIN") {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        {/* Simple Top Banner */}
        <div className="border-b border-[#E2E8F0] bg-white px-6 py-4">
          <div className="mx-auto max-w-[1200px] flex items-center justify-between">
            <span className="text-sm font-bold text-[#0F172A]">
              City Engineering College • Security Perimeter
            </span>
            <Link
              href="/"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="size-3.5" /> Return to Student Portal
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="max-w-md w-full border-[#DC2626]/30 shadow-md">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#DC2626]/10 text-[#DC2626] mb-2">
                <ShieldAlert className="size-7" />
              </div>
              <CardTitle className="text-xl font-bold text-[#0F172A]">
                403 Forbidden — Administrative Access Required
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B]">
                Student accounts are strictly isolated and prohibited from accessing administrative tools, other students' registration records, and system queues.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#64748B] space-y-1">
                <p className="font-semibold text-[#0F172A]">Current Identity:</p>
                <p className="font-mono text-[11px] text-[#2563EB]">
                  {user?.fullName || "Student"} ({user?.email || "student@college.local"})
                </p>
                <p className="text-[11px] text-[#DC2626] font-medium">
                  Role: STUDENT (Restricted from Admin Portal)
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => {
                    loginAs("ADMIN");
                  }}
                  className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl h-10 cursor-pointer"
                >
                  <ShieldCheck className="mr-2 size-4 text-[#38BDF8]" />
                  Authenticate as Transportation Administrator
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="w-full text-xs font-semibold rounded-xl h-10 border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <ArrowLeft className="mr-2 size-4" />
                  Return to Student Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Authorized Admin View ──────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <AdminHeader />
      <main className="flex-1 pb-16">{children}</main>

      <footer className="border-t border-[#E2E8F0] bg-white py-6">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#0F172A]">
                City Engineering College • Transportation Administrative Directorate
              </p>
              <p className="text-[11px] text-[#64748B]">
                Central Bus Dispatch & Fare Audit Operations • Admin Console v2.4 (Enterprise)
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
              <span className="inline-block size-2 rounded-full bg-[#16A34A]" />
              <span>RBAC Policy: Strict Least Privilege • Audited</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
