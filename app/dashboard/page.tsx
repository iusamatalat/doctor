"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  User, MapPin, Stethoscope, Video, Building2, Bot, Calendar, Clock,
  CheckCircle, X, Plus, Save, Bell, TrendingUp, Users, Star, MessageSquare,
  Settings, LayoutDashboard, ChevronRight, Loader2, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { specializations, cities } from "@/lib/mockData";
import { cn } from "@/lib/utils";

// The dashboard always manages doctor with _id = "1" (Dr. Sarah Ahmed)
const DASHBOARD_DOCTOR_ID = "1";

type SidebarKey = "overview" | "profile" | "availability" | "appointments" | "settings";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const timeOptions = [
  "08:00 AM","08:30 AM","09:00 AM","09:30 AM","10:00 AM","10:30 AM",
  "11:00 AM","11:30 AM","12:00 PM","12:30 PM","02:00 PM","02:30 PM",
  "03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM","05:30 PM",
];

interface DBDoctor {
  id: string; name: string; specialization: string; location: string;
  city: string; consultationType: "online" | "physical" | "both";
  experience: number; rating: number; reviewCount: number; avatar: string;
  bio: string; education: string[]; languages: string[];
  feeOnline: number; feePhysical: number; isAvailableNow: boolean;
  aiAssistantMode: boolean; weeklySchedule?: Record<string, string[]>;
}

interface DBAppointment {
  id: string; patientName: string; patientPhone: string; patientProblem: string;
  doctorName: string; date: string; time: string; type: "online" | "physical";
  status: "confirmed" | "pending" | "cancelled";
}

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<SidebarKey>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // DB state
  const [doctor, setDoctor] = useState<DBDoctor | null>(null);
  const [appointments, setAppointments] = useState<DBAppointment[]>([]);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Profile form state (synced from DB)
  const [profile, setProfile] = useState({
    name: "", specialization: "", city: "", location: "", bio: "",
    feeOnline: "", feePhysical: "", consultationType: "both" as "online" | "physical" | "both",
  });
  const [aiMode, setAiMode] = useState(false);

  // Availability grid
  const [selectedSlots, setSelectedSlots] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    days.forEach((d) => (init[d] = new Set()));
    return init;
  });
  const [customSlotDay, setCustomSlotDay] = useState("Mon");
  const [customSlotTime, setCustomSlotTime] = useState("09:00 AM");

  // ── Fetch doctor ──────────────────────────────────────────
  const fetchDoctor = useCallback(async () => {
    setLoadingDoctor(true);
    try {
      const res = await fetch(`/api/doctors/${DASHBOARD_DOCTOR_ID}`);
      const data: DBDoctor = await res.json();
      setDoctor(data);
      setAiMode(data.aiAssistantMode);
      setProfile({
        name: data.name, specialization: data.specialization, city: data.city,
        location: data.location, bio: data.bio,
        feeOnline: String(data.feeOnline), feePhysical: String(data.feePhysical),
        consultationType: data.consultationType,
      });
      // Restore weekly schedule from DB
      if (data.weeklySchedule) {
        const restored: Record<string, Set<string>> = {};
        days.forEach((d) => {
          restored[d] = new Set(data.weeklySchedule?.[d] || []);
        });
        setSelectedSlots(restored);
      }
    } catch {
      setSaveMsg("Could not load doctor data.");
    } finally {
      setLoadingDoctor(false);
    }
  }, []);

  // ── Fetch appointments ────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    setLoadingAppts(true);
    try {
      const res = await fetch(`/api/appointments?doctorId=${DASHBOARD_DOCTOR_ID}`);
      const data = await res.json();
      if (Array.isArray(data)) setAppointments(data);
    } catch { }
    finally { setLoadingAppts(false); }
  }, []);

  useEffect(() => { fetchDoctor(); fetchAppointments(); }, [fetchDoctor, fetchAppointments]);

  // ── Save profile ──────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true); setSaveMsg("");
    try {
      await fetch(`/api/doctors/${DASHBOARD_DOCTOR_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name, specialization: profile.specialization,
          city: profile.city, location: profile.location, bio: profile.bio,
          feeOnline: Number(profile.feeOnline), feePhysical: Number(profile.feePhysical),
          consultationType: profile.consultationType,
        }),
      });
      setSaveMsg("Profile saved!");
      await fetchDoctor();
    } catch { setSaveMsg("Save failed. Try again."); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(""), 3000); }
  };

  // ── Toggle AI mode ────────────────────────────────────────
  const handleAIToggle = async (val: boolean) => {
    setAiMode(val);
    await fetch(`/api/doctors/${DASHBOARD_DOCTOR_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiAssistantMode: val }),
    }).catch(() => {});
  };

  // ── Save schedule ─────────────────────────────────────────
  const handleSaveSchedule = async () => {
    setSaving(true); setSaveMsg("");
    const weeklySchedule: Record<string, string[]> = {};
    days.forEach((d) => { weeklySchedule[d] = [...selectedSlots[d]]; });
    try {
      await fetch(`/api/doctors/${DASHBOARD_DOCTOR_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklySchedule }),
      });
      setSaveMsg("Schedule saved!");
    } catch { setSaveMsg("Save failed."); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(""), 3000); }
  };

  // ── Update appointment status ─────────────────────────────
  const handleApptStatus = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchAppointments();
  };

  const toggleSlot = (day: string, time: string) => {
    setSelectedSlots((prev) => {
      const copy = { ...prev };
      const s = new Set(copy[day]);
      s.has(time) ? s.delete(time) : s.add(time);
      copy[day] = s;
      return copy;
    });
  };

  const totalSlots = Object.values(selectedSlots).reduce((a, s) => a + s.size, 0);
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  const navItems: { key: SidebarKey; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "profile", label: "My Profile", icon: User },
    { key: "availability", label: "Availability", icon: Calendar },
    { key: "appointments", label: "Appointments", icon: Clock },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  const avatar = doctor?.avatar || "https://ui-avatars.com/api/?name=Doctor&background=0ea5e9&color=fff&size=80";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 md:top-16 h-screen md:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 z-40 flex flex-col transition-transform duration-300 shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl overflow-hidden ring-2 ring-slate-100">
                <Image src={avatar} alt="Doctor" width={40} height={40} className="h-full w-full object-cover" />
              </div>
              {aiMode && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-white">
                  <Bot className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{doctor?.name || "Loading..."}</p>
              <p className="text-xs text-slate-500 truncate">{doctor?.specialization || ""}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setActiveSection(key); setSidebarOpen(false); }}
              className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                activeSection === key ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {key === "appointments" && appointments.length > 0 && (
                <span className="ml-auto h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {appointments.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* AI Toggle in Sidebar */}
        <div className="p-4 border-t border-slate-100">
          <div className={cn("flex items-center justify-between p-3 rounded-xl border transition-colors", aiMode ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200")}>
            <div className="flex items-center gap-2">
              <Bot className={cn("h-4 w-4", aiMode ? "text-blue-600" : "text-slate-400")} />
              <div>
                <p className="text-xs font-semibold text-slate-700">AI Assistant</p>
                <p className="text-[10px] text-slate-500">{aiMode ? "Active" : "Offline"}</p>
              </div>
            </div>
            <Switch checked={aiMode} onCheckedChange={handleAIToggle} />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex items-center gap-3 sticky top-16 z-20">
          <button className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
            <LayoutDashboard className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base md:text-lg font-bold text-slate-900">
              {navItems.find((n) => n.key === activeSection)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {aiMode && <Badge variant="default" className="text-xs gap-1 hidden sm:flex"><Bot className="h-3 w-3" />AI Mode On</Badge>}
            {saveMsg && <span className={cn("text-xs font-medium px-2", saveMsg.includes("!") ? "text-emerald-600" : "text-red-500")}>{saveMsg}</span>}
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />}
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6">

          {/* ===== OVERVIEW ===== */}
          {activeSection === "overview" && (
            <div className="space-y-6 animate-fade-in">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Appointments", value: String(appointments.length), icon: Users, color: "text-blue-600 bg-blue-50" },
                  { label: "Confirmed", value: String(confirmedCount), icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
                  { label: "Pending", value: String(pendingCount), icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
                  { label: "Rating", value: doctor ? `${doctor.rating} ★` : "—", icon: Star, color: "text-purple-600 bg-purple-50" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <Card key={label} className="border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-xl font-bold text-slate-900">{value}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Appointments */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" /> Recent Appointments
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <button onClick={fetchAppointments} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                      <button className="text-xs text-blue-600 font-medium flex items-center gap-0.5 hover:underline"
                        onClick={() => setActiveSection("appointments")}>
                        View All <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingAppts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                    </div>
                  ) : appointments.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">No appointments yet. Share your profile to start receiving bookings.</p>
                  ) : appointments.slice(0, 3).map((appt) => (
                    <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                        appt.type === "online" ? "bg-emerald-100" : "bg-blue-100")}>
                        {appt.type === "online" ? <Video className="h-4 w-4 text-emerald-600" /> : <Building2 className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{appt.patientName}</p>
                        <p className="text-xs text-slate-500 truncate">{appt.patientProblem}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-slate-700">{appt.time}</p>
                        <Badge variant={appt.status === "confirmed" ? "success" : appt.status === "pending" ? "warning" : "destructive"}
                          className="text-[10px] mt-0.5 capitalize">{appt.status}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Update Availability", icon: Calendar, section: "availability" as SidebarKey, color: "text-blue-600 bg-blue-50 border-blue-200" },
                  { label: "Edit Profile", icon: User, section: "profile" as SidebarKey, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
                  { label: "Messages", icon: MessageSquare, section: "appointments" as SidebarKey, color: "text-purple-600 bg-purple-50 border-purple-200" },
                ].map(({ label, icon: Icon, section, color }) => (
                  <button key={label} onClick={() => setActiveSection(section)}
                    className={cn("flex items-center gap-3 p-4 rounded-xl border text-left hover:shadow-sm transition-shadow", color)}>
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">{label}</span>
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== PROFILE ===== */}
          {activeSection === "profile" && (
            <div className="space-y-5 animate-fade-in max-w-2xl">
              {loadingDoctor ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 text-blue-500 animate-spin" /></div>
              ) : (
                <Card className="border-slate-200">
                  <CardContent className="p-5 space-y-4">
                    {/* Avatar Row */}
                    <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                      <div className="h-16 w-16 rounded-2xl overflow-hidden ring-2 ring-slate-100 shadow">
                        <Image src={avatar} alt="" width={64} height={64} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{profile.name}</p>
                        <p className="text-sm text-slate-500">{profile.specialization}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Full Name</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="pl-9 h-9 text-sm" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Specialization</Label>
                        <Select value={profile.specialization} onValueChange={(v) => setProfile((p) => ({ ...p, specialization: v }))}>
                          <SelectTrigger className="mt-1 h-9 text-sm"><Stethoscope className="h-4 w-4 text-slate-400 mr-2" /><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {specializations.filter((s) => s !== "All Specializations").map((s) => <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">City</Label>
                        <Select value={profile.city} onValueChange={(v) => setProfile((p) => ({ ...p, city: v }))}>
                          <SelectTrigger className="mt-1 h-9 text-sm"><MapPin className="h-4 w-4 text-slate-400 mr-2" /><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {cities.filter((c) => c !== "All Cities").map((c) => <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Hospital / Clinic</Label>
                        <div className="relative mt-1">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} className="pl-9 h-9 text-sm" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Online Fee (PKR)</Label>
                        <div className="relative mt-1">
                          <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input type="number" value={profile.feeOnline} onChange={(e) => setProfile((p) => ({ ...p, feeOnline: e.target.value }))} className="pl-9 h-9 text-sm" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">In-Clinic Fee (PKR)</Label>
                        <div className="relative mt-1">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input type="number" value={profile.feePhysical} onChange={(e) => setProfile((p) => ({ ...p, feePhysical: e.target.value }))} className="pl-9 h-9 text-sm" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Professional Bio</Label>
                      <Textarea value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} rows={4} className="mt-1 text-sm" />
                    </div>

                    <div>
                      <Label className="text-xs mb-2 block">Consultation Type</Label>
                      <div className="flex flex-wrap gap-2">
                        {(["online", "physical", "both"] as const).map((t) => (
                          <button key={t} onClick={() => setProfile((p) => ({ ...p, consultationType: t }))}
                            className={cn("flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all capitalize",
                              profile.consultationType === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300")}>
                            {t === "online" && <Video className="h-4 w-4" />}
                            {t === "physical" && <Building2 className="h-4 w-4" />}
                            {t === "both" && <><Video className="h-4 w-4" /><Building2 className="h-4 w-4" /></>}
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? "Saving..." : "Save Profile"}
                      </Button>
                      {saveMsg && <p className={cn("text-xs font-medium", saveMsg.includes("!") ? "text-emerald-600" : "text-red-500")}>{saveMsg}</p>}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ===== AVAILABILITY ===== */}
          {activeSection === "availability" && (
            <div className="space-y-5 animate-fade-in">
              {/* AI Mode Big Toggle */}
              <Card className="border-slate-200 overflow-hidden">
                <div className={cn("p-5 flex items-center justify-between transition-colors", aiMode ? "bg-blue-600" : "bg-white")}>
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", aiMode ? "bg-white/20" : "bg-blue-50")}>
                      <Bot className={cn("h-5 w-5", aiMode ? "text-white" : "text-blue-600")} />
                    </div>
                    <div>
                      <p className={cn("text-sm font-bold", aiMode ? "text-white" : "text-slate-900")}>Online / AI Assistant Mode</p>
                      <p className={cn("text-xs", aiMode ? "text-blue-100" : "text-slate-500")}>
                        {aiMode ? "AI is routing chats and collecting patient info" : "You are handling chats directly"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={aiMode} onCheckedChange={handleAIToggle} />
                </div>
                {aiMode && (
                  <div className="px-5 py-3 bg-blue-50 border-t border-blue-500/20">
                    <p className="text-xs text-blue-700 font-medium flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5" />
                      AI collects patient name, contact & problem — saved to the database automatically.
                    </p>
                  </div>
                )}
              </Card>

              {/* Weekly Grid */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" /> Weekly Schedule
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">{totalSlots} slot{totalSlots !== 1 ? "s" : ""} set</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <div className="min-w-[560px]">
                      <div className="grid gap-2" style={{ gridTemplateColumns: "80px repeat(6, 1fr)" }}>
                        <div className="text-xs font-medium text-slate-400 py-2">Time</div>
                        {days.map((day) => (
                          <div key={day} className="text-xs font-semibold text-slate-700 text-center py-2 bg-slate-50 rounded-lg">{day}</div>
                        ))}
                      </div>
                      {timeOptions.slice(0, 10).map((time) => (
                        <div key={time} className="grid gap-2 mt-1.5" style={{ gridTemplateColumns: "80px repeat(6, 1fr)" }}>
                          <div className="text-xs text-slate-400 flex items-center">{time}</div>
                          {days.map((day) => {
                            const active = selectedSlots[day]?.has(time);
                            return (
                              <button key={day} onClick={() => toggleSlot(day, time)}
                                className={cn("h-8 rounded-lg border text-[10px] font-medium transition-all",
                                  active ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-white border-slate-200 text-transparent hover:border-blue-300 hover:bg-blue-50 hover:text-blue-400")}>
                                {active ? "✓" : ""}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">Click a cell to toggle. Blue = available.</p>
                </CardContent>
              </Card>

              {/* Custom Slot */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4 text-emerald-600" />Add Custom Slot</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[120px]">
                      <Label className="text-xs mb-1 block">Day</Label>
                      <Select value={customSlotDay} onValueChange={setCustomSlotDay}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{days.map((d) => <SelectItem key={d} value={d} className="text-sm">{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <Label className="text-xs mb-1 block">Time</Label>
                      <Select value={customSlotTime} onValueChange={setCustomSlotTime}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{timeOptions.map((t) => <SelectItem key={t} value={t} className="text-sm">{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <Button onClick={() => toggleSlot(customSlotDay, customSlotTime)} variant="secondary" className="h-9 px-5 shrink-0">
                      <Plus className="h-4 w-4 mr-1.5" />Add
                    </Button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.entries(selectedSlots).flatMap(([day, times]) =>
                      [...times].map((time) => (
                        <div key={`${day}-${time}`}
                          className="flex items-center gap-2 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full pl-3 pr-2 py-1.5">
                          <Clock className="h-3 w-3" />{day} · {time}
                          <button onClick={() => toggleSlot(day, time)} className="hover:text-red-500 transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-3">
                <Button onClick={handleSaveSchedule} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save Schedule"}
                </Button>
                {saveMsg && <p className={cn("text-xs font-medium", saveMsg.includes("!") ? "text-emerald-600" : "text-red-500")}>{saveMsg}</p>}
              </div>
            </div>
          )}

          {/* ===== APPOINTMENTS ===== */}
          {activeSection === "appointments" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-3 gap-4 mb-2">
                {[
                  { label: "Confirmed", count: confirmedCount, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
                  { label: "Pending", count: pendingCount, color: "text-amber-600 bg-amber-50 border-amber-200" },
                  { label: "Cancelled", count: appointments.filter((a) => a.status === "cancelled").length, color: "text-red-600 bg-red-50 border-red-200" },
                ].map(({ label, count, color }) => (
                  <div key={label} className={cn("rounded-xl border p-3 text-center", color)}>
                    <p className="text-xl font-bold">{count}</p>
                    <p className="text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={fetchAppointments} className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />Refresh
                </Button>
              </div>

              {loadingAppts ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 text-blue-500 animate-spin" /></div>
              ) : appointments.length === 0 ? (
                <Card className="border-slate-200"><CardContent className="p-10 text-center">
                  <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium">No appointments yet</p>
                  <p className="text-slate-400 text-xs mt-1">Seed the database and share your profile link to start receiving bookings.</p>
                  <Button className="mt-4" size="sm" onClick={async () => {
                    await fetch("/api/seed", { method: "POST" });
                    fetchAppointments();
                  }}>Seed Sample Data</Button>
                </CardContent></Card>
              ) : appointments.map((appt) => (
                <Card key={appt.id} className="border-slate-200 hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                        appt.type === "online" ? "bg-emerald-100" : "bg-blue-100")}>
                        {appt.type === "online" ? <Video className="h-5 w-5 text-emerald-600" /> : <Building2 className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-900">{appt.patientName}</p>
                          <Badge variant={appt.status === "confirmed" ? "success" : appt.status === "pending" ? "warning" : "destructive"}
                            className="capitalize text-xs">{appt.status}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{appt.patientProblem}</p>
                        <p className="text-xs text-slate-400 mt-0.5">📞 {appt.patientPhone}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(appt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{appt.time}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        {appt.status === "pending" && (
                          <Button size="sm" className="h-7 text-xs px-2.5" onClick={() => handleApptStatus(appt.id, "confirmed")}>Confirm</Button>
                        )}
                        {appt.status !== "cancelled" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleApptStatus(appt.id, "cancelled")}>Cancel</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ===== SETTINGS ===== */}
          {activeSection === "settings" && (
            <div className="space-y-5 animate-fade-in max-w-xl">
              <Card className="border-slate-200">
                <CardHeader className="pb-3"><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "New appointment booking", desc: "Get notified when a patient books a slot" },
                    { label: "Appointment reminders", desc: "Receive reminders 1 hour before consultations" },
                    { label: "Chat messages", desc: "Be notified of new patient messages" },
                    { label: "AI agent activity", desc: "Summary of actions taken by your AI assistant" },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{label}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                      <Switch defaultChecked className="shrink-0" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-3"><CardTitle className="text-base">Database</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-500">Seed the database with sample doctors to populate the app.</p>
                  <Button className="gap-2" onClick={async () => {
                    setSaving(true);
                    const res = await fetch("/api/seed", { method: "POST" });
                    const data = await res.json();
                    setSaveMsg(data.message || "Seeded!");
                    setSaving(false);
                    fetchDoctor();
                    fetchAppointments();
                    setTimeout(() => setSaveMsg(""), 3000);
                  }} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    {saving ? "Seeding..." : "Seed Database"}
                  </Button>
                  {saveMsg && <p className="text-xs text-emerald-600 font-medium">{saveMsg}</p>}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
