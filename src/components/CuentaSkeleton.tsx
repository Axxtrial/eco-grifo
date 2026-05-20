"use client";

import React from "react";

export default function CuentaSkeleton() {
  return (
    <div className="p-6 min-h-screen bg-[#080710] text-white select-none animate-pulse">
      
      {/* Title Skeleton */}
      <div className="h-7 w-32 bg-white/10 rounded-full mb-6" />

      {/* Grid Stats Skeleton */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[1, 2].map((i) => (
          <div 
            key={i} 
            className="bg-white/[0.03] border border-white/[0.06] p-5 rounded-2xl space-y-3"
          >
            <div className="h-3 w-16 bg-white/5 rounded-full" />
            <div className="h-8 w-12 bg-white/10 rounded-xl" />
            <div className="h-2.5 w-16 bg-white/5 rounded-full" />
          </div>
        ))}
      </div>

      {/* Global Meta Diaria Card Skeleton */}
      <div className="bg-white/[0.03] border border-white/[0.06] p-4 rounded-2xl mb-8 flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-2.5 w-24 bg-white/5 rounded-full" />
          <div className="flex items-baseline gap-1">
            <div className="h-7 w-16 bg-white/10 rounded-xl" />
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/5" />
      </div>

      {/* List Header Skeleton */}
      <div className="mb-6 flex justify-between items-center">
        <div className="h-4 w-28 bg-white/15 rounded-full" />
        <div className="w-8 h-8 rounded-full bg-white/10" />
      </div>

      {/* Vertical Grifos List Skeleton */}
      <div className="flex flex-col gap-4 mb-8">
        {[1, 2].map((i) => (
          <div 
            key={i} 
            className="bg-white/[0.03] border border-white/[0.06] p-5 rounded-2xl space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="w-8 h-8 rounded-full bg-white/10" />
              <div className="h-3.5 w-12 bg-white/5 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-white/10 rounded-full" />
              <div className="h-2.5 w-16 bg-white/5 rounded-full" />
            </div>
            <div className="pt-2 border-t border-white/5 flex justify-between">
              <div className="h-3 w-14 bg-white/5 rounded-full" />
              <div className="h-3 w-14 bg-white/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
