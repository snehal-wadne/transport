"use client";

import { useEffect, useState, useMemo } from "react";
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  User,
  Clock,
  Terminal,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CreditCard,
  Route,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient } from "@/lib/api-client";
import type { AdminAuditLogItem } from "@/lib/types";
import { toast } from "sonner";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.admin.getAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const list = Array.isArray(logs) ? logs : [];
    return list.filter((log) => {
      const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
      const matchesSearch =
        searchTerm.trim() === "" ||
        log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.targetId && log.targetId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        JSON.stringify(log.details || {}).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesAction && matchesSearch;
    });
  }, [logs, actionFilter, searchTerm]);

  const actionTypes = useMemo(() => {
    const list = Array.isArray(logs) ? logs : [];
    const set = new Set(list.map((l) => l.action));
    return ["ALL", ...Array.from(set)];
  }, [logs]);

  const getActionBadge = (action: string) => {
    if (action.includes("APPROVED")) {
      return (
        <Badge className="bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30 text-[11px] font-semibold">
          <CheckCircle2 className="mr-1 size-3" /> Pass Approved
        </Badge>
      );
    }
    if (action.includes("CHANGES")) {
      return (
        <Badge className="bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/30 text-[11px] font-semibold">
          <AlertTriangle className="mr-1 size-3" /> Changes Requested
        </Badge>
      );
    }
    if (action.includes("REJECTED") || action.includes("REVOKED")) {
      return (
        <Badge className="bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30 text-[11px] font-semibold">
          <XCircle className="mr-1 size-3" /> {action.includes("REVOKED") ? "Pass Revoked" : "Rejected"}
        </Badge>
      );
    }
    if (action.includes("PAYMENT")) {
      return (
        <Badge className="bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30 text-[11px] font-semibold">
          <CreditCard className="mr-1 size-3" /> Fee Adjusted
        </Badge>
      );
    }
    if (action.includes("ROUTE")) {
      return (
        <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[11px] font-semibold">
          <Route className="mr-1 size-3" /> Route Created
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[11px]">
        {action}
      </Badge>
    );
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Security & Audit Trail
            </h1>
            <Badge className="bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20 text-[10px]">
              Append-Only Ledger
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Complete compliance trail capturing approvals, change requests, payment receipts, and route mutations.
          </p>
        </div>
      </div>

      {/* ── Search & Filter Bar ─────────────────────────────────────────── */}
      <Card className="rounded-2xl border-[#E2E8F0] shadow-xs p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#64748B]" />
            <Input
              type="text"
              placeholder="Search by actor email, target pass ID, or audit remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs rounded-xl border-[#E2E8F0]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-[#64748B]" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[#0F172A] focus:outline-none"
            >
              {actionTypes.map((a) => (
                <option key={a} value={a}>
                  {a === "ALL" ? "All Action Types" : a.replace("ADMIN_", "").replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* ── Audit Logs Table ────────────────────────────────────────────── */}
      <Card className="rounded-2xl border-[#E2E8F0] shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <History className="mx-auto size-10 text-[#64748B]" />
            <p className="text-sm font-bold text-[#0F172A]">No audit logs match criteria</p>
            <p className="text-xs text-[#64748B]">Try clearing your search keyword.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action Type</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target ID</TableHead>
                <TableHead>Details & Remarks</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-[#F8FAFC]/80 text-xs">
                  <TableCell className="font-mono text-[#64748B] whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-[#0F172A]">{log.actorEmail}</div>
                    <Badge variant="outline" className="text-[10px] border-[#E2E8F0] text-[#64748B] mt-0.5">
                      {log.actorRole}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-[#2563EB]">
                    {log.targetId || "—"}
                  </TableCell>
                  <TableCell className="max-w-md">
                    {log.details ? (
                      <div className="space-y-0.5 text-[11px] text-[#64748B]">
                        {Object.entries(log.details).map(([key, val]) => (
                          <div key={key}>
                            <span className="font-semibold text-[#0F172A]">{key}: </span>
                            <span>{typeof val === "object" ? JSON.stringify(val) : String(val)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[#64748B]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-[#64748B]">
                    {log.ipAddress || "127.0.0.1"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
