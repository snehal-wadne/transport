"use client";

import Link from "next/link";
import {
  Bus,
  ShieldCheck,
  Clock,
  AlertTriangle,
  XCircle,
  QrCode,
  MapPin,
  ExternalLink,
} from "lucide-react";
import type { StudentProfile, TransportRegistrationRecord, TransportRoute } from "@/lib/types";

interface TransportIdCardProps {
  student: StudentProfile;
  registration: TransportRegistrationRecord;
  route?: TransportRoute | null;
}

export default function TransportIdCard({
  student,
  registration,
  route,
}: TransportIdCardProps) {
  const isApproved = registration.status === "APPROVED";
  const isPending = registration.status === "PENDING";
  const isChangesRequired = registration.status === "CHANGES_REQUIRED";
  const isRejected = registration.status === "REJECTED";
  const isExpired = registration.status === "EXPIRED";

  const pickupPoint = route?.pickupPoints.find(
    (p) => p.id === registration.pickupPointId
  );

  const verificationUrl = `/verify/${registration.id}`;

  return (
    <div
      id="printable-transport-card"
      className="relative mx-auto w-full max-w-[400px] select-none overflow-hidden rounded-2xl border-2 border-[#CBD5E1] bg-white shadow-xl transition-all hover:shadow-2xl print:shadow-none print:border print:max-w-[360px]"
      style={{
        boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
      }}
    >
      {/* ── Top College Header Band ──────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm ring-2 ring-white/20">
              <Bus className="size-5" />
            </div>
            <div>
              <h2 className="text-[12px] font-extrabold uppercase tracking-wider text-white">
                City Engineering College
              </h2>
              <p className="text-[10px] font-semibold tracking-widest text-[#93C5FD]">
                TRANSPORTATION PASS
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="block font-mono text-[10px] font-semibold text-slate-300">
              {student.academicYear}
            </span>
            <span className="text-[9px] font-medium text-slate-400">
              TERM PASS
            </span>
          </div>
        </div>

        {/* Micro-security stripe */}
        <div className="mt-2 flex items-center justify-between border-t border-slate-700/80 pt-1 text-[8px] font-mono tracking-wider text-slate-400">
          <span>• OFFICIAL STUDENT COMMUTER PASS •</span>
          <span>NON-TRANSFERABLE</span>
        </div>
      </div>

      {/* ── Status Accent Bar ────────────────────────────────────────────── */}
      <div
        className={`h-1.5 w-full ${
          isApproved
            ? "bg-[#16A34A]"
            : isPending
            ? "bg-[#F59E0B]"
            : isChangesRequired
            ? "bg-[#0284C7]"
            : isExpired
            ? "bg-[#64748B]"
            : "bg-[#DC2626]"
        }`}
      />

      {/* ── Card Main Content Area ───────────────────────────────────────── */}
      <div className="p-4 sm:p-5 space-y-4 bg-gradient-to-b from-white via-[#F8FAFC]/50 to-white">
        {/* Student Photo & Identity Grid */}
        <div className="flex gap-4 items-start">
          {/* Student Photo Frame */}
          <div className="relative shrink-0">
            <div className="flex size-20 sm:size-22 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB]/15 via-[#2563EB]/5 to-slate-100 border-2 border-[#E2E8F0] shadow-xs text-[#2563EB] overflow-hidden">
              {student.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={student.avatarUrl}
                  alt={student.fullName}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-[#2563EB]">
                    {student.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </span>
                  <span className="text-[9px] font-semibold text-[#64748B] mt-0.5">
                    PHOTO
                  </span>
                </div>
              )}
            </div>
            {/* Hologram-style verified emblem */}
            <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-xs ring-2 ring-white">
              <ShieldCheck className="size-3.5" />
            </div>
          </div>

          {/* Student Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A] leading-tight truncate">
              {student.fullName}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span className="font-semibold text-[#0F172A]">Student ID:</span>
              <code className="rounded bg-[#EFF6FF] px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#2563EB] border border-[#BFDBFE]">
                {student.studentId}
              </code>
            </div>

            <p className="text-xs font-semibold text-[#0F172A] truncate">
              {student.branch}
            </p>

            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-[#0F172A] border border-[#E2E8F0]">
                {student.className}
              </span>
              <span className="text-[11px] text-[#64748B]">
                AY {student.academicYear}
              </span>
            </div>
          </div>
        </div>

        {/* ── Commuting Route Details ─────────────────────────────────────── */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-3 space-y-2 text-xs shadow-xs">
          <div className="flex items-start justify-between gap-2 border-b border-[#F1F5F9] pb-1.5">
            <span className="text-[#64748B] font-medium flex items-center gap-1 shrink-0">
              <MapPin className="size-3 text-[#2563EB]" /> Route:
            </span>
            <span className="font-bold text-[#0F172A] text-right truncate">
              {route?.name || registration.routeId}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2 border-b border-[#F1F5F9] pb-1.5">
            <span className="text-[#64748B] font-medium flex items-center gap-1 shrink-0">
              <Clock className="size-3 text-[#2563EB]" /> Pickup:
            </span>
            <span className="font-semibold text-[#0F172A] text-right">
              {pickupPoint ? (
                <>
                  {pickupPoint.name}{" "}
                  {pickupPoint.estimatedTime ? (
                    <span className="font-mono text-[11px] text-[#2563EB]">
                      ({pickupPoint.estimatedTime})
                    </span>
                  ) : null}
                </>
              ) : (
                registration.pickupPointId
              )}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-[#64748B] font-medium">Transportation ID:</span>
            <code className="font-mono text-xs sm:text-sm font-extrabold text-[#2563EB] tracking-wider">
              {registration.id}
            </code>
          </div>
        </div>

        {/* ── Status Banner (STRICT COMPLIANCE) ─────────────────────────── */}
        <div className="flex items-center justify-between rounded-xl border p-2.5">
          <span className="text-xs font-semibold text-[#64748B]">Status:</span>

          {isApproved ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-[#16A34A]/15 border border-[#16A34A]/30 px-3 py-1 text-xs font-extrabold text-[#16A34A]">
              <ShieldCheck className="size-4" />
              <span>ACTIVE</span>
            </div>
          ) : isPending ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 px-2.5 py-1 text-[11px] font-bold text-[#B45309]">
              <Clock className="size-3.5" />
              <span>PENDING ADMIN VERIFICATION</span>
            </div>
          ) : isChangesRequired ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-[#0284C7]/15 border border-[#0284C7]/30 px-2.5 py-1 text-[11px] font-bold text-[#0284C7]">
              <AlertTriangle className="size-3.5" />
              <span>CHANGES REQUIRED</span>
            </div>
          ) : isExpired ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-[#64748B]/15 border border-[#64748B]/30 px-2.5 py-1 text-[11px] font-bold text-[#64748B]">
              <Clock className="size-3.5" />
              <span>EXPIRED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg bg-[#DC2626]/15 border border-[#DC2626]/30 px-2.5 py-1 text-[11px] font-bold text-[#DC2626]">
              <XCircle className="size-3.5" />
              <span>NOT APPROVED</span>
            </div>
          )}
        </div>

        {/* ── QR Code Verification Block ─────────────────────────────────── */}
        <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-[#0F172A] flex items-center gap-1">
              <QrCode className="size-3.5 text-[#2563EB]" />
              Digital Verification Code
            </p>
            <p className="text-[10px] text-[#64748B] max-w-[200px] leading-tight">
              Scan to inspect official credentials on college security portal.
            </p>
            <Link
              href={verificationUrl}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2563EB] hover:underline pt-0.5"
            >
              <span>Test Public URL: {verificationUrl}</span>
              <ExternalLink className="size-2.5" />
            </Link>
          </div>

          {/* SVG QR Code */}
          <Link
            href={verificationUrl}
            title="Scan or click to verify"
            className="group relative flex size-18 sm:size-20 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 border border-[#CBD5E1] shadow-xs hover:border-[#2563EB] transition-colors"
          >
            <svg
              viewBox="0 0 100 100"
              className="size-full text-[#0F172A]"
              fill="currentColor"
            >
              {/* Simulated high-fidelity scannable QR Code Matrix */}
              {/* Top-left position marker */}
              <rect x="5" y="5" width="28" height="28" rx="4" fill="#0F172A" />
              <rect x="11" y="11" width="16" height="16" rx="2" fill="white" />
              <rect x="15" y="15" width="8" height="8" rx="1" fill="#2563EB" />

              {/* Top-right position marker */}
              <rect x="67" y="5" width="28" height="28" rx="4" fill="#0F172A" />
              <rect x="73" y="11" width="16" height="16" rx="2" fill="white" />
              <rect x="77" y="15" width="8" height="8" rx="1" fill="#2563EB" />

              {/* Bottom-left position marker */}
              <rect x="5" y="67" width="28" height="28" rx="4" fill="#0F172A" />
              <rect x="11" y="73" width="16" height="16" rx="2" fill="white" />
              <rect x="15" y="77" width="8" height="8" rx="1" fill="#2563EB" />

              {/* Data modules */}
              <rect x="38" y="10" width="6" height="6" fill="#0F172A" />
              <rect x="48" y="10" width="6" height="6" fill="#0F172A" />
              <rect x="56" y="18" width="6" height="6" fill="#0F172A" />
              <rect x="38" y="24" width="6" height="6" fill="#0F172A" />
              <rect x="46" y="32" width="6" height="6" fill="#0F172A" />

              <rect x="10" y="38" width="6" height="6" fill="#0F172A" />
              <rect x="20" y="44" width="6" height="6" fill="#0F172A" />
              <rect x="32" y="40" width="6" height="6" fill="#0F172A" />
              <rect x="42" y="46" width="6" height="6" fill="#0F172A" />
              <rect x="52" y="40" width="6" height="6" fill="#0F172A" />
              <rect x="62" y="46" width="6" height="6" fill="#0F172A" />
              <rect x="74" y="38" width="6" height="6" fill="#0F172A" />
              <rect x="84" y="44" width="6" height="6" fill="#0F172A" />

              <rect x="14" y="54" width="6" height="6" fill="#0F172A" />
              <rect x="28" y="52" width="6" height="6" fill="#0F172A" />
              <rect x="40" y="58" width="6" height="6" fill="#0F172A" />
              <rect x="50" y="52" width="6" height="6" fill="#0F172A" />
              <rect x="60" y="58" width="6" height="6" fill="#0F172A" />
              <rect x="76" y="52" width="6" height="6" fill="#0F172A" />

              <rect x="38" y="68" width="6" height="6" fill="#0F172A" />
              <rect x="48" y="74" width="6" height="6" fill="#0F172A" />
              <rect x="58" y="68" width="6" height="6" fill="#0F172A" />
              <rect x="70" y="76" width="6" height="6" fill="#0F172A" />
              <rect x="82" y="70" width="6" height="6" fill="#0F172A" />
              <rect x="44" y="84" width="6" height="6" fill="#0F172A" />
              <rect x="56" y="84" width="6" height="6" fill="#0F172A" />
              <rect x="68" y="86" width="6" height="6" fill="#0F172A" />
              <rect x="80" y="84" width="6" height="6" fill="#0F172A" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ── Bottom Security Micro-Footer ──────────────────────────────────── */}
      <div className="bg-slate-100 border-t border-[#E2E8F0] px-4 py-2 flex items-center justify-between text-[9px] text-[#64748B]">
        <span>Pass ID: {registration.id}</span>
        <span className="font-medium text-[#0F172A]">Official College Pass</span>
        <span>Valid AY {student.academicYear}</span>
      </div>
    </div>
  );
}
