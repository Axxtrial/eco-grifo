"use client";

import React from "react";

export default function AlertasSkeleton() {
  return (
    <div className="min-h-screen bg-[#080710] text-white select-none animate-pulse">
      
      {/* Header Sticky Skeleton */}
      <div className="p-6 pb-4 border-b border-white/5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-7 w-24 bg-white/10 rounded-full" />
          <div className="w-9 h-9 rounded-full bg-white/5" />
        </div>
        <div className="h-3.5 w-44 bg-white/5 rounded-full" />
      </div>

      {/* Alertas List Skeleton */}
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4"
          >
            {/* Icon Container Skeleton */}
            <div className="w-12 h-12 rounded-2xl bg-white/5 shrink-0" />

            {/* Content Details Skeleton */}
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 bg-white/10 rounded-full" />
                <div className="h-2.5 w-16 bg-white/5 rounded-full" />
              </div>
              <div className="h-3 w-40 bg-white/5 rounded-full" />
              <div className="h-2.5 w-full bg-white/5 rounded-full" />
              <div className="h-2.5 w-5/6 bg-white/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
