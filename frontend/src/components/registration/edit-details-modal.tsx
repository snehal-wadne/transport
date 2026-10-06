"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Mail,
  Building2,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { StudentProfile } from "@/lib/types";

interface EditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile | null;
}

export default function EditDetailsModal({
  isOpen,
  onClose,
  student,
}: EditDetailsModalProps) {
  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] border-[#E2E8F0] rounded-2xl bg-white p-6 shadow-2xl">
        <DialogHeader className="text-left space-y-1.5">
          <DialogTitle className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Lock className="size-5 text-[#2563EB]" />
            Student Identity Protection Policy
          </DialogTitle>
          <DialogDescription className="text-sm text-[#64748B]">
            Governance on modifying student profile & transportation records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Protected Fields Notice */}
          <div className="rounded-xl border border-[#0284C7]/20 bg-[#0284C7]/5 p-4 text-xs text-[#0F172A] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#0284C7]">
              <AlertCircle className="size-4 shrink-0" />
              <span>Identity & Enrollment Fields Are Locked</span>
            </div>
            <p className="text-[#64748B] leading-relaxed">
              To prevent unauthorized changes and maintain institutional compliance, core student credentials (<strong className="text-[#0F172A]">Full Name, PRN ({student.studentId}), College Email, Branch, Class</strong>) are verified directly from the Registrar ERP and cannot be modified via this student self-service portal.
            </p>
          </div>

          {/* Current Profile Summary */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs space-y-2.5">
            <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Student Full Name:</span>
              <span className="font-semibold text-[#0F172A]">{student.fullName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Permanent Reg. No (PRN):</span>
              <code className="font-mono text-[#2563EB] font-semibold">{student.studentId}</code>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Department / Branch:</span>
              <span className="font-medium text-[#0F172A]">{student.branch}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Academic Class:</span>
              <span className="font-medium text-[#0F172A]">{student.className} ({student.academicYear})</span>
            </div>
          </div>

          {/* How to request changes */}
          <div className="rounded-xl border border-[#E2E8F0] p-4 text-xs space-y-2">
            <h5 className="font-semibold text-[#0F172A] flex items-center gap-1.5">
              <Building2 className="size-4 text-[#2563EB]" />
              Need to correct your contact or residential details?
            </h5>
            <p className="text-[#64748B] leading-relaxed">
              Submit a formal correction request along with your college identity card to the Transportation Administrative Office:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-[#64748B]">
                <Mail className="size-3.5 text-[#2563EB]" />
                <span>transport@college.edu</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#64748B]">
                <Phone className="size-3.5 text-[#2563EB]" />
                <span>Ext. 240 / Room 104</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
          <Button
            onClick={onClose}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs h-9 px-4"
          >
            Understood
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
