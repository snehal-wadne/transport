"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bus,
  MapPin,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  User,
  GraduationCap,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  FileEdit,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
} from "lucide-react";

import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import ConfirmChangesModal, { type ChangeDiffItem } from "@/components/edit/confirm-changes-modal";
import { transportDetailsSchema } from "@/lib/validations";
import type {
  StudentProfile,
  TransportRegistrationRecord,
  TransportRoute,
  TransportationType,
} from "@/lib/types";
import { z } from "zod";

type EditFormValues = z.infer<typeof transportDetailsSchema>;

// =============================================================================
// Page 3: Edit Transportation Details
//
// CRITICAL SECURITY ENFORCEMENT:
// - Student can ONLY modify their own commuting preferences (Route, Pickup, Vehicle).
// - Student identity fields (Name, PRN, Email, Class, Branch) are strictly locked.
// - Transportation ID, Approval Status, and Official Payment Status are strictly read-only.
// - Backend session binds all updates via PATCH /api/transport/me.
// - Changing commuting details invalidates prior approval and forces PENDING status.
// =============================================================================
export default function EditTransportationDetailsPage() {
  const router = useRouter();

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [originalRecord, setOriginalRecord] = useState<TransportRegistrationRecord | null>(null);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Submission & Workflow states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [updatedRecord, setUpdatedRecord] = useState<TransportRegistrationRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(transportDetailsSchema),
    defaultValues: {
      routeId: "",
      pickupPointId: "",
      transportationType: "bus",
      vehicleNumber: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;

  const watchedRouteId = watch("routeId");
  const watchedPickupPointId = watch("pickupPointId");
  const watchedTransportType = watch("transportationType");
  const watchedVehicleNumber = watch("vehicleNumber");

  // Load authenticated data from server session
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // SECURITY: Access only authenticated session endpoints. No /transport/:studentId.
      const [studentRes, regRes, routesRes] = await Promise.all([
        fetch("/api/students/me"),
        fetch("/api/transport/me"),
        fetch("/api/routes"),
      ]);

      const studentJson = await studentRes.json();
      const regJson = await regRes.json();
      const routesJson = await routesRes.json();

      if (studentJson.success && studentJson.data) {
        setStudent(studentJson.data);
      }

      if (routesJson.success && routesJson.data) {
        setRoutes(routesJson.data);
      }

      if (regJson.success && regJson.data) {
        const reg = regJson.data as TransportRegistrationRecord;
        setOriginalRecord(reg);
        reset({
          routeId: reg.routeId,
          pickupPointId: reg.pickupPointId,
          transportationType: reg.transportationType,
          vehicleNumber: reg.vehicleNumber || "",
        });
      } else {
        setOriginalRecord(null);
      }
    } catch (err) {
      console.error("Failed to load details:", err);
      setErrorMessage("Could not load your transportation records. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Selected route object
  const selectedRoute = useMemo(() => {
    return routes.find((r) => r.id === watchedRouteId) || null;
  }, [routes, watchedRouteId]);

  // Original route & pickup objects for before/after comparison
  const originalRoute = useMemo(() => {
    return routes.find((r) => r.id === originalRecord?.routeId) || null;
  }, [routes, originalRecord?.routeId]);

  const originalPickup = useMemo(() => {
    return (
      originalRoute?.pickupPoints.find(
        (p) => p.id === originalRecord?.pickupPointId
      ) || null
    );
  }, [originalRoute, originalRecord?.pickupPointId]);

  const newPickup = useMemo(() => {
    return (
      selectedRoute?.pickupPoints.find(
        (p) => p.id === watchedPickupPointId
      ) || null
    );
  }, [selectedRoute, watchedPickupPointId]);

  // Handle route change: auto-suggest vehicle number if none entered, and clear invalid pickup
  const handleRouteChange = (newRouteId: string) => {
    setValue("routeId", newRouteId, { shouldValidate: true });
    setValue("pickupPointId", "", { shouldValidate: true });

    const match = routes.find((r) => r.id === newRouteId);
    if (match?.busNumber) {
      setValue("vehicleNumber", match.busNumber);
    }
  };

  // ─── Change Detection (Required Feature) ──────────────────────────────────
  const diffItems: ChangeDiffItem[] = useMemo(() => {
    if (!originalRecord) return [];

    const changes: ChangeDiffItem[] = [];

    // 1. Check Route change
    if (watchedRouteId && watchedRouteId !== originalRecord.routeId) {
      changes.push({
        field: "routeId",
        label: "Transportation Route",
        oldValue: originalRoute?.name || originalRecord.routeId,
        newValue: selectedRoute?.name || watchedRouteId,
        icon: <MapPin className="size-3.5 text-[#2563EB]" />,
      });
    }

    // 2. Check Pickup Point change
    if (
      watchedPickupPointId &&
      watchedPickupPointId !== originalRecord.pickupPointId
    ) {
      changes.push({
        field: "pickupPointId",
        label: "Pickup Boarding Point",
        oldValue: originalPickup
          ? `${originalPickup.name}${originalPickup.estimatedTime ? ` (${originalPickup.estimatedTime})` : ""}`
          : originalRecord.pickupPointId,
        newValue: newPickup
          ? `${newPickup.name}${newPickup.estimatedTime ? ` (${newPickup.estimatedTime})` : ""}`
          : watchedPickupPointId,
        icon: <Clock className="size-3.5 text-[#2563EB]" />,
      });
    }

    // 3. Check Transportation Type change
    if (
      watchedTransportType &&
      watchedTransportType !== originalRecord.transportationType
    ) {
      changes.push({
        field: "transportationType",
        label: "Transportation Type",
        oldValue: originalRecord.transportationType.toUpperCase(),
        newValue: watchedTransportType.toUpperCase(),
        icon: <Bus className="size-3.5 text-[#2563EB]" />,
      });
    }

    // 4. Check Vehicle Number change
    const oldVeh = originalRecord.vehicleNumber?.trim() || "";
    const newVeh = watchedVehicleNumber?.trim() || "";
    if (newVeh && newVeh !== oldVeh) {
      changes.push({
        field: "vehicleNumber",
        label: "Designated Vehicle",
        oldValue: oldVeh || "None specified",
        newValue: newVeh,
        icon: <Bus className="size-3.5 text-[#2563EB]" />,
      });
    }

    return changes;
  }, [
    originalRecord,
    watchedRouteId,
    watchedPickupPointId,
    watchedTransportType,
    watchedVehicleNumber,
    originalRoute,
    selectedRoute,
    originalPickup,
    newPickup,
  ]);

  const hasChanges = diffItems.length > 0;

  // Step 1: Open Confirmation Modal when Submit is clicked
  const handlePreSubmit = (values: EditFormValues) => {
    if (!hasChanges) {
      setErrorMessage("No changes detected. Modify at least one field to submit updates.");
      return;
    }
    setErrorMessage(null);
    setIsConfirmModalOpen(true);
  };

  // Step 2: Confirmed in modal -> Send PATCH /api/transport/me
  const handleExecuteSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const formValues = form.getValues();

    try {
      // SECURITY: Student cannot send studentId or status in payload.
      // Backend automatically sets status: 'PENDING' for admin verification.
      const response = await fetch("/api/transport/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: formValues.routeId,
          pickupPointId: formValues.pickupPointId,
          transportationType: formValues.transportationType,
          vehicleNumber: formValues.vehicleNumber || undefined,
        }),
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setIsConfirmModalOpen(false);
        setUpdatedRecord(json.data);
        setSubmissionSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMessage(json.error || "Failed to update transportation details.");
      }
    } catch {
      setErrorMessage("Network communication error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form back to original record values
  const handleResetToOriginal = () => {
    if (!originalRecord) return;
    reset({
      routeId: originalRecord.routeId,
      pickupPointId: originalRecord.pickupPointId,
      transportationType: originalRecord.transportationType,
      vehicleNumber: originalRecord.vehicleNumber || "",
    });
    setErrorMessage(null);
  };

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header student={student} registration={originalRecord} routes={routes} />
        <div className="flex min-h-[500px] flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-[#2563EB]" />
          <p className="text-xs text-[#64748B]">Loading your transportation records...</p>
        </div>
      </div>
    );
  }

  // ─── Submission Result State (Post-Submit Confirmation) ───────────────────
  if (submissionSuccess && updatedRecord) {
    const finalRoute = routes.find((r) => r.id === updatedRecord.routeId);
    const finalPickup = finalRoute?.pickupPoints.find(
      (p) => p.id === updatedRecord.pickupPointId
    );

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Header student={student} registration={updatedRecord} routes={routes} />

        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto w-full space-y-6">
          <Card className="border-[#E2E8F0] shadow-md rounded-2xl overflow-hidden bg-white">
            <div className="h-2 bg-gradient-to-r from-[#2563EB] to-[#F59E0B]" />

            <CardContent className="p-6 sm:p-8 text-center space-y-6">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                <CheckCircle2 className="size-9" />
              </div>

              {/* Required Exact Headings */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                  Changes Submitted
                </h1>
                <p className="mx-auto max-w-lg text-sm text-[#64748B] leading-relaxed">
                  Your updated transportation details have been submitted for admin verification.
                </p>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Current Status:
                </span>
                <Badge className="bg-[#F59E0B]/20 text-[#B45309] border-[#F59E0B]/30 px-3 py-1 font-bold text-xs flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  PENDING ADMIN VERIFICATION
                </Badge>
              </div>

              {/* Workflow Stepper Illustration */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs space-y-3 text-left">
                <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
                  Institutional Verification Workflow
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-white border border-[#E2E8F0] p-2.5 space-y-1">
                    <span className="text-[10px] text-[#64748B] block font-semibold">1. PREVIOUS</span>
                    <span className="font-bold text-slate-500">APPROVED</span>
                  </div>
                  <div className="rounded-lg bg-white border border-[#E2E8F0] p-2.5 space-y-1">
                    <span className="text-[10px] text-[#64748B] block font-semibold">2. EDITED</span>
                    <span className="font-bold text-[#2563EB]">CHANGES SUBMITTED</span>
                  </div>
                  <div className="rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 p-2.5 space-y-1 ring-2 ring-[#F59E0B]/20">
                    <span className="text-[10px] text-[#B45309] block font-bold">3. CURRENT</span>
                    <span className="font-bold text-[#B45309]">PENDING VERIFICATION</span>
                  </div>
                  <div className="rounded-lg bg-white border border-[#E2E8F0] p-2.5 space-y-1">
                    <span className="text-[10px] text-[#64748B] block font-semibold">4. FINAL</span>
                    <span className="font-bold text-slate-400">ADMIN APPROVAL</span>
                  </div>
                </div>
              </div>

              {/* Updated Record Summary */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs space-y-2.5 text-left">
                <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Transportation ID:</span>
                  <code className="font-mono font-bold text-[#2563EB]">{updatedRecord.id}</code>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Requested Route:</span>
                  <span className="font-semibold text-[#0F172A]">{finalRoute?.name || updatedRecord.routeId}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Requested Pickup Stop:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {finalPickup ? `${finalPickup.name} (${finalPickup.estimatedTime})` : updatedRecord.pickupPointId}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#64748B]">Transportation Type:</span>
                  <span className="font-semibold text-[#0F172A] uppercase">{updatedRecord.transportationType}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/id-card" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl h-11 px-6 shadow-md shadow-[#2563EB]/20">
                    View My Transportation ID
                  </Button>
                </Link>

                <Link href="/" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] rounded-xl h-11 px-5 text-xs font-semibold"
                  >
                    Return to Portal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ─── Active Edit Form State ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Header student={student} registration={originalRecord} routes={routes} />

      {/* ── Main Container (Centered, max 1000px, responsive) ─────────── */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto w-full space-y-6">
        {/* ── Page Header (Exact prompt specification) ──────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
          <div>
            <Link
              href="/id-card"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline mb-2"
            >
              <ArrowLeft className="size-3.5" /> Back to My Transportation ID
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Edit Transportation Details
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Update your transportation information. Changes may require admin verification.
            </p>
          </div>

          {originalRecord && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-[#64748B]">Pass ID:</span>
              <code className="font-mono text-xs font-bold text-[#2563EB] bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-xl">
                {originalRecord.id}
              </code>
            </div>
          )}
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="rounded-2xl border border-[#DC2626]/20 bg-[#DC2626]/5 p-4 text-xs sm:text-sm text-[#DC2626] flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0" />
            <p className="font-semibold">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(handlePreSubmit)} className="space-y-6">
          {/* ── SECTION 1: Student Information (Read-Only) ──────────────── */}
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
                      Protected identity fields synced with registrar ERP (non-editable)
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs text-[#64748B]">
                  <Lock className="size-3 text-[#2563EB]" />
                  <span>Locked</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#64748B] flex items-center gap-1">
                    <User className="size-3 text-[#64748B]" /> Full Name
                  </Label>
                  <Input
                    readOnly
                    value={student?.fullName || ""}
                    className="bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] font-medium cursor-not-allowed text-xs h-10 rounded-xl"
                  />
                </div>

                {/* Student ID */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#64748B] flex items-center gap-1">
                    <GraduationCap className="size-3 text-[#64748B]" /> Student ID / PRN
                  </Label>
                  <Input
                    readOnly
                    value={student?.studentId || ""}
                    className="bg-[#F8FAFC] border-[#E2E8F0] font-mono text-[#2563EB] font-bold cursor-not-allowed text-xs h-10 rounded-xl"
                  />
                </div>

                {/* College Email */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#64748B]">College Email</Label>
                  <Input
                    readOnly
                    value={student?.email || ""}
                    className="bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] cursor-not-allowed text-xs h-10 rounded-xl"
                  />
                </div>

                {/* Class */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#64748B]">Class</Label>
                  <Input
                    readOnly
                    value={student?.className || ""}
                    className="bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] cursor-not-allowed text-xs h-10 rounded-xl"
                  />
                </div>

                {/* Branch */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#64748B]">Branch</Label>
                  <Input
                    readOnly
                    value={student?.branch || ""}
                    className="bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] cursor-not-allowed text-xs h-10 rounded-xl"
                  />
                </div>

                {/* Academic Year */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#64748B]">Academic Year</Label>
                  <Input
                    readOnly
                    value={student?.academicYear || ""}
                    className="bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] cursor-not-allowed text-xs h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-[#0284C7]/5 border border-[#0284C7]/15 p-3 text-xs text-[#0284C7]">
                <Info className="size-4 shrink-0" />
                <span>
                  Protected fields are locked to safeguard student records. To rectify spelling or department, submit identity verification to the Registrar.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 2: Transportation Information (Editable) ────────── */}
          <Card className="border-[#E2E8F0] shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                    <Bus className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold text-[#0F172A]">
                      Transportation Information
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-[#64748B]">
                      Modify your commuter route and designated boarding stop
                    </CardDescription>
                  </div>
                </div>

                <span className="text-xs font-semibold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-1 rounded-lg">
                  Editable Fields
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-6">
              {/* Institutional notice on pass approval invalidation */}
              <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-3.5 text-xs text-[#0F172A] flex items-start gap-2.5">
                <AlertTriangle className="size-4 text-[#B45309] shrink-0 mt-0.5" />
                <p className="text-[#0F172A]/85 leading-relaxed text-[11px] sm:text-xs">
                  <strong>Notice on Route Adjustments:</strong> Changing your commuting route or pickup point requires administrative verification to confirm bus capacity. Upon submitting, your pass transitions to <strong>PENDING ADMIN VERIFICATION</strong>.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Route Dropdown */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs sm:text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <MapPin className="size-4 text-[#2563EB]" />
                      <span>Route</span>
                      <span className="text-[#DC2626]">*</span>
                    </Label>
                    {watchedRouteId !== originalRecord?.routeId && (
                      <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]">
                        MODIFIED
                      </span>
                    )}
                  </div>

                  <select
                    value={watchedRouteId}
                    onChange={(e) => handleRouteChange(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs sm:text-sm text-[#0F172A] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    <option value="">Select an institutional route...</option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  {errors.routeId && (
                    <p className="text-xs text-[#DC2626]">{errors.routeId.message}</p>
                  )}
                </div>

                {/* Pickup Point Dropdown */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs sm:text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <Clock className="size-4 text-[#2563EB]" />
                      <span>Pickup Point</span>
                      <span className="text-[#DC2626]">*</span>
                    </Label>
                    {watchedPickupPointId !== originalRecord?.pickupPointId && (
                      <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]">
                        MODIFIED
                      </span>
                    )}
                  </div>

                  <select
                    value={watchedPickupPointId}
                    disabled={!selectedRoute}
                    onChange={(e) =>
                      setValue("pickupPointId", e.target.value, { shouldValidate: true })
                    }
                    className="flex h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs sm:text-sm text-[#0F172A] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:bg-[#F8FAFC] disabled:opacity-60"
                  >
                    <option value="">
                      {selectedRoute
                        ? "Select your pickup boarding stop..."
                        : "Select a route first"}
                    </option>
                    {selectedRoute?.pickupPoints.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.estimatedTime ? `(${p.estimatedTime})` : ""}
                        {p.landmark ? ` — ${p.landmark}` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.pickupPointId && (
                    <p className="text-xs text-[#DC2626]">
                      {errors.pickupPointId.message}
                    </p>
                  )}
                </div>

                {/* Transportation Type */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs sm:text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <Bus className="size-4 text-[#2563EB]" />
                      <span>Transportation Type</span>
                    </Label>
                    {watchedTransportType !== originalRecord?.transportationType && (
                      <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]">
                        MODIFIED
                      </span>
                    )}
                  </div>

                  <select
                    value={watchedTransportType}
                    onChange={(e) =>
                      setValue(
                        "transportationType",
                        e.target.value as TransportationType,
                        { shouldValidate: true }
                      )
                    }
                    className="flex h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs sm:text-sm text-[#0F172A] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    <option value="bus">College Regular Bus (42-Seater)</option>
                    <option value="van">College Campus Mini-Van (Express)</option>
                    <option value="shuttle">Metro Connection Campus Shuttle</option>
                  </select>
                </div>

                {/* Bus / Vehicle Number */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs sm:text-sm font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <Bus className="size-4 text-[#64748B]" />
                      <span>Bus / Vehicle Number</span>
                    </Label>
                    {watchedVehicleNumber !== (originalRecord?.vehicleNumber || "") && (
                      <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]">
                        MODIFIED
                      </span>
                    )}
                  </div>

                  <Input
                    {...register("vehicleNumber")}
                    placeholder="e.g. MH-12-TR-1005"
                    className="border-[#E2E8F0] text-xs sm:text-sm h-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Read-Only Protected Transportation Attributes (Cannot be modified by student) */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2">
                  <Lock className="size-3.5 text-[#64748B]" />
                  <span>Protected Pass Attributes (Admin Controlled Only)</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <span className="text-[#64748B] block">Transportation ID:</span>
                    <code className="font-mono font-bold text-[#2563EB]">
                      {originalRecord?.id || "N/A"}
                    </code>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[#64748B] block">Approval Status:</span>
                    <Badge className="bg-[#16A34A]/15 text-[#16A34A] border-[#16A34A]/30 text-[10px] font-bold">
                      {originalRecord?.status || "PENDING"}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[#64748B] block">Admin Verification Status:</span>
                    <span className="font-semibold text-[#0F172A]">
                      {originalRecord?.status === "APPROVED" ? "VERIFIED" : "PENDING"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 3: Payment Information (Read-Only) ──────────────── */}
          <Card className="border-[#E2E8F0] shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                    <CreditCard className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold text-[#0F172A]">
                      Payment & Fee Clearance
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-[#64748B]">
                      Official payment clearance is governed exclusively by College Accounts Administration
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs text-[#64748B]">
                  <Lock className="size-3 text-[#2563EB]" />
                  <span>Read-Only</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 space-y-1">
                  <span className="text-[#64748B] font-medium">Payment Status:</span>
                  <div className="pt-0.5">
                    <Badge className="bg-[#16A34A]/15 text-[#16A34A] border-[#16A34A]/30 text-xs font-bold">
                      {originalRecord?.paymentClaim?.officialStatus === "VERIFIED"
                        ? "PAID / VERIFIED"
                        : "PARTIALLY PAID / PENDING"}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 space-y-1">
                  <span className="text-[#64748B] font-medium">Transaction Reference:</span>
                  <p className="font-mono font-bold text-[#0F172A] truncate">
                    {originalRecord?.paymentClaim?.transactionRef || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 space-y-1">
                  <span className="text-[#64748B] font-medium">Payment Mode:</span>
                  <p className="font-bold text-[#0F172A]">
                    {originalRecord?.paymentClaim?.paymentMode || "UPI"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 space-y-1">
                  <span className="text-[#64748B] font-medium">Clearance Amount:</span>
                  <p className="font-bold text-[#0F172A]">
                    ₹{originalRecord?.paymentClaim?.claimedAmount || "18000"} (Annual)
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-[#64748B] italic">
                * Students cannot change official payment values. If payment adjustment is required due to route tier difference, contact the Accounts Division.
              </p>
            </CardContent>
          </Card>

          {/* ── SECTION 4: Live Change Summary (Prompt Specification) ───── */}
          {hasChanges && (
            <div className="rounded-2xl border-2 border-[#2563EB]/25 bg-[#EFF6FF]/60 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-[#2563EB]" />
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    Changes to be submitted:
                  </h4>
                </div>
                <span className="text-xs font-semibold text-[#2563EB] bg-white border border-[#BFDBFE] px-2.5 py-0.5 rounded-full">
                  {diffItems.length} field{diffItems.length > 1 ? "s" : ""} modified
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {diffItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-xl bg-white border border-[#BFDBFE] p-3"
                  >
                    <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                      {item.icon}
                      {item.label}:
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-[#64748B] line-through">{item.oldValue}</span>
                      <ArrowRight className="size-3 text-[#2563EB] shrink-0" />
                      <span className="font-bold text-[#2563EB]">{item.newValue}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-[#1E40AF]">
                Review the changes above. When you submit, the transportation admin desk will verify seat availability on the requested route.
              </p>
            </div>
          )}

          {/* ── SECTION 5: Form Submission CTA ──────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/id-card" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full sm:w-auto rounded-xl border-[#E2E8F0] text-xs h-11 px-5 font-semibold"
                >
                  Cancel
                </Button>
              </Link>

              {hasChanges && (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={handleResetToOriginal}
                  className="rounded-xl text-xs h-11 px-4 text-[#64748B] hover:text-[#0F172A] flex items-center gap-1.5"
                >
                  <RotateCcw className="size-3.5" />
                  Discard Changes
                </Button>
              )}
            </div>

            <Button
              type="submit"
              disabled={!hasChanges}
              className="w-full sm:w-auto min-w-[240px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl h-12 px-6 shadow-lg shadow-[#2563EB]/25 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileEdit className="size-4" />
              Submit Changes
            </Button>
          </div>
        </form>
      </main>

      {/* ── Confirmation Modal (Field-by-Field Diff) ──────────────────── */}
      <ConfirmChangesModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleExecuteSubmit}
        isSubmitting={isSubmitting}
        diffItems={diffItems}
        currentStatus={originalRecord?.status || "APPROVED"}
      />
    </div>
  );
}
