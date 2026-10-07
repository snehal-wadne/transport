"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Check,
  RotateCcw,
  AlertCircle,
  MapPin,
  Bus,
  CreditCard,
  User,
  GraduationCap,
  Calendar,
  X,
  FileCheck,
  Shield,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api-client";
import type { AdminRegistrationItem, RegistrationStatus } from "@/lib/types";
import { toast } from "sonner";

export default function AdminRegistrationsPage() {
  const searchParams = useSearchParams();
  const initialSelectedId = searchParams.get("selected");

  const [registrations, setRegistrations] = useState<AdminRegistrationItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Review modal state
  const [selectedItem, setSelectedItem] = useState<AdminRegistrationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [actionType, setActionType] = useState<"VIEW" | "REQUEST_CHANGES" | "REJECT">("VIEW");
  const [adminReason, setAdminReason] = useState<string>("");
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.admin.getRegistrations();
      const list = Array.isArray(data) ? data : [];
      setRegistrations(list);

      if (initialSelectedId) {
        const found = list.find((r) => r.id === initialSelectedId);
        if (found) {
          setSelectedItem(found);
          setIsModalOpen(true);
        }
      }
    } catch {
      toast.error("Failed to load registration applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const list = Array.isArray(registrations) ? registrations : [];
    return list.filter((item) => {
      const matchesTab = activeTab === "ALL" || item.status === activeTab;
      const matchesSearch =
        searchTerm.trim() === "" ||
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.studentPrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pickupPointName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [registrations, activeTab, searchTerm]);

  const counts = useMemo(() => {
    const list = Array.isArray(registrations) ? registrations : [];
    return {
      ALL: list.length,
      PENDING: list.filter((r) => r.status === "PENDING").length,
      APPROVED: list.filter((r) => r.status === "APPROVED").length,
      CHANGES_REQUIRED: list.filter((r) => r.status === "CHANGES_REQUIRED").length,
      REJECTED: list.filter((r) => r.status === "REJECTED").length,
    };
  }, [registrations]);

  const handleOpenReview = (item: AdminRegistrationItem) => {
    setSelectedItem(item);
    setActionType("VIEW");
    setAdminReason("");
    setIsModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedItem) return;
    setIsActionLoading(true);
    try {
      await apiClient.admin.approveRegistration(selectedItem.id);
      toast.success(`Transportation Pass approved for ${selectedItem.studentName}`);
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error("Failed to approve application");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedItem) return;
    if (!adminReason.trim()) {
      toast.error("Please enter the specific instructions for the student");
      return;
    }
    setIsActionLoading(true);
    try {
      await apiClient.admin.requestChanges(selectedItem.id, adminReason.trim());
      toast.info(`Changes requested from ${selectedItem.studentName}`);
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error("Failed to request changes");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    if (!adminReason.trim()) {
      toast.error("Please enter the reason for rejection");
      return;
    }
    setIsActionLoading(true);
    try {
      await apiClient.admin.rejectRegistration(selectedItem.id, adminReason.trim());
      toast.error(`Registration declined for ${selectedItem.studentName}`);
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error("Failed to reject application");
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30 text-xs font-semibold">
            <CheckCircle2 className="mr-1 size-3" /> Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30 text-xs font-semibold">
            <Clock className="mr-1 size-3" /> Pending Review
          </Badge>
        );
      case "CHANGES_REQUIRED":
        return (
          <Badge className="bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/30 text-xs font-semibold">
            <AlertTriangle className="mr-1 size-3" /> Changes Required
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30 text-xs font-semibold">
            <XCircle className="mr-1 size-3" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Registration Applications
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Review student transportation passes, verify stop assignments, and authorize campus bus access.
          </p>
        </div>
      </div>

      {/* ── Filter Tabs & Search Bar ──────────────────────────────────────── */}
      <Card className="rounded-2xl border-[#E2E8F0] shadow-xs p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: "All Applications", count: counts.ALL },
              { id: "PENDING", label: "Pending Review", count: counts.PENDING },
              { id: "APPROVED", label: "Approved Passes", count: counts.APPROVED },
              { id: "CHANGES_REQUIRED", label: "Changes Required", count: counts.CHANGES_REQUIRED },
              { id: "REJECTED", label: "Rejected", count: counts.REJECTED },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "bg-[#F8FAFC] text-[#64748B] hover:bg-slate-200/70 hover:text-[#0F172A]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-[#E2E8F0] text-[#0F172A]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#64748B]" />
            <Input
              type="text"
              placeholder="Search student, PRN, or route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs rounded-xl border-[#E2E8F0]"
            />
          </div>
        </div>
      </Card>

      {/* ── Registrations Data Table ─────────────────────────────────────── */}
      <Card className="rounded-2xl border-[#E2E8F0] shadow-xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ClipboardList className="mx-auto size-10 text-[#64748B]" />
            <p className="text-sm font-bold text-[#0F172A]">
              No applications match your filter
            </p>
            <p className="text-xs text-[#64748B]">
              Try choosing another status tab or clearing your search term.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Route & Assigned Bus</TableHead>
                <TableHead>Pickup Stop</TableHead>
                <TableHead>Fee Status</TableHead>
                <TableHead>Pass Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-[#F8FAFC]/80">
                  <TableCell>
                    <div className="font-bold text-xs text-[#0F172A]">
                      {item.studentName}
                    </div>
                    <div className="text-[11px] text-[#64748B] font-mono">
                      {item.studentPrn} • {item.studentBranch} ({item.studentClass})
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-[#0F172A] max-w-[200px] truncate">
                      {item.routeName}
                    </div>
                    <div className="text-[11px] text-[#64748B] font-mono">
                      Bus: {item.vehicleNumber || "Assigned by Fleet"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-[#0F172A] font-medium">
                      {item.pickupPointName}
                    </div>
                    <div className="text-[10px] text-[#64748B]">
                      Transit Type: {item.transportationType.toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.payment?.status === "PAID"
                          ? "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30 text-[10px]"
                          : item.payment?.status === "PARTIALLY_PAID"
                          ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30 text-[10px]"
                          : "bg-slate-100 text-[#64748B] border-[#E2E8F0] text-[10px]"
                      }
                    >
                      {item.payment?.status || "CLAIM PENDING"}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-xs text-[#64748B] font-mono">
                    {new Date(item.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleOpenReview(item)}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs h-8 px-3 rounded-xl cursor-pointer"
                    >
                      <Eye className="mr-1.5 size-3.5" />
                      Review Pass
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* ── Review & Verification Modal ──────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-[#E2E8F0] max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-4">
                  <div>
                    <DialogTitle className="text-lg font-bold text-[#0F172A]">
                      Review Transport Application: {selectedItem.studentName}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[#64748B]">
                      Transportation Pass ID:{" "}
                      <span className="font-mono font-bold text-[#2563EB]">
                        {selectedItem.transportationId || "Pending Issuance"}
                      </span>
                    </DialogDescription>
                  </div>
                  <div>{getStatusBadge(selectedItem.status)}</div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Student Profile Card */}
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#0F172A]">
                    <User className="size-4 text-[#2563EB]" />
                    <span>Student Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[#64748B]">
                    <div>
                      <span className="font-semibold text-[#0F172A]">PRN: </span>
                      <span className="font-mono">{selectedItem.studentPrn}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">Email: </span>
                      <span>{selectedItem.studentEmail}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">Branch: </span>
                      <span>{selectedItem.studentBranch}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">Class / Year: </span>
                      <span>
                        {selectedItem.studentClass} ({selectedItem.academicYear})
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">Mobile: </span>
                      <span>{selectedItem.studentMobile}</span>
                    </div>
                  </div>
                </div>

                {/* Transportation Details Card */}
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#0F172A]">
                    <Bus className="size-4 text-[#2563EB]" />
                    <span>Commuting Route & Stop Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[#64748B]">
                    <div className="col-span-2">
                      <span className="font-semibold text-[#0F172A]">Selected Route: </span>
                      <span>{selectedItem.routeName}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">Pickup Point: </span>
                      <span>{selectedItem.pickupPointName}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">Vehicle / Bus: </span>
                      <span className="font-mono font-bold text-[#0F172A]">
                        {selectedItem.vehicleNumber || "Assigned pool bus"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fee & Payment Card */}
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#0F172A]">
                    <CreditCard className="size-4 text-[#2563EB]" />
                    <span>Fee Deposit Audit</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[#64748B]">
                    <div>
                      <span className="font-semibold text-[#0F172A]">Total Fee: </span>
                      <span>₹{selectedItem.payment?.totalAmount ?? 18000}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">Paid to Date: </span>
                      <span className="font-bold text-[#16A34A]">
                        ₹{selectedItem.payment?.paidAmount ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">Outstanding: </span>
                      <span className="font-bold text-[#DC2626]">
                        ₹{selectedItem.payment?.pendingAmount ?? 18000}
                      </span>
                    </div>
                  </div>
                  {selectedItem.payment?.transactionRef && (
                    <div className="text-[11px] text-[#64748B] pt-1">
                      Transaction Ref:{" "}
                      <span className="font-mono text-[#0F172A]">
                        {selectedItem.payment.transactionRef}
                      </span>{" "}
                      ({selectedItem.payment.paymentMode})
                    </div>
                  )}
                </div>

                {/* Action Mode Controls */}
                {actionType === "REQUEST_CHANGES" && (
                  <div className="space-y-2 rounded-xl border border-[#0284C7]/30 bg-[#0284C7]/10 p-3">
                    <p className="text-xs font-bold text-[#0284C7]">
                      Specify Changes Required for Student:
                    </p>
                    <textarea
                      value={adminReason}
                      onChange={(e) => setAdminReason(e.target.value)}
                      placeholder="e.g. Stop capacity full, please choose Garware Bridge pickup instead..."
                      rows={3}
                      className="w-full text-xs rounded-lg border border-[#E2E8F0] bg-white p-2.5 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActionType("VIEW")}
                        className="text-xs h-8"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleRequestChanges}
                        disabled={isActionLoading}
                        className="bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs h-8"
                      >
                        {isActionLoading ? <Loader2 className="size-3 animate-spin" /> : "Send Change Request"}
                      </Button>
                    </div>
                  </div>
                )}

                {actionType === "REJECT" && (
                  <div className="space-y-2 rounded-xl border border-[#DC2626]/30 bg-[#DC2626]/10 p-3">
                    <p className="text-xs font-bold text-[#DC2626]">
                      Reason for Application Rejection:
                    </p>
                    <textarea
                      value={adminReason}
                      onChange={(e) => setAdminReason(e.target.value)}
                      placeholder="e.g. Unverified payment reference or invalid enrollment details..."
                      rows={3}
                      className="w-full text-xs rounded-lg border border-[#E2E8F0] bg-white p-2.5 focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActionType("VIEW")}
                        className="text-xs h-8"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleReject}
                        disabled={isActionLoading}
                        className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs h-8"
                      >
                        {isActionLoading ? <Loader2 className="size-3 animate-spin" /> : "Confirm Rejection"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              {actionType === "VIEW" && (
                <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0]">
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActionType("REQUEST_CHANGES")}
                      className="text-xs h-9 border-[#0284C7]/30 text-[#0284C7] hover:bg-[#0284C7]/10 rounded-xl cursor-pointer"
                    >
                      <AlertTriangle className="mr-1.5 size-3.5" />
                      Request Changes
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActionType("REJECT")}
                      className="text-xs h-9 border-[#DC2626]/30 text-[#DC2626] hover:bg-[#DC2626]/10 rounded-xl cursor-pointer"
                    >
                      <XCircle className="mr-1.5 size-3.5" />
                      Reject Pass
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsModalOpen(false)}
                      className="text-xs h-9 rounded-xl"
                    >
                      Close
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleApprove}
                      disabled={isActionLoading || selectedItem.status === "APPROVED"}
                      className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs h-9 px-4 rounded-xl shadow-xs cursor-pointer"
                    >
                      {isActionLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Check className="size-4" />
                          {selectedItem.status === "APPROVED" ? "Pass Already Approved" : "Approve & Issue Pass"}
                        </span>
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
