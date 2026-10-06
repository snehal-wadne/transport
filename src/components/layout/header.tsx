"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bus,
  LogOut,
  FileEdit,
  IdCard,
  ChevronDown,
  User,
  ClipboardPen,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import IdCardModal from "@/components/registration/id-card-modal";
import EditDetailsModal from "@/components/registration/edit-details-modal";
import type { StudentProfile, TransportRegistrationRecord, TransportRoute } from "@/lib/types";

interface HeaderProps {
  student?: StudentProfile | null;
  registration?: TransportRegistrationRecord | null;
  routes?: TransportRoute[];
  onResetRegistration?: () => void;
}

export default function Header({
  student,
  registration,
  routes = [],
  onResetRegistration,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const selectedRoute = routes.find((r) => r.id === registration?.routeId) || null;

  const studentInitials = student?.fullName
    ? student.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "ST";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 shadow-xs">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* ── College Branding & Portal Name ────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
            title="City Engineering College Transportation Portal"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25">
              <Bus className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-[#0F172A] tracking-tight">
                  City Engineering College
                </span>
                <span className="hidden sm:inline-block rounded-full bg-[#2563EB]/10 px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">
                  Student Portal
                </span>
              </div>
              <p className="text-xs font-medium text-[#64748B]">
                Transportation Portal
              </p>
            </div>
          </Link>

          {/* ── Student Dashboard Navigation (Strictly student-scoped) ───── */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/"
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                pathname === "/"
                  ? "bg-[#2563EB]/10 text-[#2563EB]"
                  : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <ClipboardPen className="size-3.5" />
              Registration
            </Link>

            <Link
              href="/id-card"
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                pathname === "/id-card" || pathname === "/my-transportation"
                  ? "bg-[#2563EB]/10 text-[#2563EB]"
                  : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <IdCard className="size-3.5" />
              My Transportation ID
            </Link>

            <Link
              href="/edit"
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                pathname === "/edit"
                  ? "bg-[#2563EB]/10 text-[#2563EB]"
                  : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <FileEdit className="size-3.5" />
              Edit Details
            </Link>
          </nav>

          {/* ── Authenticated Student Profile & Actions ─────────────────── */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white p-1.5 pr-2.5 text-left transition-colors hover:bg-[#F8FAFC] focus:outline-none cursor-pointer"
                aria-label="Student account options"
              >
                <Avatar className="size-8 rounded-lg border border-[#E2E8F0] bg-[#2563EB]/10">
                  <AvatarFallback className="text-xs font-bold text-[#2563EB]">
                    {studentInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-semibold text-[#0F172A] truncate max-w-[130px]">
                    {student?.fullName || "Student Profile"}
                  </p>
                  <p className="text-[10px] font-mono text-[#64748B]">
                    {student?.studentId || "PRN"}
                  </p>
                </div>
                <ChevronDown className="size-3.5 text-[#64748B]" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64 rounded-xl border-[#E2E8F0] shadow-lg">
                <DropdownMenuLabel className="font-normal p-3 pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 rounded-xl bg-[#2563EB]/10 border border-[#E2E8F0]">
                      <AvatarFallback className="text-sm font-bold text-[#2563EB]">
                        {studentInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#0F172A] truncate">
                        {student?.fullName || "Authenticated Student"}
                      </p>
                      <p className="text-xs text-[#64748B] truncate">
                        {student?.email || "student@college.edu"}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="rounded bg-[#F8FAFC] px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#2563EB] border border-[#E2E8F0]">
                          {student?.studentId}
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          {student?.className}
                        </span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-[#E2E8F0]" />

                {/* STRICT ACCESS CONTROL: Only student's own views. Never admin views. */}
                <DropdownMenuItem
                  onClick={() => router.push("/id-card")}
                  className="cursor-pointer text-xs font-medium py-2 flex items-center"
                >
                  <IdCard className="mr-2 size-4 text-[#2563EB]" />
                  My Transportation ID & Pass
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/")}
                  className="cursor-pointer text-xs font-medium py-2 flex items-center"
                >
                  <ClipboardPen className="mr-2 size-4 text-[#2563EB]" />
                  Transportation Registration
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/edit")}
                  className="cursor-pointer text-xs font-medium py-2 flex items-center"
                >
                  <FileEdit className="mr-2 size-4 text-[#2563EB]" />
                  Edit Commuter Details
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setIsEditModalOpen(true)}
                  className="cursor-pointer text-xs font-medium py-2"
                >
                  <User className="mr-2 size-4 text-[#64748B]" />
                  Protected Identity Policy
                </DropdownMenuItem>

                {onResetRegistration && registration && (
                  <DropdownMenuItem
                    onClick={onResetRegistration}
                    className="cursor-pointer text-xs font-medium py-2 text-[#0284C7] focus:text-[#0284C7]"
                  >
                    <Bus className="mr-2 size-4" />
                    Reset Registration (Demo)
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-[#E2E8F0]" />

                <DropdownMenuItem
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="cursor-pointer text-xs font-medium py-2 text-[#DC2626] focus:text-[#DC2626] focus:bg-[#DC2626]/5"
                >
                  <LogOut className="mr-2 size-4" />
                  Logout Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ── Mobile Navigation Bar ────────────────────────────────────── */}
        <div className="md:hidden border-t border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2">
          <div className="grid grid-cols-4 gap-1 text-center">
            <Link
              href="/"
              className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${
                pathname === "/"
                  ? "text-[#2563EB] bg-[#2563EB]/10"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <ClipboardPen className="size-4" />
              <span>Register</span>
            </Link>

            <Link
              href="/id-card"
              className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${
                pathname === "/id-card" || pathname === "/my-transportation"
                  ? "text-[#2563EB] bg-[#2563EB]/10"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <IdCard className="size-4" />
              <span>My Pass</span>
            </Link>

            <Link
              href="/edit"
              className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${
                pathname === "/edit"
                  ? "text-[#2563EB] bg-[#2563EB]/10"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <FileEdit className="size-4" />
              <span>Edit</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold text-[#DC2626] hover:bg-[#DC2626]/5"
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Student Digital Pass Modal ─────────────────────────────────── */}
      <IdCardModal
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
        student={student ?? null}
        registration={registration ?? null}
        route={selectedRoute}
      />

      {/* ── Edit Identity Protection Modal ─────────────────────────────── */}
      <EditDetailsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={student ?? null}
      />

      {/* ── Logout Confirmation Modal ──────────────────────────────────── */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#DC2626]/10 text-[#DC2626]">
                <LogOut className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Logout Session</h3>
                <p className="text-xs text-[#64748B]">Sign out of student transport portal</p>
              </div>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Are you sure you want to end your current session for PRN <strong className="text-[#0F172A]">{student?.studentId}</strong>? You will need to re-authenticate with college SSO.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLogoutModalOpen(false)}
                className="rounded-xl border-[#E2E8F0] text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  window.location.reload();
                }}
                className="rounded-xl bg-[#DC2626] hover:bg-[#DC2626]/90 text-white text-xs h-9"
              >
                Confirm Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
