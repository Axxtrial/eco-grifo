"use client";

import React from "react";

export default function HistorialSkeleton() {
  return (
    <div className="p-6 min-h-screen bg-[#080710] text-white select-none animate-pulse">
      
      {/* Title Skeleton */}
      <div className="h-7 w-28 bg-white/10 rounded-full mb-6" />

      {/* Tap Filter Pills Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 mb-6 scrollbar-none">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="h-9 w-20 bg-white/5 rounded-full shrink-0 border border-white/[0.04]"
          />
        ))}
      </div>

      {/* Grid Cards (Consumo Total & Promedio) */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[1, 2].map((i) => (
          <div 
            key={i} 
            className="bg-white/[0.03] border border-white/[0.06] p-5 rounded-2xl space-y-3"
          >
            <div className="h-3 w-16 bg-white/5 rounded-full" />
            <div className="h-8 w-20 bg-white/10 rounded-xl" />
            <div className="h-2.5 w-12 bg-white/5 rounded-full" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="mb-8">
        <div className="h-4 w-32 bg-white/15 rounded-full mb-4" />
        <div className="h-64 bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex justify-end gap-4 mb-2">
            <div className="h-3 w-12 bg-white/5 rounded-full" />
            <div className="h-3 w-16 bg-white/5 rounded-full" />
          </div>
          {/* Chart Columns Simulation */}
          <div className="flex justify-around items-end h-[75%] border-b border-white/5 pb-4">
            {[40, 75, 55, 30, 90, 60, 45].map((h, idx) => (
              <div 
                key={idx} 
                className="w-4 bg-white/10 rounded-t-sm" 
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          {/* Chart Axes Simulation */}
          <div className="flex justify-around mt-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-2.5 w-8 bg-white/5 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Logs Skeleton */}
      <div>
        <div className="h-4 w-36 bg-white/15 rounded-full mb-4" />
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl divide-y divide-white/5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center" />
                <div className="space-y-2">
                  <div className="h-3.5 w-24 bg-white/10 rounded-full" />
                  <div className="h-2.5 w-32 bg-white/5 rounded-full" />
                </div>
              </div>
              <div className="h-4 w-12 bg-white/10 rounded-full" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
