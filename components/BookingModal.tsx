"use client";

import React, { useState } from "react";
import { Calendar, Clock, Video, Building2, CheckCircle, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Doctor, TimeSlot } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface BookingModalProps {
  doctor: Doctor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "select-type" | "select-slot" | "patient-info" | "confirmation";

export default function BookingModal({ doctor, open, onOpenChange }: BookingModalProps) {
  const [step, setStep] = useState<Step>("select-type");
  const [consultationType, setConsultationType] = useState<"online" | "physical">("online");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [patientInfo, setPatientInfo] = useState({ name: "", phone: "", problem: "" });
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const filteredSlots = doctor.availableSlots.filter(
    (s) => s.type === consultationType && s.available
  );

  const groupedSlots: Record<string, TimeSlot[]> = {};
  filteredSlots.forEach((slot) => {
    if (!groupedSlots[slot.date]) groupedSlots[slot.date] = [];
    groupedSlots[slot.date].push(slot);
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const resetAndClose = () => {
    setStep("select-type");
    setSelectedSlot(null);
    setPatientInfo({ name: "", phone: "", problem: "" });
    setBookingError("");
    onOpenChange(false);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    setBookingError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: patientInfo.name,
          patientPhone: patientInfo.phone,
          patientProblem: patientInfo.problem,
          doctorId: doctor.id,
          doctorName: doctor.name,
          date: selectedSlot.date,
          time: selectedSlot.time,
          type: consultationType,
        }),
      });
      if (!res.ok) throw new Error("Booking failed");
      setStep("confirmation");
    } catch {
      setBookingError("Failed to save appointment. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const stepLabels: Record<Step, string> = {
    "select-type": "Consultation Type",
    "select-slot": "Select Time Slot",
    "patient-info": "Your Details",
    confirmation: "Confirmed!",
  };

  const steps: Step[] = ["select-type", "select-slot", "patient-info", "confirmation"];
  const currentStepIndex = steps.indexOf(step);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {step === "confirmation" ? "Booking Confirmed!" : `Book with ${doctor.name}`}
          </DialogTitle>
          <DialogDescription>
            {step !== "confirmation" && stepLabels[step]}
          </DialogDescription>
        </DialogHeader>

        {/* Step Progress */}
        {step !== "confirmation" && (
          <div className="flex items-center gap-1 mb-2">
            {steps.slice(0, 3).map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors duration-300",
                    i <= currentStepIndex ? "bg-blue-600" : "bg-slate-200"
                  )}
                />
              </React.Fragment>
            ))}
          </div>
        )}

        {/* STEP 1: Consultation Type */}
        {step === "select-type" && (
          <div className="space-y-3">
            {(doctor.consultationType === "online" || doctor.consultationType === "both") && (
              <button
                onClick={() => setConsultationType("online")}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                  consultationType === "online"
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  consultationType === "online" ? "bg-blue-600" : "bg-slate-100"
                )}>
                  <Video className={cn("h-5 w-5", consultationType === "online" ? "text-white" : "text-slate-500")} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Online Consultation</p>
                  <p className="text-xs text-slate-500 mt-0.5">Video call from anywhere · PKR {doctor.feeOnline.toLocaleString()}</p>
                </div>
                {consultationType === "online" && (
                  <CheckCircle className="h-5 w-5 text-blue-600 ml-auto shrink-0" />
                )}
              </button>
            )}

            {(doctor.consultationType === "physical" || doctor.consultationType === "both") && (
              <button
                onClick={() => setConsultationType("physical")}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                  consultationType === "physical"
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  consultationType === "physical" ? "bg-emerald-600" : "bg-slate-100"
                )}>
                  <Building2 className={cn("h-5 w-5", consultationType === "physical" ? "text-white" : "text-slate-500")} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">In-Clinic Visit</p>
                  <p className="text-xs text-slate-500 mt-0.5">{doctor.location} · PKR {doctor.feePhysical.toLocaleString()}</p>
                </div>
                {consultationType === "physical" && (
                  <CheckCircle className="h-5 w-5 text-emerald-600 ml-auto shrink-0" />
                )}
              </button>
            )}

            <Button className="w-full mt-2" onClick={() => setStep("select-slot")}>
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* STEP 2: Time Slot */}
        {step === "select-slot" && (
          <div className="space-y-4">
            {Object.keys(groupedSlots).length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertCircle className="h-8 w-8 text-slate-400" />
                <p className="text-sm text-slate-600 font-medium">No slots available</p>
                <p className="text-xs text-slate-400">No {consultationType} slots this week. Try the other consultation type.</p>
                <Button variant="outline" size="sm" onClick={() => setStep("select-type")} className="mt-2">
                  Change Type
                </Button>
              </div>
            ) : (
              Object.entries(groupedSlots).map(([date, slots]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      {formatDate(date)}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg border transition-all",
                          selectedSlot?.id === slot.id
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}

            {selectedSlot && (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep("select-type")}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep("patient-info")}>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Patient Info */}
        {step === "patient-info" && (
          <div className="space-y-4">
            {selectedSlot && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  {consultationType === "online" ? (
                    <Video className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Building2 className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    {formatDate(selectedSlot.date)} · {selectedSlot.time}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">{consultationType} consultation</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-xs">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Ali Hassan"
                  value={patientInfo.name}
                  onChange={(e) => setPatientInfo((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-xs">Contact Number *</Label>
                <Input
                  id="phone"
                  placeholder="e.g. 0321-4567890"
                  value={patientInfo.phone}
                  onChange={(e) => setPatientInfo((p) => ({ ...p, phone: e.target.value }))}
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="problem" className="text-xs">Describe Your Concern *</Label>
                <textarea
                  id="problem"
                  rows={3}
                  placeholder="Briefly describe your symptoms or reason for visit..."
                  value={patientInfo.problem}
                  onChange={(e) => setPatientInfo((p) => ({ ...p, problem: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {bookingError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {bookingError}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("select-slot")} disabled={booking}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!patientInfo.name || !patientInfo.phone || !patientInfo.problem || booking}
                onClick={handleConfirmBooking}
              >
                {booking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {booking ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Confirmation */}
        {step === "confirmation" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-9 w-9 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Appointment Booked!</h3>
              <p className="text-sm text-slate-500 mt-1">
                Your appointment with {doctor.name} is confirmed.
              </p>
            </div>

            <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Patient</span>
                <span className="font-medium text-slate-800">{patientInfo.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Doctor</span>
                <span className="font-medium text-slate-800">{doctor.name}</span>
              </div>
              {selectedSlot && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date & Time</span>
                  <span className="font-medium text-slate-800">
                    {formatDate(selectedSlot.date)} · {selectedSlot.time}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Type</span>
                <Badge variant={consultationType === "online" ? "online" : "physical"} className="capitalize">
                  {consultationType}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Fee</span>
                <span className="font-semibold text-slate-900">
                  PKR {(consultationType === "online" ? doctor.feeOnline : doctor.feePhysical).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              A confirmation SMS will be sent to {patientInfo.phone}
            </p>

            <Button className="w-full" onClick={resetAndClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
