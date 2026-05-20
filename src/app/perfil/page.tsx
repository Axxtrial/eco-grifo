"use client";

import { useAppContext } from "@/lib/context";
import { Mail, Lock, Bell, LogOut, AlertTriangle, Cpu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function Perfil() {
  const { usuario, logout, eliminarCuenta } = useAppContext();
  const [notificaciones, setNotificaciones] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDeleteAccount = async () => {
    await eliminarCuenta();
    setShowConfirmDelete(false);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-white mb-8">Perfil</h1>

      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 rounded-full bg-gradient-btn flex items-center justify-center mb-4 shadow-xl shadow-primary/20">
          <span className="text-3xl font-bold text-white">
            {usuario.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </span>
        </div>
        <h2 className="text-xl font-bold text-white">{usuario.nombre}</h2>
        <p className="text-sm text-muted">{usuario.correo}</p>
      </div>

      <div className="mb-8">
        <h3 className="text-xs text-muted uppercase font-bold tracking-wider mb-3 ml-2">Cuenta</h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          
          <div className="p-4 flex items-center justify-between border-b border-border/50 hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-sm text-white font-medium">Cambiar correo</span>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between border-b border-border/50 hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-sm text-white font-medium">Cambiar contraseña</span>
            </div>
          </div>

          <Link href="/simulador" className="p-4 flex items-center justify-between border-b border-border/50 hover:bg-white/5 transition-colors cursor-pointer block">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm text-white font-medium block">Simulador Grifo IoT</span>
                <span className="text-[10px] text-muted block">Abrir panel interactivo de demostración</span>
              </div>
            </div>
          </Link>

          <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-sm text-white font-medium">Notificaciones</span>
            </div>
            <button 
              onClick={() => setNotificaciones(!notificaciones)}
              className={`w-12 h-6 rounded-full transition-colors relative ${notificaciones ? 'bg-primary' : 'bg-border'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notificaciones ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs text-red-500/80 uppercase font-bold tracking-wider mb-3 ml-2">Peligro</h3>
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden">
          <button 
            onClick={() => setShowConfirmDelete(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-red-500/10 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-sm text-red-500 font-medium">Eliminar cuenta</span>
            </div>
          </button>
        </div>
      </div>

      <button 
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-4 text-muted hover:text-white transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-semibold text-sm">Cerrar Sesión</span>
      </button>

      <p className="text-center text-xs text-muted/50 mt-8 mb-4">
        EcoGrifo App v1.0.0
      </p>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE CUENTA (Wow Factor) */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-[32px] border border-red-500/20 p-6 relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Círculo difuminado rojo */}
            <div className="absolute top-[-20%] left-[-20%] w-[200px] h-[200px] bg-red-500/10 rounded-full blur-[60px] pointer-events-none" />

            <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center text-red-500 mb-5 mx-auto border border-red-500/20">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-white text-center mb-2">¿Eliminar tu cuenta?</h3>
            <p className="text-xs text-muted text-center leading-relaxed mb-6">
              Esta acción es irreversible y borrará permanentemente todos tus grifos vinculados, historial de consumo y alertas asociadas de <strong>EcoGrifo</strong>.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-colors shadow-lg shadow-red-500/20"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
