"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bus,
  Shield,
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, DEMO_PROFILES } from "@/lib/auth-context";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAs } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      toast.success("Authentication successful!");
      if (email.toLowerCase().includes("admin")) {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } else {
      setErrorMessage(res.error || "Invalid institutional credentials.");
    }
  };

  const handleQuickLogin = (role: "STUDENT" | "ADMIN", prn?: string) => {
    loginAs(role, prn);
    if (role === "ADMIN") {
      toast.success("Signed in as Administrator: Transport Control");
      router.push("/admin/dashboard");
    } else {
      const studentName =
        prn === "PRN2024002"
          ? "Aarav Sharma"
          : prn === "PRN2024003"
          ? "Pooja Deshmukh"
          : "Harshal Patil";
      toast.success(`Signed in as Student: ${studentName}`);
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      {/* ── Top Header ──────────────────────────────────────────────────── */}
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25">
              <Bus className="size-5" />
            </div>
            <div>
              <span className="text-base font-bold text-[#0F172A] tracking-tight">
                City Engineering College
              </span>
              <p className="text-xs text-[#64748B]">Transportation Services Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#16A34A] bg-[#16A34A]/10 px-3 py-1 rounded-full">
            <span className="size-2 rounded-full bg-[#16A34A] animate-pulse" />
            Secure TLS 1.3 Gate
          </div>
        </div>
      </header>

      {/* ── Center Login Area ───────────────────────────────────────────── */}
      <main className="flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-[960px] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* ── Left Col: Portal Identity & Quick Demo Access ──────────────── */}
          <div className="md:col-span-5 space-y-6">
            <div className="space-y-2">
              <Badge className="bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20 text-xs font-semibold py-1 px-3">
                Institutional Single Sign-On
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
                Unified College Transport Management
              </h1>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Secure access gateway for students applying for bus passes and transportation administrators managing routes, verification, and payments.
              </p>
            </div>

            {/* Quick Demo Credentials Panel */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[#2563EB]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  Quick Demo Evaluation Logins
                </h3>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Click any profile below to instantly simulate the verified server identity and experience each portal:
              </p>

              <div className="space-y-2 pt-1">
                {/* Admin Quick Login */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("ADMIN")}
                  className="w-full flex items-center justify-between rounded-xl border border-[#0F172A]/15 bg-[#0F172A] px-3.5 py-2.5 text-left text-xs font-semibold text-white transition-all hover:bg-[#1E293B] hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="size-4 text-[#38BDF8]" />
                    <div>
                      <p className="font-bold">Transportation Administrator</p>
                      <p className="text-[10px] text-slate-300 font-mono">admin@college.local • Full Admin Access</p>
                    </div>
                  </div>
                  <ArrowRight className="size-3.5 text-slate-300" />
                </button>

                {/* Student 1 Quick Login */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("STUDENT", "PRN2024001")}
                  className="w-full flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-left text-xs font-semibold text-[#0F172A] transition-all hover:bg-[#2563EB]/10 hover:border-[#2563EB]/30 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="size-4 text-[#2563EB]" />
                    <div>
                      <p className="font-bold">Harshal Patil (PRN2024001)</p>
                      <p className="text-[10px] text-[#64748B]">TE Computer • Pass: APPROVED</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-[#16A34A]/30 bg-[#16A34A]/10 text-[#16A34A] text-[10px]">
                    Active Pass
                  </Badge>
                </button>

                {/* Student 2 Quick Login */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("STUDENT", "PRN2024002")}
                  className="w-full flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-left text-xs font-semibold text-[#0F172A] transition-all hover:bg-[#2563EB]/10 hover:border-[#2563EB]/30 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="size-4 text-[#F59E0B]" />
                    <div>
                      <p className="font-bold">Aarav Sharma (PRN2024002)</p>
                      <p className="text-[10px] text-[#64748B]">BE Mechanical • Pass: PENDING</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B] text-[10px]">
                    In Review
                  </Badge>
                </button>

                {/* Student 3 Quick Login */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("STUDENT", "PRN2024003")}
                  className="w-full flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-left text-xs font-semibold text-[#0F172A] transition-all hover:bg-[#2563EB]/10 hover:border-[#2563EB]/30 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="size-4 text-[#0284C7]" />
                    <div>
                      <p className="font-bold">Pooja Deshmukh (PRN2024003)</p>
                      <p className="text-[10px] text-[#64748B]">SE IT • CHANGES REQUIRED</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-[#0284C7]/30 bg-[#0284C7]/10 text-[#0284C7] text-[10px]">
                    Action Needed
                  </Badge>
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Col: Formal Credential Login Form ─────────────────────── */}
          <div className="md:col-span-7">
            <Card className="rounded-2xl border-[#E2E8F0] shadow-sm">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-xl font-bold text-[#0F172A]">
                  Sign In to Your Account
                </CardTitle>
                <CardDescription className="text-xs text-[#64748B]">
                  Enter your registered institutional email and password to proceed.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-5">
                {errorMessage && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/10 p-3 text-xs text-[#DC2626]">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#0F172A]">
                      College Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#64748B]" />
                      <Input
                        type="email"
                        placeholder="e.g. admin@college.local or student1@college.local"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 text-xs rounded-xl border-[#E2E8F0] focus-visible:ring-[#2563EB]"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-[#64748B]">
                      Students use roll email; Transport staff use administrative email.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-[#0F172A]">
                        Account Password
                      </Label>
                      <span className="text-[11px] text-[#2563EB] hover:underline cursor-pointer">
                        Forgot credentials?
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#64748B]" />
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 text-xs rounded-xl border-[#E2E8F0] focus-visible:ring-[#2563EB]"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl h-10 shadow-sm cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Authenticating Identity...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Sign In Securely
                        <ArrowRight className="size-4" />
                      </span>
                    )}
                  </Button>
                </form>

                {/* Security and Access Isolation Note */}
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-[11px] text-[#64748B] space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                    <CheckCircle2 className="size-3.5 text-[#16A34A]" />
                    Role-Based Access Enforcement
                  </div>
                  <p>
                    Sessions are cryptographically verified. Students can strictly view and edit only their own transportation pass. Admins have access to the complete review queue and routes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
