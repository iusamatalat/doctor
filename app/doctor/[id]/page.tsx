"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star, MapPin, Clock, GraduationCap, Languages, Video, Building2,
  Calendar, ChevronLeft, CheckCircle, Bot, MessageSquare, User,
  Wifi, Award, ThumbsUp, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ChatInterface from "@/components/ChatInterface";
import BookingModal from "@/components/BookingModal";
import { mockChatMessages, doctors as mockDoctors } from "@/lib/mockData";
import type { Doctor } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type TabKey = "about" | "availability" | "reviews";

const mockReviews = [
  { id: "r1", name: "Ali Hassan", date: "May 3, 2026", rating: 5, text: "Extremely professional and thorough. Diagnosed my issue quickly and explained everything clearly. Highly recommended!", avatar: "https://ui-avatars.com/api/?name=Ali+Hassan&background=64748b&color=fff&size=40" },
  { id: "r2", name: "Zara Siddiqui", date: "April 28, 2026", rating: 5, text: "Amazing experience! The online consultation was seamless and she gave me a detailed treatment plan.", avatar: "https://ui-avatars.com/api/?name=Zara+Siddiqui&background=8b5cf6&color=fff&size=40" },
  { id: "r3", name: "Omar Farooq", date: "April 15, 2026", rating: 4, text: "Very knowledgeable with great bedside manner. The consultation itself was excellent.", avatar: "https://ui-avatars.com/api/?name=Omar+Farooq&background=f59e0b&color=fff&size=40" },
];

export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("about");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeView, setActiveView] = useState<"profile" | "chat">("profile");

  useEffect(() => {
    fetch(`/api/doctors/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          // Fallback to mock data
          const mock = mockDoctors.find((d) => d.id === params.id);
          if (mock) setDoctor(mock);
          else setNotFound(true);
        } else {
          // Normalise slots from DB shape
          const d = {
            ...data,
            availableSlots: (data.availableSlots || []).map((s: any) => ({
              id: s.slotId || s.id || `${s.date}-${s.time}`,
              date: s.date,
              time: s.time,
              available: s.available,
              type: s.type,
            })),
          };
          setDoctor(d);
        }
      })
      .catch(() => {
        const mock = mockDoctors.find((d) => d.id === params.id);
        if (mock) setDoctor(mock);
        else setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-slate-800 mb-2">Doctor not found</p>
          <Link href="/search"><Button variant="outline">Back to Search</Button></Link>
        </div>
      </div>
    );
  }

  const groupedSlots: Record<string, typeof doctor.availableSlots> = {};
  doctor.availableSlots.forEach((slot) => {
    if (!groupedSlots[slot.date]) groupedSlots[slot.date] = [];
    groupedSlots[slot.date].push(slot);
  });

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "about", label: "About", icon: User },
    { key: "availability", label: "Availability", icon: Calendar },
    { key: "reviews", label: "Reviews", icon: ThumbsUp },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-3">
          <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Search
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Mobile view toggle */}
        <div className="flex md:hidden gap-2 mb-4">
          {(["profile", "chat"] as const).map((v) => (
            <button key={v} onClick={() => setActiveView(v)}
              className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all capitalize",
                activeView === v ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200")}>
              {v === "profile" ? <User className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
              {v}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ===== PROFILE ===== */}
          <div className={cn("md:col-span-2 space-y-5", activeView !== "profile" && "hidden md:block")}>
            {/* Header Card */}
            <Card className="overflow-hidden border-slate-200">
              <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800" />
              <CardContent className="px-6 pb-6">
                <div className="flex items-end justify-between -mt-10 mb-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg">
                      <Image src={doctor.avatar} alt={doctor.name} width={80} height={80} className="h-full w-full object-cover" />
                    </div>
                    {doctor.isAvailableNow && (
                      <span className="absolute -bottom-1 -right-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border-2 border-white rounded-full px-1.5 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
                      </span>
                    )}
                  </div>
                  <Button onClick={() => setBookingOpen(true)} className="shadow-md">
                    <Calendar className="h-4 w-4 mr-2" /> Book Appointment
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-slate-900">{doctor.name}</h1>
                      {doctor.aiAssistantMode && (
                        <Badge variant="default" className="text-xs gap-1"><Bot className="h-3 w-3" /> AI Mode Active</Badge>
                      )}
                    </div>
                    <p className="text-blue-600 font-medium text-sm mt-0.5">{doctor.specialization}</p>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 shrink-0 text-slate-400" />{doctor.location}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 shrink-0 text-slate-400" />{doctor.experience} years experience</span>
                    <span className="flex items-center gap-1.5"><Wifi className="h-4 w-4 shrink-0 text-slate-400" />{doctor.isAvailableNow ? "Available Now" : "Not Available"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className={cn("h-4 w-4", i <= Math.round(doctor.rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200")} />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-slate-800">{doctor.rating}</span>
                    <span className="text-xs text-slate-500">({doctor.reviewCount} reviews)</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {(doctor.consultationType === "online" || doctor.consultationType === "both") && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                        <Video className="h-3.5 w-3.5" /> Online · PKR {doctor.feeOnline.toLocaleString()}
                      </div>
                    )}
                    {(doctor.consultationType === "physical" || doctor.consultationType === "both") && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
                        <Building2 className="h-3.5 w-3.5" /> In-Clinic · PKR {doctor.feePhysical.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                    activeTab === key ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50")}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </div>

            {/* About */}
            {activeTab === "about" && (
              <div className="space-y-4 animate-fade-in">
                <Card className="border-slate-200"><CardContent className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><User className="h-4 w-4 text-blue-600" />About</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
                </CardContent></Card>

                <Card className="border-slate-200"><CardContent className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><GraduationCap className="h-4 w-4 text-blue-600" />Education</h3>
                  <ul className="space-y-2">
                    {doctor.education.map((edu, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{edu}
                      </li>
                    ))}
                  </ul>
                </CardContent></Card>

                <Card className="border-slate-200"><CardContent className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><Languages className="h-4 w-4 text-blue-600" />Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((lang) => <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>)}
                  </div>
                </CardContent></Card>

                <Card className="border-slate-200"><CardContent className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><Award className="h-4 w-4 text-blue-600" />Quick Stats</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div><p className="text-2xl font-bold text-blue-600">{doctor.experience}+</p><p className="text-xs text-slate-500">Years Exp.</p></div>
                    <div><p className="text-2xl font-bold text-emerald-600">{doctor.reviewCount}</p><p className="text-xs text-slate-500">Reviews</p></div>
                    <div><p className="text-2xl font-bold text-amber-500">{doctor.rating}</p><p className="text-xs text-slate-500">Rating</p></div>
                  </div>
                </CardContent></Card>
              </div>
            )}

            {/* Availability */}
            {activeTab === "availability" && (
              <div className="animate-fade-in">
                <Card className="border-slate-200"><CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-600" />Available Slots</h3>
                    <Button size="sm" onClick={() => setBookingOpen(true)}>Book Now</Button>
                  </div>

                  {Object.entries(groupedSlots).length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">No slots available. Please check back later.</p>
                  ) : Object.entries(groupedSlots).map(([date, slots]) => (
                    <div key={date} className="mb-5">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{formatDate(date)}</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slots.map((slot) => (
                          <button key={slot.id} disabled={!slot.available} onClick={() => setBookingOpen(true)}
                            className={cn("flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all",
                              slot.available
                                ? "bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                                : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed")}>
                            <span>{slot.time}</span>
                            <span className={cn("text-[10px] mt-1 capitalize",
                              slot.available ? slot.type === "online" ? "text-emerald-600" : "text-blue-600" : "text-slate-300")}>
                              {slot.available ? slot.type : "Booked"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent></Card>
              </div>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && (
              <div className="space-y-4 animate-fade-in">
                <Card className="border-slate-200"><CardContent className="p-5">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-slate-900">{doctor.rating}</p>
                      <div className="flex gap-0.5 justify-center mt-1">
                        {[1,2,3,4,5].map((i) => <Star key={i} className={cn("h-4 w-4", i <= Math.round(doctor.rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200")} />)}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{doctor.reviewCount} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5,4,3,2,1].map((star) => {
                        const pct = star === 5 ? 72 : star === 4 ? 20 : star === 3 ? 6 : 1;
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="w-3">{star}</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-7 text-right">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent></Card>

                {mockReviews.map((review) => (
                  <Card key={review.id} className="border-slate-200"><CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Image src={review.avatar} alt={review.name} width={40} height={40} className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                          <span className="text-xs text-slate-400">{review.date}</span>
                        </div>
                        <div className="flex gap-0.5 mt-1">
                          {[1,2,3,4,5].map((i) => <Star key={i} className={cn("h-3 w-3", i <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200")} />)}
                        </div>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{review.text}</p>
                      </div>
                    </div>
                  </CardContent></Card>
                ))}
              </div>
            )}
          </div>

          {/* ===== CHAT ===== */}
          <div className={cn("md:col-span-1 space-y-5", activeView !== "chat" && "hidden md:block")}>
            <div className="sticky top-24">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  Message {doctor.name.split(" ")[0]}
                </h2>
                {doctor.aiAssistantMode && (
                  <Badge variant="default" className="text-xs gap-1"><Bot className="h-3 w-3" />AI Assisted</Badge>
                )}
              </div>
              <ChatInterface messages={mockChatMessages} doctor={doctor} />
              <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl border border-blue-100 text-center">
                <p className="text-sm font-semibold text-slate-800 mb-1">Ready to book?</p>
                <p className="text-xs text-slate-500 mb-3">Choose your preferred slot and confirm instantly.</p>
                <Button onClick={() => setBookingOpen(true)} className="w-full">
                  <Calendar className="h-4 w-4 mr-2" /> Book Appointment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingModal doctor={doctor} open={bookingOpen} onOpenChange={setBookingOpen} />
    </div>
  );
}
