"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Bot, Star, ChevronDown, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DoctorCard from "@/components/DoctorCard";
import AISuggestions from "@/components/AISuggestions";
import { doctors as mockDoctors, specializations, cities, aiSymptomSuggestions } from "@/lib/mockData";
import type { Doctor } from "@/lib/mockData";

function SearchContent() {
  const searchParams = useSearchParams();

  const [allDoctors, setAllDoctors] = useState<Doctor[]>(mockDoctors);
  const [loading, setLoading] = useState(true);

  const [searchValue, setSearchValue] = useState(searchParams.get("query") || "");
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [selectedSpec, setSelectedSpec] = useState(searchParams.get("specialization") || "All Specializations");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All Types");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [showAI, setShowAI] = useState(!!searchParams.get("query"));

  // Fetch from DB
  useEffect(() => {
    setLoading(true);
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length > 0) setAllDoctors(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const aiMatches = useMemo(() =>
    aiSymptomSuggestions.filter((s) =>
      query && (s.symptom.toLowerCase().includes(query.toLowerCase()) ||
        s.specializations.some((sp) => sp.toLowerCase().includes(query.toLowerCase())))
    ), [query]);

  // Client-side filtering on top of DB data
  const filteredDoctors = useMemo(() => {
    let result = [...allDoctors];
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q)
      );
    }
    if (selectedSpec !== "All Specializations") {
      result = result.filter((d) => d.specialization.toLowerCase().includes(selectedSpec.toLowerCase()));
    }
    if (selectedCity !== "All Cities") {
      result = result.filter((d) => d.city === selectedCity);
    }
    if (selectedType === "Online") {
      result = result.filter((d) => d.consultationType === "online" || d.consultationType === "both");
    } else if (selectedType === "Physical") {
      result = result.filter((d) => d.consultationType === "physical" || d.consultationType === "both");
    }
    result.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "experience") return b.experience - a.experience;
      if (sortBy === "fee") return (a.feeOnline || a.feePhysical) - (b.feeOnline || b.feePhysical);
      return 0;
    });
    return result;
  }, [allDoctors, query, selectedSpec, selectedCity, selectedType, sortBy]);

  const activeFilters = [
    query && { label: query, clear: () => { setQuery(""); setSearchValue(""); setShowAI(false); } },
    selectedSpec !== "All Specializations" && { label: selectedSpec, clear: () => setSelectedSpec("All Specializations") },
    selectedCity !== "All Cities" && { label: selectedCity, clear: () => setSelectedCity("All Cities") },
    selectedType !== "All Types" && { label: selectedType, clear: () => setSelectedType("All Types") },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Search Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search doctors, symptoms, specialization..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setQuery(searchValue); setShowAI(true); } }}
                className="pl-10 h-11 bg-slate-50 border-slate-200"
              />
            </div>
            <Button onClick={() => { setQuery(searchValue); setShowAI(true); }} className="h-11 px-5 shrink-0">Search</Button>
            <Button variant="outline" className="h-11 px-3 shrink-0 md:hidden" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <div className={`flex flex-wrap gap-2 ${showFilters ? "flex" : "hidden md:flex"}`}>
            <Select value={selectedSpec} onValueChange={setSelectedSpec}>
              <SelectTrigger className="h-9 text-xs w-auto min-w-[160px] bg-white border-slate-200">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="h-9 text-xs w-auto min-w-[130px] bg-white border-slate-200">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-9 text-xs w-auto min-w-[130px] bg-white border-slate-200">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {["All Types", "Online", "Physical"].map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 text-xs w-auto min-w-[130px] bg-white border-slate-200">
                <ChevronDown className="h-3.5 w-3.5 mr-1 text-slate-400" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating" className="text-xs">Highest Rated</SelectItem>
                <SelectItem value="experience" className="text-xs">Most Experienced</SelectItem>
                <SelectItem value="fee" className="text-xs">Lowest Fee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {activeFilters.map(({ label, clear }) => (
                <button key={label} onClick={clear}
                  className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-1 hover:bg-blue-100 transition-colors">
                  {label} <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {showAI && aiMatches.length > 0 && (
          <div className="mb-6 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <AISuggestions suggestions={aiMatches} query={query} />
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {loading ? "Loading doctors..." : `${filteredDoctors.length} Doctor${filteredDoctors.length !== 1 ? "s" : ""} Found`}
            </h1>
            {query && <p className="text-sm text-slate-500 mt-0.5">Results for &ldquo;<span className="font-medium text-blue-600">{query}</span>&rdquo;</p>}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            Sorted by {sortBy === "rating" ? "Rating" : sortBy === "experience" ? "Experience" : "Fee"}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-3" />
            <p className="text-slate-500 text-sm">Connecting to database...</p>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Doctors Found</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">Try broadening your search or removing some filters.</p>
            <Button variant="outline" onClick={() => { setQuery(""); setSearchValue(""); setSelectedSpec("All Specializations"); setSelectedCity("All Cities"); setSelectedType("All Types"); }}>
              Clear All Filters
            </Button>
          </div>
        )}

        {!loading && filteredDoctors.length > 0 && (
          <div className="mt-10 p-5 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-semibold text-slate-900">Not sure which specialist is right for you?</p>
              <p className="text-xs text-slate-500 mt-0.5">Let our AI analyze your symptoms.</p>
            </div>
            <Button size="sm" className="shrink-0 bg-blue-600 hover:bg-blue-700"
              onClick={() => { setSearchValue("back pain"); setQuery("back pain"); setShowAI(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              Try AI Checker
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
