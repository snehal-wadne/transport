"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bus,
  MapPin,
  User,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle,
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowRight,
  Info,
  RefreshCw,
  FileCheck2,
  IdCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  registrationFormSchema,
  type RegistrationFormValues,
} from "@/lib/validations";
import type {
  StudentProfile,
  TransportRoute,
  TransportRegistrationRecord,
} from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import IdCardModal from "./id-card-modal";

interface RegistrationFormProps {
  onDataLoaded?: (student: StudentProfile, reg: TransportRegistrationRecord | null, routes: TransportRoute[]) => void;
  onRegistrationChange?: (reg: TransportRegistrationRecord | null) => void;
}

// =============================================================================
// Student Transportation Registration — Main Component
// =============================================================================
export default function RegistrationForm({
  onDataLoaded,
  onRegistrationChange,
}: RegistrationFormProps) {
  const { user, token, updateStudentProfile } = useAuth();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<TransportRegistrationRecord | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const onDataLoadedRef = useRef(onDataLoaded);
  onDataLoadedRef.current = onDataLoaded;

  const onRegistrationChangeRef = useRef(onRegistrationChange);
  onRegistrationChangeRef.current = onRegistrationChange;

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      fullName: "",
      studentId: "",
      email: user?.email || "",
      mobile: "",
      academicYear: "2024-2025",
      className: "",
      branch: "",
      routeId: "",
      pickupPointId: "",
      transportationType: "bus",
      vehicleNumber: "",
      transactionRef: "",
      paymentMode: "UPI",
      paymentDate: new Date().toISOString().split("T")[0],
      claimedAmount: "18000",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const watchedRouteId = watch("routeId");

  // Load authenticated student profile and transportation routes from backend
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setSubmitError(null);
    try {
      const headersInit: Record<string, string> = {};
      if (token) {
        headersInit["Authorization"] = `Bearer ${token}`;
      }

      const [studentRes, routesRes, regRes] = await Promise.all([
        fetch("/api/students/me", { headers: headersInit }),
        fetch("/api/routes"),
        fetch("/api/transport/me", { headers: headersInit }),
      ]);

      const studentJson = await studentRes.json();
      const routesJson = await routesRes.json();
      const regJson = await regRes.json();

      let currentStudent: StudentProfile | null = null;
      let currentReg: TransportRegistrationRecord | null = null;
      let currentRoutes: TransportRoute[] = [];

      if (studentJson.success && studentJson.data) {
        currentStudent = studentJson.data as StudentProfile;
        setStudent(currentStudent);

        // Pre-fill student info if present
        if (currentStudent.fullName) setValue("fullName", currentStudent.fullName);
        if (currentStudent.studentId) setValue("studentId", currentStudent.studentId);
        if (currentStudent.email) setValue("email", currentStudent.email);
        else if (user?.email) setValue("email", user.email);
        if (currentStudent.mobile) setValue("mobile", currentStudent.mobile);
        if (currentStudent.academicYear) setValue("academicYear", currentStudent.academicYear);
        if (currentStudent.className) setValue("className", currentStudent.className);
        if (currentStudent.branch) setValue("branch", currentStudent.branch);
      } else if (user?.email) {
        setValue("email", user.email);
      }

      if (routesJson.success && routesJson.data) {
        currentRoutes = routesJson.data as TransportRoute[];
        setRoutes(currentRoutes);
      }

      if (regJson.success && regJson.data) {
        currentReg = regJson.data as TransportRegistrationRecord;
        setSubmissionResult(currentReg);
        onRegistrationChangeRef.current?.(currentReg);
      } else {
        setSubmissionResult(null);
        onRegistrationChangeRef.current?.(null);
      }

      if (currentStudent) {
        onDataLoadedRef.current?.(currentStudent, currentReg, currentRoutes);
      } else if (user) {
        const fallbackProfile: StudentProfile = {
          fullName: user.fullName || "",
          studentId: user.prn || "",
          email: user.email,
          mobile: "",
          academicYear: "2024-2025",
          className: "",
          branch: "",
          bloodGroup: "O+",
          emergencyContact: "",
        };
        onDataLoadedRef.current?.(fallbackProfile, currentReg, currentRoutes);
      }
    } catch (err) {
      console.error("Initialization error:", err);
      setSubmitError("Failed to load authenticated profile. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [setValue, token, user]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // When route changes, update selected route state and auto-populate vehicle number
  useEffect(() => {
    if (watchedRouteId) {
      const match = routes.find((r) => r.id === watchedRouteId) ?? null;
      setSelectedRoute(match);
      if (match?.busNumber) {
        setValue("vehicleNumber", match.busNumber);
      }
    } else {
      setSelectedRoute(null);
      setValue("pickupPointId", "");
      setValue("vehicleNumber", "");
    }
  }, [watchedRouteId, routes, setValue]);

  // Submit handler
  async function onSubmit(values: RegistrationFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const headersInit: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headersInit["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/transport", {
        method: "POST",
        headers: headersInit,
        body: JSON.stringify({
          fullName: values.fullName,
          studentId: values.studentId,
          email: values.email,
          mobile: values.mobile,
          academicYear: values.academicYear,
          className: values.className,
          branch: values.branch,
          routeId: values.routeId,
          pickupPointId: values.pickupPointId,
          transportationType: values.transportationType,
          vehicleNumber: values.vehicleNumber || undefined,
          transactionRef: values.transactionRef,
          paymentMode: values.paymentMode,
          paymentDate: values.paymentDate,
          claimedAmount: values.claimedAmount,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmissionResult(result.data);
        const updatedStud: StudentProfile = result.student || {
          fullName: values.fullName,
          studentId: values.studentId,
          email: values.email,
          mobile: values.mobile,
          academicYear: values.academicYear,
          className: values.className,
          branch: values.branch,
          bloodGroup: "O+",
          emergencyContact: "",
        };
        setStudent(updatedStud);
        updateStudentProfile(updatedStud);
        if (onRegistrationChange) onRegistrationChange(result.data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitError(result.error || "Failed to submit transportation registration.");
      }
    } catch {
      setSubmitError("Network connectivity issue. Please try submitting again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Demo reset for testing duplicate prevention
  async function handleResetRegistration() {
    try {
      setIsLoading(true);
      await fetch("/api/transport", { method: "DELETE" });
      setSubmissionResult(null);
      if (onRegistrationChange) onRegistrationChange(null);
      form.reset({
        fullName: student?.fullName || "",
        studentId: student?.studentId || "",
        email: student?.email || "",
        mobile: student?.mobile || "",
        academicYear: student?.academicYear || "",
        className: student?.className || "",
        branch: student?.branch || "",
        routeId: "",
        pickupPointId: "",
        transportationType: "bus",
        vehicleNumber: "",
        transactionRef: "",
        paymentMode: "UPI",
        paymentDate: new Date().toISOString().split("T")[0],
        claimedAmount: "18000",
      });
      setSelectedRoute(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
            <Loader2 className="size-7 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">
              Verifying Student Session
            </h3>
            <p className="mt-1 text-xs text-[#64748B]">
              Fetching authenticated records and active routes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Submission Result State (Section 7) ──────────────────────────────────
  if (submissionResult) {
    const regRoute = routes.find((r) => r.id === submissionResult.routeId);
    const regPickup = regRoute?.pickupPoints.find(
      (p) => p.id === submissionResult.pickupPointId
    );

    return (
      <div className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Main Success Confirmation Card */}
          <Card className="border-[#E2E8F0] shadow-md rounded-2xl overflow-hidden bg-white">
            {/* Top banner accent */}
            <div className="h-2 bg-gradient-to-r from-[#16A34A] to-[#2563EB]" />

            <CardContent className="p-6 sm:p-8 text-center space-y-6">
              {/* Success Badge & Icon */}
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#16A34A]/10 text-[#16A34A] shadow-inner">
                <CheckCircle2 className="size-9" />
              </div>

              {/* Required Headings */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl tracking-tight">
                  Registration Submitted
                </h1>
                <p className="mx-auto max-w-lg text-sm text-[#64748B] leading-relaxed">
                  Your transportation registration has been submitted successfully and is waiting for admin verification.
                </p>
              </div>

              {/* Status Section */}
              <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Application Status:
                  </span>
                  <Badge className="bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30 px-3 py-1 font-bold text-xs flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    PENDING
                  </Badge>
                </div>

                <Separator orientation="vertical" className="h-4 bg-[#E2E8F0] hidden sm:block" />

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Payment Clearance:
                  </span>
                  <Badge className="bg-[#0284C7]/15 text-[#0284C7] border-[#0284C7]/30 px-3 py-1 font-semibold text-xs flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5" />
                    PENDING ADMIN VERIFICATION
                  </Badge>
                </div>
              </div>

              {/* Security Boundary Alert — Strictly student's own record */}
              <div className="rounded-xl border border-[#2563EB]/20 bg-[#2563EB]/5 p-4 text-left">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="size-5 text-[#2563EB] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-[#0F172A]">
                      Institutional Privacy Guarantee
                    </p>
                    <p className="text-[#64748B] leading-relaxed">
                      This registration is permanently associated with your verified student identity (<code className="font-mono text-[#2563EB] font-bold">{submissionResult.studentPrn}</code>). All route assignments, fees, and pass issuance are private and cannot be viewed by other students.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submitted Details Grid */}
              <div className="space-y-4 text-left pt-2">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
                    <FileCheck2 className="size-4 text-[#2563EB]" />
                    Registration Summary
                  </h3>
                  <span className="font-mono text-xs text-[#64748B]">
                    Ref: {submissionResult.id}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <SummaryItem
                    label="Student Name"
                    value={submissionResult.studentName}
                    icon={<User className="size-3.5 text-[#64748B]" />}
                  />
                  <SummaryItem
                    label="Student PRN"
                    value={submissionResult.studentPrn}
                    highlight
                    icon={<GraduationCap className="size-3.5 text-[#64748B]" />}
                  />
                  <SummaryItem
                    label="Allocated Route"
                    value={regRoute?.name || submissionResult.routeId}
                    icon={<MapPin className="size-3.5 text-[#64748B]" />}
                  />
                  <SummaryItem
                    label="Designated Pickup Point"
                    value={regPickup ? `${regPickup.name} (${regPickup.estimatedTime})` : submissionResult.pickupPointId}
                    icon={<Clock className="size-3.5 text-[#64748B]" />}
                  />
                  <SummaryItem
                    label="Transportation Type"
                    value={submissionResult.transportationType.toUpperCase()}
                    icon={<Bus className="size-3.5 text-[#64748B]" />}
                  />
                  <SummaryItem
                    label="Designated Vehicle"
                    value={submissionResult.vehicleNumber || regRoute?.busNumber || "TBD (Fleet Pool)"}
                    icon={<Bus className="size-3.5 text-[#64748B]" />}
                  />
                  <SummaryItem
                    label="Payment Claim Ref"
                    value={submissionResult.paymentClaim?.transactionRef || "N/A"}
                    icon={<CreditCard className="size-3.5 text-[#64748B]" />}
                  />
                  <SummaryItem
                    label="Submission Timestamp"
                    value={new Date(submissionResult.submittedAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    icon={<Calendar className="size-3.5 text-[#64748B]" />}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-[#E2E8F0]">
                <Button
                  onClick={() => setIsPassModalOpen(true)}
                  className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl h-11 px-6 shadow-md shadow-[#2563EB]/20 flex items-center gap-2"
                >
                  <IdCard className="size-4" />
                  View Digital Transport Pass
                </Button>

                <Button
                  variant="outline"
                  onClick={handleResetRegistration}
                  className="w-full sm:w-auto border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] rounded-xl h-11 px-5 flex items-center gap-2 text-xs"
                >
                  <RefreshCw className="size-3.5" />
                  Reset / Re-submit (Demo Test)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Digital Pass Modal */}
        <IdCardModal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          student={student}
          registration={submissionResult}
          route={regRoute || null}
        />
      </div>
    );
  }

  // ─── Active Registration Form State (Sections 2–6) ─────────────────────────
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Page Header (Section 2) ───────────────────────────────────────── */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#2563EB]/10 px-3 py-1 text-xs font-semibold text-[#2563EB]">
          <Bus className="size-3.5" />
          <span>Academic Year 2024–2025</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
          Transportation Registration
        </h1>
        <p className="text-sm text-[#64748B] sm:text-base max-w-2xl">
          Enter your transportation details to register for the college transportation service.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ── 3. Student Information Section ──────────────────────────────── */}
        <Card className="border-[#E2E8F0] shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <User className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold text-[#0F172A]">
                    Student Information
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-[#64748B]">
                    Enter student academic and enrollment details for official ID pass issuance
                  </CardDescription>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs text-[#2563EB] font-medium">
                <FileCheck2 className="size-3.5 text-[#2563EB]" />
                <span>Verified Enrollment Details</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Full Name */}
              <FormField
                label="Full Name"
                required
                icon={<User className="size-4 text-[#64748B]" />}
                error={errors.fullName?.message}
              >
                <Input
                  {...register("fullName")}
                  placeholder="e.g. Snehal Wadne"
                  className="border-[#E2E8F0] text-[#0F172A] font-medium focus:border-[#2563EB] focus:ring-[#2563EB]/20 h-10 rounded-xl"
                />
              </FormField>

              {/* Student ID / PRN */}
              <FormField
                label="Student ID / PRN"
                required
                icon={<GraduationCap className="size-4 text-[#64748B]" />}
                error={errors.studentId?.message}
              >
                <Input
                  {...register("studentId")}
                  placeholder="e.g. PRN2024099"
                  className="border-[#E2E8F0] font-mono text-[#2563EB] font-bold focus:border-[#2563EB] focus:ring-[#2563EB]/20 h-10 rounded-xl"
                />
              </FormField>

              {/* College Email */}
              <FormField
                label="College Email"
                required
                icon={<Mail className="size-4 text-[#64748B]" />}
                error={errors.email?.message}
              >
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="name@college.edu"
                  className="border-[#E2E8F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-[#2563EB]/20 h-10 rounded-xl"
                />
              </FormField>

              {/* Mobile Number */}
              <FormField
                label="Mobile Number"
                required
                icon={<Phone className="size-4 text-[#64748B]" />}
                error={errors.mobile?.message}
              >
                <Input
                  {...register("mobile")}
                  type="tel"
                  placeholder="10-digit Mobile (e.g. 9876543210)"
                  className="border-[#E2E8F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-[#2563EB]/20 h-10 rounded-xl"
                />
              </FormField>

              {/* Academic Year */}
              <FormField
                label="Academic Year"
                required
                icon={<Calendar className="size-4 text-[#64748B]" />}
                error={errors.academicYear?.message}
              >
                <Input
                  {...register("academicYear")}
                  placeholder="e.g. 2024-2025"
                  className="border-[#E2E8F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-[#2563EB]/20 h-10 rounded-xl"
                />
              </FormField>

              {/* Class */}
              <FormField
                label="Class"
                required
                icon={<BookOpen className="size-4 text-[#64748B]" />}
                error={errors.className?.message}
              >
                <Input
                  {...register("className")}
                  placeholder="e.g. TE (Third Year)"
                  className="border-[#E2E8F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-[#2563EB]/20 h-10 rounded-xl"
                />
              </FormField>

              {/* Branch */}
              <FormField
                label="Branch / Department"
                required
                icon={<BookOpen className="size-4 text-[#64748B]" />}
                error={errors.branch?.message}
                className="sm:col-span-2"
              >
                <Input
                  {...register("branch")}
                  placeholder="e.g. Computer Engineering"
                  className="border-[#E2E8F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-[#2563EB]/20 h-10 rounded-xl"
                />
              </FormField>
            </div>

            {/* Registration Instructions Notice */}
            <div className="flex items-start gap-2.5 rounded-xl border border-[#2563EB]/20 bg-[#2563EB]/5 p-3.5 text-xs text-[#0F172A]">
              <Info className="size-4 text-[#2563EB] shrink-0 mt-0.5" />
              <p className="text-[#64748B] leading-relaxed">
                <strong className="text-[#2563EB]">Registration Guidance:</strong> Please enter your enrollment details accurately. Once submitted, your unique Transportation ID and Digital Pass Card will be automatically generated with these credentials.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── 4. Transportation Details Section ───────────────────────────── */}
        <Card className="border-[#E2E8F0] shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                <Bus className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-[#0F172A]">
                  Transportation Details
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-[#64748B]">
                  Select your daily commuting route and designated pickup boarding stop
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Route Dropdown (Populated from backend-managed routes) */}
              <FormField
                label="Route"
                required
                icon={<MapPin className="size-4 text-[#64748B]" />}
                error={errors.routeId?.message}
              >
                <select
                  {...register("routeId")}
                  className="flex h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select an institutional route...</option>
                  {(Array.isArray(routes) ? routes : []).map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Pickup Point Dropdown (Depends on selected route) */}
              <FormField
                label="Pickup Point"
                required
                icon={<Clock className="size-4 text-[#64748B]" />}
                error={errors.pickupPointId?.message}
              >
                <select
                  {...register("pickupPointId")}
                  disabled={!selectedRoute}
                  className="flex h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-60"
                >
                  <option value="">
                    {selectedRoute
                      ? "Choose your boarding pickup stop..."
                      : "First select a route from the left dropdown"}
                  </option>
                  {selectedRoute?.pickupPoints.map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.name}
                      {point.estimatedTime ? ` (${point.estimatedTime})` : ""}
                      {point.landmark ? ` — ${point.landmark}` : ""}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Transportation Type */}
              <FormField
                label="Transportation Type"
                required
                icon={<Bus className="size-4 text-[#64748B]" />}
                error={errors.transportationType?.message}
              >
                <select
                  {...register("transportationType")}
                  className="flex h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                >
                  <option value="bus">College Regular Bus (Standard 42-seater)</option>
                  <option value="van">College Campus Mini-Van (Express)</option>
                  <option value="shuttle">Metro Connection Campus Shuttle</option>
                </select>
              </FormField>

              {/* Bus/Vehicle Number (Optional / Pre-allocated) */}
              <FormField
                label="Designated Bus / Vehicle Number"
                icon={<Bus className="size-4 text-[#64748B]" />}
                error={errors.vehicleNumber?.message}
              >
                <Input
                  {...register("vehicleNumber")}
                  placeholder="e.g. MH-12-TR-1001"
                  className="border-[#E2E8F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-[#2563EB]/20 h-10 rounded-xl"
                />
              </FormField>
            </div>

            {/* Selected Route Visual Stops & Schedule Preview */}
            {selectedRoute && (
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Stops & Schedule: {selectedRoute.name}
                    </h4>
                    <p className="text-xs text-[#64748B]">
                      {selectedRoute.description} • Vehicle: {selectedRoute.busNumber || "Pool"}
                    </p>
                  </div>
                  {selectedRoute.driverName && (
                    <div className="text-left sm:text-right text-[11px] text-[#64748B]">
                      <span>Driver: <strong className="text-[#0F172A]">{selectedRoute.driverName}</strong></span>
                      <span className="block sm:inline sm:ml-2 font-mono text-[#2563EB]">{selectedRoute.driverContact}</span>
                    </div>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2 pt-2">
                  {selectedRoute.pickupPoints.map((point, index) => (
                    <div
                      key={point.id}
                      className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-white p-2.5 text-xs"
                    >
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#2563EB]/10 font-bold text-[#2563EB]">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#0F172A] truncate">
                          {point.name}
                        </p>
                        {point.landmark && (
                          <p className="text-[11px] text-[#64748B] truncate">
                            {point.landmark}
                          </p>
                        )}
                      </div>
                      {point.estimatedTime && (
                        <span className="shrink-0 rounded bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 font-mono text-[11px] font-medium text-[#2563EB]">
                          {point.estimatedTime}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── 5. Payment Information Section ──────────────────────────────── */}
        <Card className="border-[#E2E8F0] shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                <CreditCard className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-[#0F172A]">
                  Payment Information (Fee Deposit Claim)
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-[#64748B]">
                  Submit your fee receipt details for administrative verification
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-5">
            {/* Required Access Control Disclaimer for Payment */}
            <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 text-xs text-[#0F172A] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[#B45309]">
                <AlertCircle className="size-4 shrink-0" />
                <span>Notice on Official Payment Status</span>
              </div>
              <p className="text-[#0F172A]/85 leading-relaxed">
                Entering payment information here constitutes a <strong className="text-[#0F172A]">submitted claim/request only</strong>. Official payment status is strictly reconciled with institutional bank records and governed exclusively by the College Transportation Accounts Administration. Students cannot approve or modify official payment status.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Payment Mode */}
              <FormField
                label="Payment Mode"
                required
                icon={<CreditCard className="size-4 text-[#64748B]" />}
                error={errors.paymentMode?.message}
              >
                <select
                  {...register("paymentMode")}
                  className="flex h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                >
                  <option value="UPI">UPI / QR Code Transfer (PhonePe, GPay, Paytm)</option>
                  <option value="NET_BANKING">Net Banking / NEFT / RTGS</option>
                  <option value="CHALLAN">College Bank Challan</option>
                  <option value="DEMAND_DRAFT">Demand Draft (DD)</option>
                </select>
              </FormField>

              {/* Transaction Ref */}
              <FormField
                label="Transaction ID / UTR / Receipt No."
                required
                icon={<FileCheck2 className="size-4 text-[#64748B]" />}
                error={errors.transactionRef?.message}
              >
                <Input
                  {...register("transactionRef")}
                  placeholder="e.g. UTR249912039482"
                  className="border-[#E2E8F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-[#2563EB]/20 h-10 rounded-xl"
                />
              </FormField>

              {/* Payment Date */}
              <FormField
                label="Date of Payment"
                required
                icon={<Calendar className="size-4 text-[#64748B]" />}
                error={errors.paymentDate?.message}
              >
                <Input
                  {...register("paymentDate")}
                  type="date"
                  className="border-[#E2E8F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-[#2563EB]/20 h-10 rounded-xl"
                />
              </FormField>

              {/* Claimed Amount */}
              <FormField
                label="Claimed Amount (INR)"
                required
                icon={<CreditCard className="size-4 text-[#64748B]" />}
                error={errors.claimedAmount?.message}
              >
                <Input
                  {...register("claimedAmount")}
                  placeholder="e.g. 18000"
                  className="border-[#E2E8F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-[#2563EB]/20 h-10 rounded-xl font-medium"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* ── Submission Error Notification ──────────────────────────────── */}
        {submitError && (
          <div className="flex items-center gap-3 rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 p-4 text-xs sm:text-sm text-[#DC2626]">
            <AlertCircle className="size-5 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-bold">Submission Blocked</p>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        {/* ── 6. Submit Button ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-[#64748B] text-center sm:text-left">
            By clicking submit, you confirm that your commuting details are accurate and acknowledge admin verification.
          </p>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[280px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold h-12 rounded-xl shadow-lg shadow-[#2563EB]/25 transition-all duration-200 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Validating & Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-5" />
                Submit Transportation Registration
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// =============================================================================
// Helper Presentation Sub-Components
// =============================================================================

function FormField({
  label,
  children,
  error,
  required,
  isLocked,
  icon,
  className,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  isLocked?: boolean;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0F172A]">
          {icon}
          <span>{label}</span>
          {required && <span className="text-[#DC2626]">*</span>}
        </Label>
        {isLocked && (
          <span className="flex items-center gap-1 text-[10px] text-[#64748B] bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#E2E8F0]">
            <Lock className="size-2.5 text-[#64748B]" /> Locked
          </span>
        )}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-[#DC2626]">
          <AlertCircle className="size-3" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function SummaryItem({
  label,
  value,
  highlight,
  icon,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <p
        className={`text-sm font-semibold truncate ${
          highlight ? "text-[#2563EB] font-mono" : "text-[#0F172A]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
