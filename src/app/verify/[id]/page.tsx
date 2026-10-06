import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Bus,
  MapPin,
  Clock,
  ArrowLeft,
  Calendar,
  Building,
} from "lucide-react";
import { getPublicVerification } from "@/lib/data";

interface VerifyPageProps {
  params: Promise<{ id: string }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = await params;
  const verification = getPublicVerification(id);

  if (!verification) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-md space-y-5">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#DC2626]/10 text-[#DC2626]">
            <XCircle className="size-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-[#0F172A]">Invalid Transport Pass</h1>
            <p className="text-xs text-[#64748B]">
              The transportation identifier <code className="font-mono text-[#DC2626] font-semibold">{id}</code> could not be verified in the institutional database.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Return to Transportation Portal
          </Link>
        </div>
      </div>
    );
  }

  const isActive = verification.status === "ACTIVE";
  const isPending = verification.status === "PENDING_VERIFICATION";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-[#E2E8F0] bg-white py-4 px-6">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#2563EB] text-white">
              <Bus className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">City Engineering College</h2>
              <p className="text-[11px] text-[#64748B]">Official Pass Verification Gateway</p>
            </div>
          </div>
          <span className="rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 px-2.5 py-1 text-[10px] font-bold text-[#16A34A] flex items-center gap-1">
            <ShieldCheck className="size-3" /> Official Gateway
          </span>
        </div>
      </header>

      {/* Main Verification Card */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white shadow-xl overflow-hidden">
          {/* Top colored status strip */}
          <div
            className={`h-2 ${
              isActive
                ? "bg-[#16A34A]"
                : isPending
                ? "bg-[#F59E0B]"
                : "bg-[#DC2626]"
            }`}
          />

          <div className="p-6 sm:p-8 space-y-6">
            {/* Status Header */}
            <div className="text-center space-y-3">
              <div
                className={`mx-auto flex size-16 items-center justify-center rounded-2xl ${
                  isActive
                    ? "bg-[#16A34A]/10 text-[#16A34A]"
                    : isPending
                    ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                    : "bg-[#DC2626]/10 text-[#DC2626]"
                }`}
              >
                {isActive ? (
                  <ShieldCheck className="size-8" />
                ) : (
                  <AlertTriangle className="size-8" />
                )}
              </div>

              <div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                    isActive
                      ? "bg-[#16A34A]/15 text-[#16A34A] border border-[#16A34A]/30"
                      : isPending
                      ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30"
                      : "bg-[#DC2626]/15 text-[#DC2626] border border-[#DC2626]/30"
                  }`}
                >
                  {isActive
                    ? "STATUS: VALID / ACTIVE PASS"
                    : isPending
                    ? "STATUS: PENDING ADMIN VERIFICATION"
                    : "STATUS: INACTIVE / EXPIRED"}
                </span>
                <h1 className="mt-2 text-xl font-bold text-[#0F172A]">
                  Transportation Pass Verification
                </h1>
                <p className="text-xs text-[#64748B]">
                  Academic Year {verification.academicYear}
                </p>
              </div>
            </div>

            {/* Verification Detail Attributes */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs space-y-3">
              <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                <span className="text-[#64748B] flex items-center gap-1.5 font-medium">
                  <Bus className="size-3.5 text-[#2563EB]" /> Pass ID:
                </span>
                <code className="font-mono font-bold text-sm text-[#2563EB]">
                  {verification.transportationId}
                </code>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                <span className="text-[#64748B] font-medium">Authorized Holder:</span>
                <span className="font-semibold text-[#0F172A]">{verification.studentName}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                <span className="text-[#64748B] flex items-center gap-1.5 font-medium">
                  <MapPin className="size-3.5 text-[#2563EB]" /> Authorized Route:
                </span>
                <span className="font-semibold text-[#0F172A] text-right truncate max-w-[200px]">
                  {verification.routeName}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                <span className="text-[#64748B] font-medium">Boarding Stop:</span>
                <span className="font-medium text-[#0F172A] text-right">
                  {verification.pickupPointName}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[#64748B] flex items-center gap-1.5 font-medium">
                  <Clock className="size-3.5 text-[#2563EB]" /> Verified At:
                </span>
                <span className="text-[11px] text-[#64748B] font-mono">
                  {new Date(verification.verifiedAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Privacy Protection Statement */}
            <div className="rounded-xl border border-[#0284C7]/20 bg-[#0284C7]/5 p-3.5 text-[11px] text-[#64748B] space-y-1">
              <p className="font-semibold text-[#0284C7]">Privacy Protection Safeguard</p>
              <p className="leading-relaxed">
                This verification gateway presents only essential pass validity data. Personal phone numbers, residential addresses, and payment details remain confidential and are not exposed.
              </p>
            </div>

            {/* Back link */}
            <div className="text-center pt-2">
              <Link
                href="/id-card"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline"
              >
                <ArrowLeft className="size-3.5" /> Back to My Transportation ID
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-4 text-center text-xs text-[#64748B]">
        City Engineering College • Student Transportation Security Verification System
      </footer>
    </div>
  );
}
