import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Clock, Video, Building2, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Doctor } from "@/lib/mockData";

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <CardContent className="p-0">
        {/* Card Top — Avatar + Status */}
        <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 p-5 flex items-start gap-4">
          {/* Available dot */}
          {doctor.isAvailableNow && (
            <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Available Now
            </span>
          )}

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-16 w-16 rounded-2xl overflow-hidden ring-2 ring-white shadow-md">
              <Image
                src={doctor.avatar}
                alt={doctor.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            {doctor.aiAssistantMode && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-white">
                <span className="text-[8px] text-white font-bold">AI</span>
              </div>
            )}
          </div>

          {/* Name + Specialization */}
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="font-semibold text-slate-900 text-base leading-tight truncate group-hover:text-blue-700 transition-colors">
              {doctor.name}
            </h3>
            <p className="text-sm text-blue-600 font-medium mt-0.5">{doctor.specialization}</p>
            <div className="flex items-center gap-1 mt-1.5 text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs truncate">{doctor.city}</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-5 py-3 flex items-center gap-4 border-b border-slate-100">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-slate-800">{doctor.rating}</span>
            <span className="text-xs text-slate-400">({doctor.reviewCount})</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">{doctor.experience} yrs exp</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            {(doctor.consultationType === "online" || doctor.consultationType === "both") && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <Video className="h-3.5 w-3.5" />
                Online
              </span>
            )}
            {(doctor.consultationType === "physical" || doctor.consultationType === "both") && (
              <span className="flex items-center gap-1 text-xs font-medium text-blue-600">
                <Building2 className="h-3.5 w-3.5" />
                Physical
              </span>
            )}
          </div>
        </div>

        {/* Fee + CTA */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            {doctor.feeOnline > 0 && (
              <p className="text-xs text-slate-500">
                Online: <span className="font-semibold text-slate-800">PKR {doctor.feeOnline.toLocaleString()}</span>
              </p>
            )}
            {doctor.feePhysical > 0 && (
              <p className="text-xs text-slate-500">
                In-clinic: <span className="font-semibold text-slate-800">PKR {doctor.feePhysical.toLocaleString()}</span>
              </p>
            )}
          </div>
          <Link href={`/doctor/${doctor.id}`}>
            <Button size="sm" className="shrink-0">
              View Profile
            </Button>
          </Link>
        </div>

        {/* Availability indicator */}
        {doctor.availableSlots.filter((s) => s.available).length > 0 && (
          <div className="px-5 pb-4">
            <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
              <CheckCircle className="h-3.5 w-3.5" />
              {doctor.availableSlots.filter((s) => s.available).length} slots available this week
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
