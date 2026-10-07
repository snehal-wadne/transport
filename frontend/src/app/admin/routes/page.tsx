"use client";

import { useEffect, useState } from "react";
import {
  Route,
  Bus,
  Plus,
  MapPin,
  Clock,
  Phone,
  User,
  CheckCircle2,
  Trash2,
  ChevronDown,
  Navigation,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";
import type { TransportRoute } from "@/lib/types";
import { toast } from "sonner";

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Route Modal state
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [newRouteName, setNewRouteName] = useState("");
  const [newRouteCode, setNewRouteCode] = useState("");
  const [newBusNumber, setNewBusNumber] = useState("");
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverContact, setNewDriverContact] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmittingRoute, setIsSubmittingRoute] = useState(false);

  // Manage Stops Modal state
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);
  const [isStopsModalOpen, setIsStopsModalOpen] = useState(false);
  const [newStopName, setNewStopName] = useState("");
  const [newStopLandmark, setNewStopLandmark] = useState("");
  const [newStopTime, setNewStopTime] = useState("07:30 AM");
  const [isAddingStop, setIsAddingStop] = useState(false);

  const loadRoutes = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.routes.getAll();
      setRoutes(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load routes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName || !newRouteCode || !newBusNumber) {
      toast.error("Please fill in required route details");
      return;
    }

    setIsSubmittingRoute(true);
    try {
      await apiClient.admin.createRoute({
        name: newRouteName,
        routeCode: newRouteCode,
        busNumber: newBusNumber,
        driverName: newDriverName || "Assigned Driver",
        driverContact: newDriverContact || "+91 98220 00000",
        description: newDescription,
      });

      toast.success(`Route ${newRouteCode} added successfully!`);
      setIsAddRouteOpen(false);
      setNewRouteName("");
      setNewRouteCode("");
      setNewBusNumber("");
      setNewDriverName("");
      setNewDriverContact("");
      setNewDescription("");
      loadRoutes();
    } catch {
      toast.error("Failed to create route");
    } finally {
      setIsSubmittingRoute(false);
    }
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute || !newStopName) {
      toast.error("Stop name is required");
      return;
    }

    setIsAddingStop(true);
    try {
      await apiClient.admin.addPickupPoint(selectedRoute.id, {
        name: newStopName,
        landmark: newStopLandmark,
        estimatedTime: newStopTime,
      });

      toast.success(`Pickup point added to ${selectedRoute.routeCode}`);
      setNewStopName("");
      setNewStopLandmark("");
      setNewStopTime("07:30 AM");
      loadRoutes();

      // Refresh current selected route
      const updatedList = await apiClient.routes.getAll();
      const refetched = updatedList.find((r) => r.id === selectedRoute.id);
      if (refetched) setSelectedRoute(refetched);
    } catch {
      toast.error("Failed to add stop");
    } finally {
      setIsAddingStop(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Bus Fleet & Routes Management
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Configure college transit routes, manage designated pickup stops, and monitor driver fleet allocations.
          </p>
        </div>
        <Button
          onClick={() => setIsAddRouteOpen(true)}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl h-10 shadow-xs cursor-pointer"
        >
          <Plus className="mr-1.5 size-4" />
          Add New Route
        </Button>
      </div>

      {/* ── Routes Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Array.isArray(routes) ? routes : []).map((route) => (
          <Card key={route.id} className="rounded-2xl border-[#E2E8F0] shadow-xs flex flex-col justify-between">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20 text-xs font-mono font-bold">
                  {route.routeCode}
                </Badge>
                <span className="text-xs text-[#16A34A] font-semibold bg-[#16A34A]/10 px-2.5 py-0.5 rounded-full">
                  Active Fleet Route
                </span>
              </div>
              <CardTitle className="text-base font-bold text-[#0F172A] mt-2">
                {route.name}
              </CardTitle>
              {route.description && (
                <CardDescription className="text-xs text-[#64748B]">
                  {route.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4">
              {/* Vehicle & Driver Card */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748B]">
                    Assigned Bus
                  </span>
                  <p className="font-mono font-bold text-[#0F172A] mt-0.5">
                    {route.busNumber || "Pool Reserve"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748B]">
                    Driver Contact
                  </span>
                  <p className="font-semibold text-[#0F172A] mt-0.5 truncate">
                    {route.driverName}
                  </p>
                  <p className="text-[11px] text-[#64748B] font-mono">
                    {route.driverContact}
                  </p>
                </div>
              </div>

              {/* Designated Stops Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-[#2563EB]" />
                    Designated Pickup Points ({route.pickupPoints?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoute(route);
                      setIsStopsModalOpen(true);
                    }}
                    className="text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Edit / Add Stops
                  </button>
                </div>

                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {(route.pickupPoints || []).map((point, idx) => (
                    <div
                      key={point.id}
                      className="flex items-center justify-between rounded-lg bg-white border border-[#E2E8F0] px-3 py-1.5 text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex size-4.5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-[#64748B]">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-[#0F172A]">{point.name}</span>
                          {point.landmark && (
                            <span className="text-[10px] text-[#64748B] ml-1">
                              ({point.landmark})
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-[#2563EB]">
                        {point.estimatedTime || "07:30 AM"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Add New Route Dialog ─────────────────────────────────────────── */}
      <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
        <DialogContent className="max-w-md rounded-2xl border-[#E2E8F0]">
          <form onSubmit={handleCreateRoute}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#0F172A]">
                Create Transit Route
              </DialogTitle>
              <DialogDescription className="text-xs text-[#64748B]">
                Register a new college bus route into the transport dispatch system.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div>
                <Label className="text-xs font-semibold text-[#0F172A]">Route Name *</Label>
                <Input
                  placeholder="e.g. Route 6 — Viman Nagar & Kalyani Nagar"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="mt-1 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-[#0F172A]">Route Code *</Label>
                  <Input
                    placeholder="e.g. R-06-VN"
                    value={newRouteCode}
                    onChange={(e) => setNewRouteCode(e.target.value)}
                    className="mt-1 text-xs rounded-xl font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-[#0F172A]">Bus Number *</Label>
                  <Input
                    placeholder="e.g. MH-12-TR-1006"
                    value={newBusNumber}
                    onChange={(e) => setNewBusNumber(e.target.value)}
                    className="mt-1 text-xs rounded-xl font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-[#0F172A]">Driver Name</Label>
                  <Input
                    placeholder="e.g. Mr. Ganesh Patil"
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    className="mt-1 text-xs rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-[#0F172A]">Driver Phone</Label>
                  <Input
                    placeholder="e.g. +91 98220 12345"
                    value={newDriverContact}
                    onChange={(e) => setNewDriverContact(e.target.value)}
                    className="mt-1 text-xs rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-[#0F172A]">Description / Key Stops</Label>
                <Input
                  placeholder="e.g. Via Phoenix Mall, Shastri Nagar, Yerawada"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="mt-1 text-xs rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-[#E2E8F0]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddRouteOpen(false)}
                className="text-xs h-9 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingRoute}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs h-9 px-4 rounded-xl cursor-pointer"
              >
                {isSubmittingRoute ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Create Route"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Manage Stops Dialog ─────────────────────────────────────────── */}
      <Dialog open={isStopsModalOpen} onOpenChange={setIsStopsModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-[#E2E8F0]">
          {selectedRoute && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-[#0F172A]">
                  Pickup Stops: {selectedRoute.name}
                </DialogTitle>
                <DialogDescription className="text-xs font-mono text-[#2563EB]">
                  Route Code: {selectedRoute.routeCode}
                </DialogDescription>
              </DialogHeader>

              {/* Existing Stops List */}
              <div className="space-y-2 py-2 max-h-48 overflow-y-auto">
                <span className="text-xs font-bold text-[#0F172A]">
                  Current Stops ({selectedRoute.pickupPoints.length}):
                </span>
                {selectedRoute.pickupPoints.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-2 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#0F172A]">
                        {idx + 1}. {p.name}
                      </span>
                      {p.landmark && (
                        <p className="text-[11px] text-[#64748B]">{p.landmark}</p>
                      )}
                    </div>
                    <span className="font-mono text-[11px] font-bold text-[#2563EB]">
                      {p.estimatedTime}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add New Stop Form */}
              <form onSubmit={handleAddStop} className="rounded-xl border border-[#2563EB]/20 bg-[#2563EB]/5 p-3 space-y-2 text-xs">
                <span className="font-bold text-[#2563EB]">Add New Pickup Stop:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] font-semibold text-[#0F172A]">Stop Name *</Label>
                    <Input
                      placeholder="e.g. Swargate Chowk"
                      value={newStopName}
                      onChange={(e) => setNewStopName(e.target.value)}
                      className="text-xs rounded-lg mt-0.5 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold text-[#0F172A]">Time *</Label>
                    <Input
                      placeholder="e.g. 07:15 AM"
                      value={newStopTime}
                      onChange={(e) => setNewStopTime(e.target.value)}
                      className="text-xs rounded-lg mt-0.5 bg-white font-mono"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[11px] font-semibold text-[#0F172A]">Landmark</Label>
                  <Input
                    placeholder="e.g. Near Metro Station Pillar 42"
                    value={newStopLandmark}
                    onChange={(e) => setNewStopLandmark(e.target.value)}
                    className="text-xs rounded-lg mt-0.5 bg-white"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    disabled={isAddingStop}
                    size="sm"
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs h-8 px-3 rounded-lg cursor-pointer"
                  >
                    {isAddingStop ? <Loader2 className="size-3 animate-spin" /> : "Add Stop"}
                  </Button>
                </div>
              </form>

              <DialogFooter className="pt-2 border-t border-[#E2E8F0]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsStopsModalOpen(false)}
                  className="text-xs h-9 rounded-xl"
                >
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
