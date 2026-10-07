"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CreditCard,
  Route,
  ArrowRight,
  ShieldCheck,
  FileText,
  Bus,
  TrendingUp,
  AlertCircle,
  Eye,
  Check,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient } from "@/lib/api-client";
import type {
  AdminDashboardMetrics,
  AdminRegistrationItem,
  TransportRoute,
  AdminAuditLogItem,
} from "@/lib/types";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [pendingRegistrations, setPendingRegistrations] = useState<AdminRegistrationItem[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [recentAudits, setRecentAudits] = useState<AdminAuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [m, regs, rts, audits] = await Promise.all([
        apiClient.admin.getMetrics(),
        apiClient.admin.getRegistrations("PENDING"),
        apiClient.routes.getAll(),
        apiClient.admin.getAuditLogs(),
      ]);
      setMetrics(m);
      setPendingRegistrations(Array.isArray(regs) ? regs : []);
      setRoutes(Array.isArray(rts) ? rts : []);
      setRecentAudits(Array.isArray(audits) ? audits.slice(0, 5) : []);
    } catch {
      toast.error("Failed to fetch administrative metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickApprove = async (id: string, name: string) => {
    try {
      await apiClient.admin.approveRegistration(id);
      toast.success(`Transportation Pass approved for ${name}`);
      loadData();
    } catch {
      toast.error("Failed to approve pass");
    }
  };

  const collectionPercent = metrics?.totalFeesExpected
    ? Math.round((metrics.totalFeesCollected / metrics.totalFeesExpected) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* ── Top Dashboard Header ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Administrative Control Center
            </h1>
            <Badge className="bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20 text-[10px] font-semibold">
              System Online
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Real-time transportation administration, queue verification, student directory, and fee management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => router.push("/admin/registrations")}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl h-9 shadow-xs cursor-pointer"
          >
            <Clock className="mr-1.5 size-3.5" />
            Process Verification Queue ({pendingRegistrations.length})
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/admin/routes")}
            className="border-[#E2E8F0] hover:bg-white text-xs font-semibold rounded-xl h-9 cursor-pointer"
          >
            <Route className="mr-1.5 size-3.5 text-[#2563EB]" />
            Manage Bus Fleet
          </Button>
        </div>
      </div>

      {/* ── Key Metrics KPI Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending Verifications */}
        <Card className="rounded-2xl border-[#E2E8F0] shadow-xs hover:border-[#F59E0B]/40 transition-colors">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Pending Applications
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]">
              <Clock className="size-4.5" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-black text-[#0F172A]">
              {metrics?.pendingReview ?? 0}
            </div>
            <p className="text-[11px] text-[#64748B] mt-1 flex items-center gap-1">
              <span className="text-[#F59E0B] font-semibold">Awaiting Review</span> • Requires admin action
            </p>
          </CardContent>
        </Card>

        {/* Metric 2: Active Passes */}
        <Card className="rounded-2xl border-[#E2E8F0] shadow-xs hover:border-[#16A34A]/40 transition-colors">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Approved Passes
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]">
              <CheckCircle2 className="size-4.5" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-black text-[#0F172A]">
              {metrics?.approvedPasses ?? 0}
            </div>
            <p className="text-[11px] text-[#64748B] mt-1 flex items-center gap-1">
              <span className="text-[#16A34A] font-semibold">Active & Valid</span> • Verified boarding passes
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: Changes Required */}
        <Card className="rounded-2xl border-[#E2E8F0] shadow-xs hover:border-[#0284C7]/40 transition-colors">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Changes Requested
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#0284C7]/10 text-[#0284C7]">
              <AlertTriangle className="size-4.5" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-black text-[#0F172A]">
              {metrics?.changesRequired ?? 0}
            </div>
            <p className="text-[11px] text-[#64748B] mt-1 flex items-center gap-1">
              <span className="text-[#0284C7] font-semibold">Returned to Student</span> • Awaiting correction
            </p>
          </CardContent>
        </Card>

        {/* Metric 4: Fee Collection Progress */}
        <Card className="rounded-2xl border-[#E2E8F0] shadow-xs hover:border-[#2563EB]/40 transition-colors">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Fee Collection
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
              <CreditCard className="size-4.5" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-black text-[#0F172A]">
              ₹{(metrics?.totalFeesCollected ?? 0).toLocaleString()}
            </div>
            <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
                style={{ width: `${collectionPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-[#64748B] mt-1.5">
              {collectionPercent}% of ₹{(metrics?.totalFeesExpected ?? 0).toLocaleString()} total expected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Two-Column Content: Queue & Fleet ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pending Review Queue (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-[#F59E0B]" />
              <h2 className="text-base font-bold text-[#0F172A]">
                Pending Verifications Queue
              </h2>
            </div>
            <Link
              href="/admin/registrations"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              View Full Queue <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <Card className="rounded-2xl border-[#E2E8F0] shadow-xs overflow-hidden">
            {pendingRegistrations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="mx-auto size-8 text-[#16A34A]" />
                <p className="text-sm font-bold text-[#0F172A]">
                  Verification Queue is Clear!
                </p>
                <p className="text-xs text-[#64748B]">
                  All student registrations have been reviewed and approved or updated.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-[#F8FAFC]">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Route / Pickup</TableHead>
                    <TableHead>Fee Deposit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRegistrations.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-semibold text-xs text-[#0F172A]">
                          {item.studentName}
                        </div>
                        <div className="text-[11px] text-[#64748B] font-mono">
                          {item.studentPrn} • {item.studentBranch}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium text-[#0F172A] max-w-[200px] truncate">
                          {item.routeName}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          Stop: {item.pickupPointName}
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => handleQuickApprove(item.id, item.studentName)}
                            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] h-7 px-2.5 rounded-lg cursor-pointer"
                          >
                            <Check className="mr-1 size-3" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/registrations?selected=${item.id}`)}
                            className="text-[11px] h-7 px-2.5 rounded-lg border-[#E2E8F0] cursor-pointer"
                          >
                            <Eye className="mr-1 size-3 text-[#2563EB]" />
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Link
              href="/admin/registrations"
              className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3.5 transition-colors hover:border-[#2563EB] hover:bg-[#F8FAFC]"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                <FileText className="size-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">All Registrations</p>
                <p className="text-[10px] text-[#64748B]">Filter by status & branch</p>
              </div>
            </Link>

            <Link
              href="/admin/students"
              className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3.5 transition-colors hover:border-[#2563EB] hover:bg-[#F8FAFC]"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#16A34A]/10 text-[#16A34A]">
                <Users className="size-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Student Directory</p>
                <p className="text-[10px] text-[#64748B]">Inspect & revoke passes</p>
              </div>
            </Link>

            <Link
              href="/admin/payments"
              className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3.5 transition-colors hover:border-[#2563EB] hover:bg-[#F8FAFC]"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#0284C7]/10 text-[#0284C7]">
                <CreditCard className="size-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Fee Payments</p>
                <p className="text-[10px] text-[#64748B]">Audit deposits & dues</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Fleet Summary & Security Audit (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Fleet Routes */}
          <Card className="rounded-2xl border-[#E2E8F0] shadow-xs">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Bus className="size-4 text-[#2563EB]" />
                  Active Bus Fleet ({Array.isArray(routes) ? routes.length : 0})
                </CardTitle>
                <Link
                  href="/admin/routes"
                  className="text-[11px] font-semibold text-[#2563EB] hover:underline"
                >
                  Manage
                </Link>
              </div>
              <CardDescription className="text-xs text-[#64748B]">
                Routes servicing City Engineering College
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              {(Array.isArray(routes) ? routes : []).map((rt) => (
                <div
                  key={rt.id}
                  className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A] truncate max-w-[170px]">
                      {rt.name.split("—")[0]}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono border-[#E2E8F0]">
                      {rt.routeCode}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    Bus: <span className="font-mono text-[#0F172A]">{rt.busNumber}</span> • Driver: {rt.driverName}
                  </p>
                  <p className="text-[10px] text-[#2563EB] font-medium">
                    {rt.pickupPoints?.length || 0} Designated Pickup Points
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Audit Trail */}
          <Card className="rounded-2xl border-[#E2E8F0] shadow-xs">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <ShieldCheck className="size-4 text-[#16A34A]" />
                  Recent Audit Events
                </CardTitle>
                <Link
                  href="/admin/audit-logs"
                  className="text-[11px] font-semibold text-[#2563EB] hover:underline"
                >
                  All Logs
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              {(Array.isArray(recentAudits) ? recentAudits : []).map((a) => (
                <div
                  key={a.id}
                  className="border-b border-[#E2E8F0] last:border-0 pb-2.5 last:pb-0 text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0F172A] text-[11px]">
                      {a.action.replace("ADMIN_", "").replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#64748B]">
                    Target: <span className="font-mono text-[#2563EB]">{a.targetId}</span> by {a.actorEmail}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
