"use client";

import React from "react";

export default function PerfilSkeleton() {
  return (
    <div className="p-6 min-h-screen bg-[#080710] text-white select-none animate-pulse">
      
      {/* Title Skeleton */}
      <div className="h-7 w-20 bg-white/10 rounded-full mb-8" />

      {/* User Card / Avatar Skeleton */}
      <div className="flex flex-col items-center mb-10 space-y-3">
        <div className="w-24 h-24 rounded-full bg-white/10" />
        <div className="h-5 w-32 bg-white/10 rounded-full" />
        <div className="h-3 w-40 bg-white/5 rounded-full" />
      </div>

      {/* Account Settings List Skeleton */}
      <div className="mb-8">
        <div className="h-3 w-16 bg-white/5 rounded-full mb-3 ml-2" />
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl divide-y divide-white/5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5" />
                <div className="h-3.5 w-32 bg-white/10 rounded-full" />
              </div>
              {i === 3 && (
                <div className="w-12 h-6 rounded-full bg-white/5" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone Skeleton */}
      <div className="mb-8">
        <div className="h-3 w-16 bg-red-500/10 rounded-full mb-3 ml-2" />
        <div className="bg-red-500/[0.02] border border-red-500/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/5" />
            <div className="h-3.5 w-28 bg-red-500/10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Sign Out Button Skeleton */}
      <div className="py-4 flex justify-center items-center gap-2">
        <div className="w-5 h-5 bg-white/5 rounded-full" />
        <div className="h-3.5 w-24 bg-white/10 rounded-full" />
      </div>

      {/* Footer Version Skeleton */}
      <div className="flex justify-center mt-8">
        <div className="h-3 w-28 bg-white/5 rounded-full" />
      </div>

    </div>
  );
}
