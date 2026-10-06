"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  ShieldAlert,
  Phone,
  Mail,
  Heart,
  AlertCircle,
  Eye,
  Slash,
  CheckCircle2,
  Clock,
  XCircle,
  IdCard,
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
import { apiClient } from "@/lib/api-client";
import type { AdminStudentItem, RegistrationStatus } from "@/lib/types";
import { toast } from "sonner";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [branchFilter, setBranchFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected student inspection modal
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);
  const [deactivateReason, setDeactivateReason] = useState<string>("");
  const [isSubmittingDeactivation, setIsSubmittingDeactivation] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.admin.getStudents();
      setStudents(data);
    } catch {
      toast.error("Failed to load student directory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesBranch = branchFilter === "ALL" || s.branch === branchFilter;
      const matchesSearch =
        searchTerm.trim() === "" ||
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.prn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesBranch && matchesSearch;
    });
  }, [students, branchFilter, searchTerm]);

  const branches = useMemo(() => {
    const set = new Set(students.map((s) => s.branch));
    return ["ALL", ...Array.from(set)];
  }, [students]);

  const handleDeactivatePass = async () => {
    if (!selectedStudent) return;
    if (!deactivateReason.trim()) {
      toast.error("Please enter a reason for pass revocation");
      return;
    }
    setIsSubmittingDeactivation(true);
    try {
      await apiClient.admin.deactivatePass(selectedStudent.prn, deactivateReason.trim());
      toast.success(`Transportation pass revoked for ${selectedStudent.fullName}`);
      setIsDeactivating(false);
      setIsDetailOpen(false);
      loadData();
    } catch {
      toast.error("Failed to revoke pass");
    } finally {
      setIsSubmittingDeactivation(false);
    }
  };

  const getStatusBadge = (status?: RegistrationStatus | "NOT_REGISTERED") => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30 text-xs font-semibold">
            <CheckCircle2 className="mr-1 size-3" /> Active Pass
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30 text-xs font-semibold">
            <Clock className="mr-1 size-3" /> In Review
          </Badge>
        );
      case "CHANGES_REQUIRED":
        return (
          <Badge className="bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/30 text-xs font-semibold">
            Changes Required
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30 text-xs font-semibold">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[#64748B] text-xs">
            Not Registered
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
            Student Transport Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Search college students, inspect individual pass history, and manage transportation permissions.
          </p>
        </div>
        <div className="text-xs text-[#64748B] font-semibold bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-xl shadow-xs">
          Enrolled Directory: <span className="text-[#0F172A] font-bold">{students.length} Students</span>
        </div>
      </div>

      {/* ── Search & Branch Filter Bar ───────────────────────────────────── */}
      <Card className="rounded-2xl border-[#E2E8F0] shadow-xs p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#64748B]" />
            <Input
              type="text"
              placeholder="Search by student name, PRN, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs rounded-xl border-[#E2E8F0]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-[#64748B]" />
            <div className="flex flex-wrap gap-1">
              {branches.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBranchFilter(b)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    branchFilter === b
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#F8FAFC] text-[#64748B] hover:bg-slate-200/70 hover:text-[#0F172A]"
                  }`}
                >
                  {b === "ALL" ? "All Branches" : b.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Students Table ───────────────────────────────────────────────── */}
      <Card className="rounded-2xl border-[#E2E8F0] shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="mx-auto size-10 text-[#64748B]" />
            <p className="text-sm font-bold text-[#0F172A]">No students found</p>
            <p className="text-xs text-[#64748B]">
              Try adjusting your search criteria or branch filter.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow>
                <TableHead>Student Name & PRN</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Academic Program</TableHead>
                <TableHead>Transport Status</TableHead>
                <TableHead>Active Pass ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-[#F8FAFC]/80">
                  <TableCell>
                    <div className="font-bold text-xs text-[#0F172A]">
                      {student.fullName}
                    </div>
                    <div className="text-[11px] text-[#64748B] font-mono">
                      {student.prn}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-[#0F172A]">{student.email}</div>
                    <div className="text-[11px] text-[#64748B]">{student.mobile}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-[#0F172A]">
                      {student.branch}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {student.className} • {student.academicYear}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(student.transportStatus)}</TableCell>
                  <TableCell>
                    {student.transportationId ? (
                      <Badge variant="outline" className="font-mono text-xs text-[#2563EB] border-[#2563EB]/30">
                        {student.transportationId}
                      </Badge>
                    ) : (
                      <span className="text-xs text-[#64748B]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsDeactivating(false);
                        setDeactivateReason("");
                        setIsDetailOpen(true);
                      }}
                      className="text-xs h-8 px-3 rounded-xl border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer"
                    >
                      <Eye className="mr-1.5 size-3.5 text-[#2563EB]" />
                      Details & History
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* ── Student Details & Revocation Modal ────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-[#E2E8F0]">
          {selectedStudent && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-4">
                  <div>
                    <DialogTitle className="text-lg font-bold text-[#0F172A]">
                      {selectedStudent.fullName}
                    </DialogTitle>
                    <DialogDescription className="text-xs font-mono text-[#64748B]">
                      {selectedStudent.prn} • {selectedStudent.email}
                    </DialogDescription>
                  </div>
                  <div>{getStatusBadge(selectedStudent.transportStatus)}</div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                {/* Academic Profile */}
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#0F172A]">
                    <GraduationCap className="size-4 text-[#2563EB]" />
                    <span>Academic Enrollment</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[#64748B]">
                    <div>
                      <span className="font-semibold text-[#0F172A]">Branch: </span>
                      <span>{selectedStudent.branch}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">Class: </span>
                      <span>{selectedStudent.className}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">Year: </span>
                      <span>{selectedStudent.academicYear}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">Blood Group: </span>
                      <span className="font-mono text-[#DC2626]">{selectedStudent.bloodGroup || "O+"}</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#0F172A]">
                    <Phone className="size-4 text-[#2563EB]" />
                    <span>Emergency Contact Information</span>
                  </div>
                  <div className="text-[#64748B]">
                    <span className="font-semibold text-[#0F172A]">Primary Contact: </span>
                    <span>{selectedStudent.emergencyContact || "+91 98220 99881 (Parent)"}</span>
                  </div>
                </div>

                {/* Transportation Pass Info */}
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#0F172A]">
                    <IdCard className="size-4 text-[#2563EB]" />
                    <span>Transportation Allocation</span>
                  </div>
                  <div className="space-y-1 text-[#64748B]">
                    <div>
                      <span className="font-semibold text-[#0F172A]">Pass ID: </span>
                      <span className="font-mono font-bold text-[#2563EB]">
                        {selectedStudent.transportationId || "None Assigned"}
                      </span>
                    </div>
                    {selectedStudent.routeName && (
                      <div>
                        <span className="font-semibold text-[#0F172A]">Assigned Route: </span>
                        <span>{selectedStudent.routeName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deactivation Form Toggle */}
                {isDeactivating && (
                  <div className="rounded-xl border border-[#DC2626]/30 bg-[#DC2626]/10 p-3 space-y-2">
                    <p className="text-xs font-bold text-[#DC2626] flex items-center gap-1.5">
                      <ShieldAlert className="size-4" />
                      Confirm Pass Revocation / Deactivation
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      Revoking this pass will invalidate the QR code verification and notify the student.
                    </p>
                    <textarea
                      value={deactivateReason}
                      onChange={(e) => setDeactivateReason(e.target.value)}
                      placeholder="Reason for revocation (e.g. End of semester or student request)..."
                      rows={2}
                      className="w-full text-xs rounded-lg border border-[#E2E8F0] bg-white p-2.5 focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsDeactivating(false)}
                        className="text-xs h-8"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleDeactivatePass}
                        disabled={isSubmittingDeactivation}
                        className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs h-8"
                      >
                        {isSubmittingDeactivation ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          "Confirm Revoke"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {!isDeactivating && (
                <DialogFooter className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                  {selectedStudent.transportationId && selectedStudent.transportStatus === "APPROVED" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDeactivating(true)}
                      className="text-xs h-9 border-[#DC2626]/30 text-[#DC2626] hover:bg-[#DC2626]/10 rounded-xl cursor-pointer"
                    >
                      <Slash className="mr-1.5 size-3.5" />
                      Revoke Pass
                    </Button>
                  ) : (
                    <div />
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDetailOpen(false)}
                    className="text-xs h-9 rounded-xl"
                  >
                    Done
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
