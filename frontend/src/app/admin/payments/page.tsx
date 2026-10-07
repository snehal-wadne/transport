"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  IndianRupee,
  Receipt,
  Eye,
  Edit,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { apiClient } from "@/lib/api-client";
import type { AdminPaymentRecord, PaymentMode } from "@/lib/types";
import { toast } from "sonner";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Update payment modal
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentRecord | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [inputPaidAmount, setInputPaidAmount] = useState<number>(0);
  const [inputMode, setInputMode] = useState<PaymentMode>("UPI");
  const [inputRef, setInputRef] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.admin.getPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load fee payments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPayments = useMemo(() => {
    const list = Array.isArray(payments) ? payments : [];
    return list.filter((p) => {
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchesSearch =
        searchTerm.trim() === "" ||
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.studentPrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.transactionRef && p.transactionRef.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [payments, statusFilter, searchTerm]);

  const summary = useMemo(() => {
    const list = Array.isArray(payments) ? payments : [];
    const totalExpected = list.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalCollected = list.reduce((sum, p) => sum + p.paidAmount, 0);
    const totalPending = list.reduce((sum, p) => sum + p.pendingAmount, 0);
    return { totalExpected, totalCollected, totalPending };
  }, [payments]);

  const handleOpenUpdate = (payment: AdminPaymentRecord) => {
    setSelectedPayment(payment);
    setInputPaidAmount(payment.paidAmount);
    setInputMode(payment.paymentMode || "UPI");
    setInputRef(payment.transactionRef || "");
    setIsUpdateOpen(true);
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    if (inputPaidAmount < 0 || inputPaidAmount > selectedPayment.totalAmount) {
      toast.error(`Paid amount must be between 0 and ₹${selectedPayment.totalAmount}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.admin.updatePayment(
        selectedPayment.id,
        inputPaidAmount,
        inputMode,
        inputRef.trim() || undefined
      );

      toast.success(`Fee record updated for ${selectedPayment.studentName}`);
      setIsUpdateOpen(false);
      loadData();
    } catch {
      toast.error("Failed to update payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: "PAID" | "PARTIALLY_PAID" | "PENDING") => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30 text-xs font-semibold">
            <CheckCircle2 className="mr-1 size-3" /> Fully Paid
          </Badge>
        );
      case "PARTIALLY_PAID":
        return (
          <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30 text-xs font-semibold">
            <Clock className="mr-1 size-3" /> Partially Paid
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30 text-xs font-semibold">
            <AlertCircle className="mr-1 size-3" /> Due Pending
          </Badge>
        );
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Transportation Fee Audit
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Track annual student transit fee deposits, reconcile college cashier challans, and update dues.
          </p>
        </div>
      </div>

      {/* ── Financial Summary KPI Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-[#E2E8F0] shadow-xs">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Total Annual Expectation
            </span>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-black text-[#0F172A]">
              ₹{summary.totalExpected.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Standard ₹18,000 / seat / academic year
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E2E8F0] shadow-xs">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">
              Total Collected to Date
            </span>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-black text-[#16A34A]">
              ₹{summary.totalCollected.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              {summary.totalExpected > 0
                ? Math.round((summary.totalCollected / summary.totalExpected) * 100)
                : 0}
              % realized in college transport account
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E2E8F0] shadow-xs">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
              Outstanding Dues
            </span>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-black text-[#DC2626]">
              ₹{summary.totalPending.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Pending student semester fee installments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Search & Filter Bar ─────────────────────────────────────────── */}
      <Card className="rounded-2xl border-[#E2E8F0] shadow-xs p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#64748B]" />
            <Input
              type="text"
              placeholder="Search by student name, PRN, route, or transaction ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs rounded-xl border-[#E2E8F0]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {["ALL", "PAID", "PARTIALLY_PAID", "PENDING"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#2563EB] text-white"
                    : "bg-[#F8FAFC] text-[#64748B] hover:bg-slate-200/70 hover:text-[#0F172A]"
                }`}
              >
                {st === "ALL"
                  ? "All Records"
                  : st === "PARTIALLY_PAID"
                  ? "Partial"
                  : st === "PAID"
                  ? "Paid"
                  : "Due"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Fee Audit Table ──────────────────────────────────────────────── */}
      <Card className="rounded-2xl border-[#E2E8F0] shadow-xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CreditCard className="mx-auto size-10 text-[#64748B]" />
            <p className="text-sm font-bold text-[#0F172A]">No payment records found</p>
            <p className="text-xs text-[#64748B]">Try adjusting your search criteria or status filter.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow>
                <TableHead>Student Name & PRN</TableHead>
                <TableHead>Bus Route</TableHead>
                <TableHead>Total Fee</TableHead>
                <TableHead>Deposited</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Mode & Ref</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-[#F8FAFC]/80">
                  <TableCell>
                    <div className="font-bold text-xs text-[#0F172A]">
                      {payment.studentName}
                    </div>
                    <div className="text-[11px] text-[#64748B] font-mono">
                      {payment.studentPrn}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-[#0F172A] font-medium max-w-[180px] truncate">
                      {payment.routeName}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-[#0F172A]">
                    ₹{payment.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-[#16A34A]">
                    ₹{payment.paidAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-[#DC2626]">
                    ₹{payment.pendingAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    {payment.transactionRef ? (
                      <div>
                        <span className="font-mono text-xs text-[#0F172A]">
                          {payment.transactionRef}
                        </span>
                        <div className="text-[10px] text-[#64748B]">
                          {payment.paymentMode}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[#64748B]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleOpenUpdate(payment)}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs h-8 px-3 rounded-xl cursor-pointer"
                    >
                      <Edit className="mr-1.5 size-3.5" />
                      Update Fee
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* ── Record Payment Modal ─────────────────────────────────────────── */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="max-w-md rounded-2xl border-[#E2E8F0]">
          {selectedPayment && (
            <form onSubmit={handleUpdatePayment}>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-[#0F172A]">
                  Update Payment: {selectedPayment.studentName}
                </DialogTitle>
                <DialogDescription className="text-xs font-mono text-[#64748B]">
                  {selectedPayment.studentPrn} • Total Fee: ₹{selectedPayment.totalAmount}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-xs">
                <div>
                  <Label className="text-xs font-semibold text-[#0F172A]">
                    Amount Paid (₹) *
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={selectedPayment.totalAmount}
                    value={inputPaidAmount}
                    onChange={(e) => setInputPaidAmount(Number(e.target.value))}
                    className="mt-1 text-xs rounded-xl font-bold text-[#16A34A]"
                    required
                  />
                  <div className="flex justify-between text-[11px] text-[#64748B] mt-1">
                    <span>
                      New Balance Due:{" "}
                      <span className="font-bold text-[#DC2626]">
                        ₹{Math.max(0, selectedPayment.totalAmount - inputPaidAmount)}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setInputPaidAmount(selectedPayment.totalAmount)}
                      className="text-[#2563EB] font-semibold hover:underline cursor-pointer"
                    >
                      Mark Full (₹{selectedPayment.totalAmount})
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#0F172A]">Payment Mode</Label>
                  <select
                    value={inputMode}
                    onChange={(e) => setInputMode(e.target.value as PaymentMode)}
                    className="w-full mt-1 text-xs rounded-xl border border-[#E2E8F0] bg-white p-2.5 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="NET_BANKING">Net Banking / NEFT</option>
                    <option value="CHALLAN">College Bank Challan</option>
                    <option value="DEMAND_DRAFT">Demand Draft (DD)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#0F172A]">
                    Receipt / Transaction Reference No.
                  </Label>
                  <Input
                    placeholder="e.g. UTR9922110034 or CH-2024-88"
                    value={inputRef}
                    onChange={(e) => setInputRef(e.target.value)}
                    className="mt-1 text-xs rounded-xl font-mono"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2 border-t border-[#E2E8F0]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUpdateOpen(false)}
                  className="text-xs h-9 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs h-9 px-4 rounded-xl cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    "Confirm & Save Fee"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
