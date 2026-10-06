"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bus,
  ShieldCheck,
  QrCode,
  Download,
  AlertTriangle,
  User,
  GraduationCap,
  MapPin,
  Clock,
} from "lucide-react";
import type { StudentProfile, TransportRegistrationRecord, TransportRoute } from "@/lib/types";

interface IdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile | null;
  registration: TransportRegistrationRecord | null;
  route: TransportRoute | null;
}

export default function IdCardModal({
  isOpen,
  onClose,
  student,
  registration,
  route,
}: IdCardModalProps) {
  if (!student) return null;

  const pickupPoint = route?.pickupPoints.find(
    (p) => p.id === registration?.pickupPointId
  );

  const isPending = !registration || registration.status === "PENDING";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-[#E2E8F0] rounded-2xl bg-white shadow-2xl">
        <DialogHeader className="p-6 pb-2 text-left">
          <DialogTitle className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Bus className="size-5 text-[#2563EB]" />
            Student Transportation ID Pass
          </DialogTitle>
          <DialogDescription className="text-sm text-[#64748B]">
            Official digital transportation credentials for authenticated student.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-2">
          {/* Virtual ID Card */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-[#2563EB]/20 bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF] p-5 shadow-md">
            {/* Top decorative stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0284C7]" />

            {/* Card Header */}
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
                  <Bus className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    City Engineering College
                  </h4>
                  <p className="text-[11px] font-semibold text-[#2563EB]">
                    Transportation Authority Pass 2024–25
                  </p>
                </div>
              </div>

              <Badge
                className={`text-[10px] px-2 py-0.5 font-semibold ${
                  isPending
                    ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
                    : "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30"
                }`}
              >
                {isPending ? "STATUS: PENDING" : "STATUS: ACTIVE"}
              </Badge>
            </div>

            {/* Student Profile Info */}
            <div className="flex gap-4 items-center mb-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB]/10 border-2 border-[#2563EB]/20 text-[#2563EB] text-xl font-bold">
                {student.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>

              <div className="space-y-1 min-w-0">
                <h3 className="font-bold text-base text-[#0F172A] truncate">
                  {student.fullName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <span className="font-medium text-[#0F172A]">PRN:</span>
                  <code className="bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0] font-mono text-[#2563EB]">
                    {student.studentId}
                  </code>
                </div>
                <p className="text-xs text-[#64748B] truncate">
                  {student.branch} • {student.className}
                </p>
              </div>
            </div>

            {/* Transport Pass Route Information */}
            <div className="space-y-2 rounded-xl bg-white/90 p-3.5 border border-[#E2E8F0] text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[#64748B] font-medium flex items-center gap-1">
                  <MapPin className="size-3.5 text-[#2563EB]" /> Route:
                </span>
                <span className="font-semibold text-[#0F172A] text-right truncate max-w-[240px]">
                  {route?.name || "Route not yet assigned"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#64748B] font-medium flex items-center gap-1">
                  <Clock className="size-3.5 text-[#2563EB]" /> Pickup Point:
                </span>
                <span className="font-medium text-[#0F172A] text-right">
                  {pickupPoint ? `${pickupPoint.name} (${pickupPoint.estimatedTime})` : "Pending Registration"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#64748B] font-medium flex items-center gap-1">
                  <Bus className="size-3.5 text-[#2563EB]" /> Bus / Vehicle:
                </span>
                <span className="font-mono text-[#0F172A]">
                  {registration?.vehicleNumber || route?.busNumber || "TBD"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E2E8F0]">
                <span className="text-[#64748B] font-medium">Pass ID:</span>
                <span className="font-mono text-[#2563EB] font-semibold">
                  {registration?.id || "UNASSIGNED"}
                </span>
              </div>
            </div>

            {/* QR / Security Notice */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#E2E8F0]/80">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-white border border-[#E2E8F0]">
                  <QrCode className="size-8 text-[#0F172A]" />
                </div>
                <div className="text-[10px] text-[#64748B] leading-tight">
                  <p className="font-medium text-[#0F172A]">Cryptographic Student Token</p>
                  <p>Non-transferable • Student PRN Bound</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-[#16A34A] font-medium">
                <ShieldCheck className="size-4" />
                <span>Verified Auth</span>
              </div>
            </div>
          </div>

          {/* Pending Warning */}
          {isPending && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-[#F59E0B]/10 p-3 border border-[#F59E0B]/20">
              <AlertTriangle className="size-4 text-[#F59E0B] shrink-0 mt-0.5" />
              <p className="text-xs text-[#0F172A]/80 leading-relaxed">
                <strong className="text-[#0F172A]">Pass Pending Approval:</strong> This digital pass will become valid for boarding once the Transportation Office approves your registration and verifies payment.
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-[#64748B]">
            Only visible to authenticated student.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-[#E2E8F0] rounded-xl text-xs h-9"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => alert("Digital pass download initiated.")}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs h-9 flex items-center gap-1.5"
            >
              <Download className="size-3.5" />
              Save Pass
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
