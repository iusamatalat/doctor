"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserRound, Stethoscope, MapPin, Video, Building2, BadgeDollarSign,
  BookOpen, Languages, Plus, X, ChevronRight, CheckCircle, Loader2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { specializations, cities } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const SPEC_OPTIONS = specializations.filter((s) => s !== "All Specializations");
const CITY_OPTIONS = cities.filter((c) => c !== "All Cities");

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_OPTIONS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
];

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <h2 className="text-sm font-semibold text-slate-800">{label}</h2>
    </div>
  );
}

function TagInput({
  label, placeholder, values, onAdd, onRemove,
}: {
  label: string; placeholder: string; values: string[];
  onAdd: (v: string) => void; onRemove: (i: number) => void;
}) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) { onAdd(v); setDraft(""); }
  };
  return (
    <div>
      <Label className="text-xs mb-1 block">{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
          className="h-9 text-sm"
        />
        <Button type="button" size="sm" variant="outline" className="h-9 px-3" onClick={commit}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {values.map((v, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5">
              {v}
              <button type="button" onClick={() => onRemove(i)} className="hover:text-blue-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function generateSlots(schedule: Record<string, string[]>, type: "online" | "physical") {
  const slots: { slotId: string; date: string; time: string; available: boolean; type: "online" | "physical" }[] = [];
  const today = new Date();
  // Map day names to offsets from this Monday
  const dayIndexMap: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const mondayOffset = (today.getDay() + 6) % 7; // days since Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);

  Object.entries(schedule).forEach(([day, times]) => {
    const offset = dayIndexMap[day] ?? 0;
    const slotDate = new Date(monday);
    slotDate.setDate(monday.getDate() + offset);
    const dateStr = slotDate.toISOString().split("T")[0];
    times.forEach((time, ti) => {
      slots.push({ slotId: `${type}-${day}-${ti}`, date: dateStr, time, available: true, type });
    });
  });
  return slots;
}

export default function AddDoctorPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    city: "",
    location: "",
    consultationType: "both" as "online" | "physical" | "both",
    experience: "",
    feeOnline: "",
    feePhysical: "",
    bio: "",
    avatar: "",
  });
  const [education, setEducation] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  // onlineSchedule / physicalSchedule: { Mon: ["09:00 AM", ...] }
  const [onlineSchedule, setOnlineSchedule] = useState<Record<string, string[]>>({});
  const [physicalSchedule, setPhysicalSchedule] = useState<Record<string, string[]>>({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const toggleSlot = (
    schedule: Record<string, string[]>,
    setSchedule: React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
    day: string,
    time: string
  ) => {
    setSchedule((prev) => {
      const current = prev[day] ?? [];
      const next = current.includes(time)
        ? current.filter((t) => t !== time)
        : [...current, time].sort();
      return { ...prev, [day]: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.specialization || !form.city || !form.location.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const onlineSlots = generateSlots(onlineSchedule, "online");
      const physicalSlots = generateSlots(physicalSchedule, "physical");

      const payload = {
        name: form.name.trim(),
        specialization: form.specialization,
        city: form.city,
        location: form.location.trim(),
        consultationType: form.consultationType,
        experience: Number(form.experience) || 0,
        feeOnline: Number(form.feeOnline) || 0,
        feePhysical: Number(form.feePhysical) || 0,
        bio: form.bio.trim(),
        avatar: form.avatar.trim() || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(form.name)}`,
        education,
        languages,
        rating: 5.0,
        reviewCount: 0,
        isAvailableNow: true,
        aiAssistantMode: false,
        availableSlots: [...onlineSlots, ...physicalSlots],
        weeklySchedule: {
          ...(form.consultationType !== "physical" ? onlineSchedule : {}),
          ...(form.consultationType !== "online" ? physicalSchedule : {}),
        },
      };

      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create doctor");
      }

      const created = await res.json();
      setSuccess(true);
      setTimeout(() => router.push(`/doctor/${created.id}`), 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="h-9 w-9 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Doctor Added!</h2>
          <p className="text-slate-500 text-sm">Redirecting to profile…</p>
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  const showOnlineSchedule = form.consultationType === "online" || form.consultationType === "both";
  const showPhysicalSchedule = form.consultationType === "physical" || form.consultationType === "both";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Add New Doctor</h1>
              <p className="text-xs text-slate-500">Fill in the details to register a new specialist</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="container mx-auto px-4 py-8 max-w-3xl space-y-6">

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeading icon={UserRound} label="Basic Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="name" className="text-xs">Full Name *</Label>
              <Input id="name" placeholder="Dr. Jane Smith" value={form.name}
                onChange={(e) => set("name", e.target.value)} className="mt-1 h-9 text-sm" required />
            </div>

            <div>
              <Label className="text-xs">Specialization *</Label>
              <Select value={form.specialization} onValueChange={(v) => set("specialization", v)}>
                <SelectTrigger className="mt-1 h-9 text-sm">
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {SPEC_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-sm">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="experience" className="text-xs">Years of Experience</Label>
              <Input id="experience" type="number" min="0" placeholder="e.g. 10"
                value={form.experience} onChange={(e) => set("experience", e.target.value)}
                className="mt-1 h-9 text-sm" />
            </div>

            <div>
              <Label htmlFor="avatar" className="text-xs">Avatar URL <span className="text-slate-400">(optional)</span></Label>
              <Input id="avatar" placeholder="https://…" value={form.avatar}
                onChange={(e) => set("avatar", e.target.value)} className="mt-1 h-9 text-sm" />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="bio" className="text-xs">Bio / About</Label>
              <textarea id="bio" rows={3} placeholder="Brief professional summary…"
                value={form.bio} onChange={(e) => set("bio", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        </div>

        {/* Location & Consultation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeading icon={MapPin} label="Location & Consultation" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">City *</Label>
              <Select value={form.city} onValueChange={(v) => set("city", v)}>
                <SelectTrigger className="mt-1 h-9 text-sm">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {CITY_OPTIONS.map((c) => <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location" className="text-xs">Clinic / Hospital Address *</Label>
              <Input id="location" placeholder="e.g. Aga Khan Hospital, Karachi"
                value={form.location} onChange={(e) => set("location", e.target.value)}
                className="mt-1 h-9 text-sm" required />
            </div>

            <div className="sm:col-span-2">
              <Label className="text-xs mb-2 block">Consultation Type</Label>
              <div className="grid grid-cols-3 gap-3">
                {(["both", "online", "physical"] as const).map((t) => (
                  <button key={t} type="button"
                    onClick={() => set("consultationType", t)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-xs font-medium transition-all",
                      form.consultationType === t
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    {t === "online" ? <Video className="h-5 w-5" /> :
                     t === "physical" ? <Building2 className="h-5 w-5" /> :
                     <div className="flex gap-1"><Video className="h-4 w-4" /><Building2 className="h-4 w-4" /></div>}
                    <span className="capitalize">{t === "both" ? "Both" : t === "online" ? "Online Only" : "In-Clinic Only"}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fees */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeading icon={BadgeDollarSign} label="Consultation Fees (PKR)" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {showOnlineSchedule && (
              <div>
                <Label htmlFor="feeOnline" className="text-xs">Online Fee</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">PKR</span>
                  <Input id="feeOnline" type="number" min="0" placeholder="1500"
                    value={form.feeOnline} onChange={(e) => set("feeOnline", e.target.value)}
                    className="pl-11 h-9 text-sm" />
                </div>
              </div>
            )}
            {showPhysicalSchedule && (
              <div>
                <Label htmlFor="feePhysical" className="text-xs">In-Clinic Fee</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">PKR</span>
                  <Input id="feePhysical" type="number" min="0" placeholder="2000"
                    value={form.feePhysical} onChange={(e) => set("feePhysical", e.target.value)}
                    className="pl-11 h-9 text-sm" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Qualifications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeading icon={BookOpen} label="Qualifications & Languages" />
          <div className="space-y-4">
            <TagInput label="Education / Degrees" placeholder="e.g. MBBS, FCPS Cardiology"
              values={education}
              onAdd={(v) => setEducation((e) => [...e, v])}
              onRemove={(i) => setEducation((e) => e.filter((_, j) => j !== i))} />
            <TagInput label="Languages Spoken" placeholder="e.g. English, Urdu"
              values={languages}
              onAdd={(v) => setLanguages((l) => [...l, v])}
              onRemove={(i) => setLanguages((l) => l.filter((_, j) => j !== i))} />
          </div>
        </div>

        {/* Availability Schedule */}
        {(showOnlineSchedule || showPhysicalSchedule) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <SectionHeading icon={Video} label="Weekly Availability" />
            <p className="text-xs text-slate-500 mb-5">Click time slots to toggle availability for each day.</p>

            {showOnlineSchedule && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">Online Slots</span>
                </div>
                <div className="space-y-3">
                  {DAYS.map((day) => (
                    <div key={day} className="flex gap-3 items-start">
                      <span className="text-xs font-medium text-slate-500 w-8 pt-1.5 shrink-0">{day}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {TIME_OPTIONS.map((time) => {
                          const active = (onlineSchedule[day] ?? []).includes(time);
                          return (
                            <button key={time} type="button"
                              onClick={() => toggleSlot(onlineSchedule, setOnlineSchedule, day, time)}
                              className={cn(
                                "text-xs px-2 py-1 rounded-md border transition-all",
                                active
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                              )}>
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showPhysicalSchedule && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">In-Clinic Slots</span>
                </div>
                <div className="space-y-3">
                  {DAYS.map((day) => (
                    <div key={day} className="flex gap-3 items-start">
                      <span className="text-xs font-medium text-slate-500 w-8 pt-1.5 shrink-0">{day}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {TIME_OPTIONS.map((time) => {
                          const active = (physicalSchedule[day] ?? []).includes(time);
                          return (
                            <button key={time} type="button"
                              onClick={() => toggleSlot(physicalSchedule, setPhysicalSchedule, day, time)}
                              className={cn(
                                "text-xs px-2 py-1 rounded-md border transition-all",
                                active
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300"
                              )}>
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <Button type="button" variant="outline" className="flex-1"
            onClick={() => router.back()} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
              : <><ChevronRight className="h-4 w-4 mr-1" />Add Doctor</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
