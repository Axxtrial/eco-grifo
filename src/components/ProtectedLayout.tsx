"use client";

import React from "react";
import { useAppContext } from "@/lib/context";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import AuthScreen from "@/components/AuthScreen";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import HistorialSkeleton from "@/components/HistorialSkeleton";
import AlertasSkeleton from "@/components/AlertasSkeleton";
import PerfilSkeleton from "@/components/PerfilSkeleton";
import CuentaSkeleton from "@/components/CuentaSkeleton";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { sesion, loading, isSupabaseConfigured } = useAppContext();
  const pathname = usePathname();

  if (loading) {
    if (pathname === "/historial") {
      return <HistorialSkeleton />;
    }
    if (pathname === "/alertas") {
      return <AlertasSkeleton />;
    }
    if (pathname === "/perfil") {
      return <PerfilSkeleton />;
    }
    if (pathname === "/cuenta") {
      return <CuentaSkeleton />;
    }
    return <DashboardSkeleton />;
  }

  // Interceptar si Supabase está configurado pero no hay sesión activa
  if (isSupabaseConfigured && !sesion) {
    return <AuthScreen />;
  }

  return (
    <>
      <div className="pb-20 animate-in fade-in duration-500">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
