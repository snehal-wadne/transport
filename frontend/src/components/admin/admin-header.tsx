"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bus,
  LayoutDashboard,
  ClipboardList,
  Users,
  Route,
  CreditCard,
  ShieldCheck,
  History,
  LogOut,
  ExternalLink,
  ChevronDown,
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loginAs } = useAuth();

  const navLinks = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Registrations", href: "/admin/registrations", icon: ClipboardList },
    { label: "Students", href: "/admin/students", icon: Users },
    { label: "Routes & Stops", href: "/admin/routes", icon: Route },
    { label: "Fee Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Audit Trail", href: "/admin/audit-logs", icon: History },
  ];

  const handleLogout = () => {
    logout();
    toast.info("Signed out from Administrative Session");
    router.push("/login");
  };

  const handleSwitchToStudent = () => {
    loginAs("STUDENT", "PRN2024001");
    toast.success("Switched to Student Portal view (Harshal Patil)");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-[#0F172A] text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── College & Admin Branding ──────────────────────────────────── */}
        <div className="flex items-center gap-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
              <Bus className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">
                  City Engineering College
                </span>
                <Badge className="bg-[#2563EB] text-white text-[10px] font-semibold border-none px-2 py-0.2">
                  ADMIN
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Transportation Administration Console
              </p>
            </div>
          </Link>
        </div>

        {/* ── Admin Navigation Tabs ─────────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Actions & Admin Profile ───────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Switch to Student Portal View */}
          <button
            type="button"
            onClick={handleSwitchToStudent}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-white cursor-pointer"
            title="Preview student interface as Harshal Patil"
          >
            <ExternalLink className="size-3.5 text-[#38BDF8]" />
            Student View
          </button>

          {/* Admin Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-800/90 p-1.5 pr-2.5 text-left transition-colors hover:bg-slate-700 focus:outline-none cursor-pointer">
              <Avatar className="size-8 rounded-lg border border-slate-600 bg-[#2563EB]/20">
                <AvatarFallback className="text-xs font-bold text-[#38BDF8]">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left leading-tight">
                <p className="text-xs font-semibold text-white truncate max-w-[130px]">
                  {user?.fullName || "Transport Admin"}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  admin@college.local
                </p>
              </div>
              <ChevronDown className="size-3.5 text-slate-400" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-xl border-[#E2E8F0] shadow-lg">
              <DropdownMenuLabel className="font-normal p-3 pb-2">
                <p className="text-xs font-bold text-[#0F172A]">Transportation Control</p>
                <p className="text-[11px] text-[#64748B]">Administrator Access</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSwitchToStudent}
                className="cursor-pointer text-xs font-medium py-2 flex items-center"
              >
                <ExternalLink className="mr-2 size-4 text-[#2563EB]" />
                Switch to Student Portal
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/admin/audit-logs")}
                className="cursor-pointer text-xs font-medium py-2 flex items-center"
              >
                <History className="mr-2 size-4 text-[#64748B]" />
                View Security Audit Logs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-xs font-medium py-2 text-[#DC2626] hover:bg-red-50 flex items-center"
              >
                <LogOut className="mr-2 size-4 text-[#DC2626]" />
                Sign Out Admin Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto border-t border-slate-800 px-4 py-2 text-xs">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                isActive
                  ? "bg-[#2563EB] text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="size-3.5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
