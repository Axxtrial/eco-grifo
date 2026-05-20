"use client";

import React from "react";

export default function DashboardSkeleton() {
  return (
    <div className="p-6 min-h-screen bg-[#080710] text-white select-none animate-pulse">
      
      {/* Header Skeleton */}
      <header className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-white/5 rounded-full" />
          <div className="h-6 w-32 bg-white/10 rounded-full" />
        </div>
        <div className="w-10 h-10 rounded-full bg-white/10" />
      </header>

      {/* Main cards Skeleton */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        
        {/* Total Consumption Card Skeleton */}
        <div className="col-span-2 bg-white/[0.03] border border-white/[0.06] p-6 rounded-3xl space-y-4">
          <div className="h-3 w-32 bg-white/5 rounded-full" />
          <div className="flex items-baseline gap-2">
            <div className="h-12 w-24 bg-white/10 rounded-2xl" />
            <div className="h-5 w-6 bg-white/5 rounded-full" />
          </div>
        </div>

        {/* Real-time Caudal Card Skeleton */}
        <div className="col-span-2 bg-white/[0.03] border border-white/[0.06] p-4 rounded-2xl flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-2.5 w-28 bg-white/5 rounded-full" />
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="h-6 w-16 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>

      </div>

      {/* Daily Goal Skeleton */}
      <div className="mb-8 space-y-3">
        <div className="flex justify-between">
          <div className="h-3 w-40 bg-white/5 rounded-full" />
          <div className="h-3 w-8 bg-white/5 rounded-full" />
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full" />
      </div>

      {/* Mis Grifos Skeleton */}
      <div className="mb-8">
        <div className="h-4 w-24 bg-white/15 rounded-full mb-4" />
        
        {/* Horizontal Card Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-none">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="min-w-[200px] bg-white/[0.03] border border-white/[0.06] p-5 rounded-2xl shrink-0 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div className="h-3.5 w-12 bg-white/5 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 bg-white/10 rounded-full" />
                <div className="h-2.5 w-16 bg-white/5 rounded-full" />
              </div>
              <div className="pt-2 border-t border-white/5">
                <div className="h-3 w-14 bg-white/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="mb-4">
        <div className="h-4 w-32 bg-white/15 rounded-full mb-4" />
        <div className="h-64 bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 flex flex-col justify-between">
          
          {/* Chart Columns Simulation */}
          <div className="flex justify-around items-end h-[85%] border-b border-white/5 pb-4">
            {[30, 60, 45, 80, 20, 50, 70].map((h, idx) => (
              <div 
                key={idx} 
                className="w-4 bg-white/10 rounded-t-sm" 
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          {/* Chart Axes Simulation */}
          <div className="flex justify-around">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-2 w-8 bg-white/5 rounded-full" />
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
