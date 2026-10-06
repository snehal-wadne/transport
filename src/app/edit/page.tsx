"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bus,
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  User,
  GraduationCap,
  Save,
} from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { StudentProfile, TransportRegistrationRecord, TransportRoute, TransportationType } from "@/lib/types";

export default function EditTransportationPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [registration, setRegistration] = useState<TransportRegistrationRecord | null>(null);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedPickupPointId, setSelectedPickupPointId] = useState("");
  const [transportType, setTransportType] = useState<TransportationType>("bus");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load authenticated student data and routes
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [studentRes, regRes, routesRes] = await Promise.all([
          fetch("/api/students/me"),
          fetch("/api/transport/me"),
          fetch("/api/routes"),
        ]);

        const studentData = await studentRes.json();
        const regData = await regRes.json();
        const routesData = await routesRes.json();

        if (studentData.success && studentData.data) {
          setStudent(studentData.data);
        }

        if (routesData.success && routesData.data) {
          setRoutes(routesData.data);
        }

        if (regData.success && regData.data) {
          const r = regData.data as TransportRegistrationRecord;
          setRegistration(r);
          setSelectedRouteId(r.routeId);
          setSelectedPickupPointId(r.pickupPointId);
          setTransportType(r.transportationType);
          setVehicleNumber(r.vehicleNumber || "");
        }
      } catch (err) {
        console.error("Failed to load details:", err);
        setErrorMessage("Error retrieving your transportation record.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    if (!selectedRouteId || !selectedPickupPointId) {
      setErrorMessage("Please select both a route and a pickup point.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/transport/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: selectedRouteId,
          pickupPointId: selectedPickupPointId,
          transportationType: transportType,
          vehicleNumber: vehicleNumber || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSaveSuccess(true);
        setRegistration(json.data);
        setTimeout(() => {
          router.push("/id-card");
        }, 1200);
      } else {
        setErrorMessage(json.error || "Failed to update transportation details.");
      }
    } catch {
      setErrorMessage("Network error while saving details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header student={student} registration={registration} routes={routes} />
        <div className="flex min-h-[500px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#2563EB]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header student={student} registration={registration} routes={routes} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto w-full space-y-6">
        {/* Back Link & Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/id-card"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline mb-2"
            >
              <ArrowLeft className="size-3.5" /> Back to My Transportation ID
            </Link>
            <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
              Edit Transportation Details
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Modify your designated commuting route and boarding stop. Student identity credentials remain locked.
            </p>
          </div>
        </div>

        {/* Success notification */}
        {saveSuccess && (
          <div className="rounded-2xl border border-[#16A34A]/20 bg-[#16A34A]/10 p-4 text-xs sm:text-sm text-[#16A34A] flex items-center gap-3">
            <CheckCircle2 className="size-5 shrink-0" />
            <p className="font-semibold">
              Transportation details updated successfully! Redirecting to ID card...
            </p>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="rounded-2xl border border-[#DC2626]/20 bg-[#DC2626]/5 p-4 text-xs sm:text-sm text-[#DC2626] flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0" />
            <p className="font-semibold">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Card 1: Protected Student Profile */}
          <Card className="border-[#E2E8F0] shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <User className="size-4 text-[#2563EB]" />
                  <CardTitle className="text-sm sm:text-base font-bold text-[#0F172A]">
                    Student Identity (Non-Editable)
                  </CardTitle>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-medium text-[#64748B] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded-lg">
                  <Lock className="size-3 text-[#2563EB]" /> Tamper-Proof
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs text-[#64748B]">Full Name</Label>
                  <Input
                    readOnly
                    value={student?.fullName || ""}
                    className="bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] cursor-not-allowed text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[#64748B]">Student PRN</Label>
                  <Input
                    readOnly
                    value={student?.studentId || ""}
                    className="bg-[#F8FAFC] border-[#E2E8F0] font-mono text-[#2563EB] font-bold cursor-not-allowed text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[#64748B]">Class & Branch</Label>
                  <Input
                    readOnly
                    value={`${student?.className} - ${student?.branch}`}
                    className="bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] cursor-not-allowed text-xs h-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Editable Commuting Preferences */}
          <Card className="border-[#E2E8F0] shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <div className="flex items-center gap-2.5">
                <Bus className="size-4 text-[#2563EB]" />
                <CardTitle className="text-sm sm:text-base font-bold text-[#0F172A]">
                  Update Commuting Route & Boarding Stop
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-[#64748B]">
                Changes will be reviewed by the transportation coordinator.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Route selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1">
                    <MapPin className="size-3.5 text-[#2563EB]" /> Route
                  </Label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => {
                      setSelectedRouteId(e.target.value);
                      setSelectedPickupPointId("");
                    }}
                    className="flex h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    <option value="">Select Route...</option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pickup point selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1">
                    <Clock className="size-3.5 text-[#2563EB]" /> Pickup Boarding Point
                  </Label>
                  <select
                    value={selectedPickupPointId}
                    disabled={!selectedRoute}
                    onChange={(e) => setSelectedPickupPointId(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:bg-[#F8FAFC]"
                  >
                    <option value="">
                      {selectedRoute ? "Select Pickup Point..." : "Select route first"}
                    </option>
                    {selectedRoute?.pickupPoints.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.estimatedTime ? `(${p.estimatedTime})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transport Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0F172A]">Transportation Type</Label>
                  <select
                    value={transportType}
                    onChange={(e) => setTransportType(e.target.value as TransportationType)}
                    className="flex h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    <option value="bus">College Regular Bus</option>
                    <option value="van">Campus Mini-Van</option>
                    <option value="shuttle">Metro Connection Campus Shuttle</option>
                  </select>
                </div>

                {/* Vehicle Number */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0F172A]">Allocated Bus Number</Label>
                  <Input
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. MH-12-TR-1005"
                    className="border-[#E2E8F0] text-xs h-10 rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/id-card">
              <Button variant="outline" type="button" className="rounded-xl border-[#E2E8F0] text-xs h-10 px-5">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs h-10 px-6 font-semibold flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Transportation Details
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
