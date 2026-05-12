"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search, Bot, Stethoscope, ArrowRight, Star, Users,
  Clock, Shield, ChevronRight, Zap, MapPin, Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import AISuggestions from "@/components/AISuggestions";
import { doctors as mockDoctors, aiSymptomSuggestions, specializations } from "@/lib/mockData";
import type { Doctor } from "@/lib/mockData";

const stats = [
  { label: "Verified Doctors", value: "2,400+", icon: Stethoscope },
  { label: "Happy Patients", value: "180K+", icon: Users },
  { label: "Cities Covered", value: "35+", icon: MapPin },
  { label: "Avg. Wait Time", value: "< 2 min", icon: Clock },
];

const features = [
  { icon: Bot, title: "AI Symptom Checker", description: "Describe your symptoms in plain language and get instant specialist recommendations powered by AI.", color: "bg-blue-50 text-blue-600" },
  { icon: Video, title: "Online & In-Clinic", description: "Choose between video consultations from home or in-person visits — whatever works best for you.", color: "bg-emerald-50 text-emerald-600" },
  { icon: Shield, title: "Verified Specialists", description: "Every doctor on our platform is verified with their PMDC registration and credentials.", color: "bg-purple-50 text-purple-600" },
  { icon: Zap, title: "Instant Booking", description: "Book confirmed appointments in under 60 seconds with real-time slot availability.", color: "bg-amber-50 text-amber-600" },
];

const quickSpecializations = ["Cardiologist", "Dermatologist", "Gynecologist", "Neurologist", "Orthopedic", "General Physician"];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>(mockDoctors);

  useEffect(() => {
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length > 0) setAllDoctors(data); })
      .catch(() => {});
  }, []);

  const filteredSuggestions = aiSymptomSuggestions.filter(
    (s) => submittedQuery &&
      (s.symptom.toLowerCase().includes(submittedQuery.toLowerCase()) ||
        s.specializations.some((sp) => sp.toLowerCase().includes(submittedQuery.toLowerCase())))
  );

  const handleAICheck = () => {
    if (!query.trim()) return;
    setSubmittedQuery(query);
    setShowAI(true);
  };

  const featuredDoctors = allDoctors.filter((d) => d.rating >= 4.8).slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <Bot className="h-3.5 w-3.5 text-emerald-400" />
            Pakistan&apos;s First AI-Powered Doctor Platform
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 tracking-tight">
            Find the Right Doctor,
            <span className="text-emerald-400"> Instantly</span>
          </h1>
          <p className="text-blue-100 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Search by symptoms, specialization, or location. Our AI matches you with verified specialists nationwide.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Symptoms, specialization, or doctor name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAICheck()}
                  className="pl-10 h-12 bg-white border-0 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm sm:text-base"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAICheck} className="h-12 px-4 shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white border-0 rounded-xl">
                  <Bot className="h-4 w-4 mr-2" /> Check with AI
                </Button>
                <Link href={`/search${query ? `?query=${encodeURIComponent(query)}` : ""}`}>
                  <Button className="h-12 px-4 shrink-0 bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-xl">
                    <Search className="h-4 w-4 mr-2" /> Search
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {quickSpecializations.map((spec) => (
                <Link key={spec} href={`/search?specialization=${encodeURIComponent(spec)}`}
                  className="text-xs text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1 transition-colors">
                  {spec}
                </Link>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          {showAI && filteredSuggestions.length > 0 && (
            <div className="max-w-2xl mx-auto mt-6 text-left">
              <div className="bg-white/95 backdrop-blur rounded-2xl p-5 shadow-xl border border-white/50">
                <AISuggestions suggestions={filteredSuggestions} query={submittedQuery} />
              </div>
            </div>
          )}
          {showAI && filteredSuggestions.length === 0 && submittedQuery && (
            <div className="max-w-2xl mx-auto mt-6">
              <div className="bg-white/95 rounded-2xl p-5 shadow-xl text-center">
                <Bot className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-slate-700 text-sm font-medium">No AI matches for &quot;{submittedQuery}&quot;</p>
                <p className="text-slate-500 text-xs mt-1">Try &quot;back pain&quot;, &quot;chest pain&quot;, or &quot;headache&quot;.</p>
                <Link href={`/search?query=${encodeURIComponent(submittedQuery)}`}>
                  <Button size="sm" className="mt-3">Browse All Doctors</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">Why Choose Us</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Healthcare, Reimagined with AI</h2>
            <p className="text-slate-500 mt-2 max-w-lg mx-auto text-sm md:text-base">We combine AI intelligence with a verified network of specialists.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, description, color }) => (
              <Card key={title} className="border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-2">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED DOCTORS ===== */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge variant="secondary" className="mb-2">Top Rated</Badge>
              <h2 className="text-2xl font-bold text-slate-900">Featured Specialists</h2>
            </div>
            <Link href="/search">
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1.5">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredDoctors.map((doctor) => (
              <Link key={doctor.id} href={`/doctor/${doctor.id}`}>
                <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer">
                  <CardContent className="p-0">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-emerald-500" />
                    <div className="p-5 flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl overflow-hidden ring-2 ring-slate-100 shadow shrink-0">
                        <Image src={doctor.avatar} alt={doctor.name} width={56} height={56} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm truncate">{doctor.name}</h3>
                        <p className="text-xs text-blue-600 font-medium">{doctor.specialization}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="flex items-center gap-0.5 text-xs text-amber-600 font-medium">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{doctor.rating}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500">{doctor.experience} yrs</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500">{doctor.city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 pb-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        From <span className="font-semibold text-slate-800">
                          PKR {Math.min(doctor.feeOnline || Infinity, doctor.feePhysical || Infinity).toLocaleString()}
                        </span>
                      </span>
                      <span className="text-xs font-medium text-blue-600 flex items-center gap-0.5">
                        View Profile <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/search">
              <Button variant="outline" className="w-full">View All Doctors <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 bg-gradient-to-br from-blue-700 to-blue-900">
        <div className="container mx-auto px-4 text-center">
          <Bot className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Not sure which specialist you need?</h2>
          <p className="text-blue-200 mb-8 max-w-md mx-auto text-sm">Describe your symptoms and get matched instantly.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 h-12"
              onClick={() => { setQuery("chest pain"); setSubmittedQuery("chest pain"); setShowAI(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <Bot className="h-5 w-5 mr-2" /> Try AI Symptom Checker
            </Button>
            <Link href="/search">
              <Button size="lg" variant="outline" className="h-12 bg-white/10 text-white border-white/30 hover:bg-white/20">
                Browse All Doctors <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
