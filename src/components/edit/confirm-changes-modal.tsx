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
  AlertTriangle,
  ArrowRight,
  Bus,
  MapPin,
  Clock,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import type { TransportRoute, TransportationType } from "@/lib/types";

export interface ChangeDiffItem {
  field: string;
  label: string;
  oldValue: string;
  newValue: string;
  icon?: React.ReactNode;
}

interface ConfirmChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  diffItems: ChangeDiffItem[];
  currentStatus: string;
}

export default function ConfirmChangesModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  diffItems,
  currentStatus,
}: ConfirmChangesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-[#E2E8F0] rounded-2xl bg-white shadow-2xl">
        {/* Top warning stripe */}
        <div className="h-1.5 bg-gradient-to-r from-[#F59E0B] via-[#2563EB] to-[#F59E0B]" />

        <DialogHeader className="p-6 pb-2 text-left space-y-1.5">
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <AlertTriangle className="size-5 text-[#F59E0B]" />
            Submit these changes for admin verification?
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-[#64748B]">
            Review your commuting adjustments before submitting them to the transportation administration.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-2 space-y-4">
          {/* Institutional Workflow Notice */}
          <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-3.5 text-xs text-[#0F172A] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#B45309]">
              <ShieldAlert className="size-4 shrink-0" />
              <span>Administrative Re-Verification Workflow</span>
            </div>
            <p className="text-[#0F172A]/80 leading-relaxed text-[11px] sm:text-xs">
              Submitting these changes will automatically transition your transportation pass status from{" "}
              <strong className="text-[#0F172A] uppercase">{currentStatus}</strong> to{" "}
              <strong className="text-[#B45309] uppercase">PENDING ADMIN VERIFICATION</strong>. You cannot immediately self-approve these changes; the transport desk will review bus seat availability.
            </p>
          </div>

          {/* Change Summary Diff Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Changes to be submitted ({diffItems.length} field{diffItems.length > 1 ? "s" : ""}):
            </h4>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] divide-y divide-[#E2E8F0] overflow-hidden text-xs">
              {diffItems.map((item, idx) => (
                <div key={idx} className="p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                    {item.icon}
                    <span>{item.label}:</span>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pl-5">
                    {/* Old value */}
                    <div className="rounded-lg bg-white border border-[#E2E8F0] p-2 text-[#64748B] line-through text-[11px] truncate">
                      {item.oldValue}
                    </div>

                    <ArrowRight className="size-3.5 text-[#2563EB] shrink-0" />

                    {/* New value */}
                    <div className="rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] p-2 font-semibold text-[#1E40AF] text-[11px] truncate">
                      {item.newValue}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-6 py-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
            className="w-full sm:w-auto border-[#E2E8F0] hover:bg-white text-xs h-10 px-5 rounded-xl font-medium"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs h-10 px-6 font-bold flex items-center justify-center gap-2 shadow-md shadow-[#2563EB]/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting for Verification...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Submit Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
