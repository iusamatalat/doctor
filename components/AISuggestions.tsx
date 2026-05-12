"use client";

import React from "react";
import Link from "next/link";
import { Bot, AlertTriangle, AlertCircle, Info, ArrowRight, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AISuggestion } from "@/lib/mockData";

interface AISuggestionsProps {
  suggestions: AISuggestion[];
  query: string;
}

const urgencyConfig = {
  low: {
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    badge: "success" as const,
    icon: Info,
    label: "Low Priority",
  },
  medium: {
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    badge: "warning" as const,
    icon: AlertCircle,
    label: "Moderate Priority",
  },
  high: {
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    badge: "destructive" as const,
    icon: AlertTriangle,
    label: "High Priority",
  },
};

export default function AISuggestions({ suggestions, query }: AISuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-6 animate-fade-in">
      {/* AI Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">AI Symptom Analysis</p>
          <p className="text-xs text-slate-500">
            Showing results for &ldquo;<span className="font-medium text-blue-600">{query}</span>&rdquo;
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
        {suggestions.map((suggestion, index) => {
          const config = urgencyConfig[suggestion.urgency];
          const UrgencyIcon = config.icon;

          return (
            <Card
              key={index}
              className={`border ${config.bg} shadow-none hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <UrgencyIcon className={`h-4 w-4 ${config.color}`} />
                    <span className="text-sm font-semibold text-slate-800 capitalize">
                      {suggestion.symptom}
                    </span>
                  </div>
                  <Badge variant={config.badge} className="shrink-0 text-xs">
                    {config.label}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {suggestion.description}
                </p>

                <div className="mb-3">
                  <p className="text-xs font-medium text-slate-500 mb-2">Recommended Specialists:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestion.specializations.map((spec) => (
                      <Link
                        key={spec}
                        href={`/search?specialization=${encodeURIComponent(spec)}`}
                        className="group inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full px-2.5 py-1 transition-colors"
                      >
                        {spec}
                        <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </div>

                <Link href={`/search?query=${encodeURIComponent(suggestion.specializations[0])}`}>
                  <Button size="sm" variant="outline" className="w-full text-xs h-8 border-slate-300">
                    Find {suggestion.specializations[0]}
                    <ArrowRight className="h-3 w-3 ml-1.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
        <Bot className="h-3.5 w-3.5" />
        AI suggestions are for informational purposes only. Always consult a qualified physician.
      </p>
    </div>
  );
}
