"use client";

import { useAppContext } from "@/lib/context";
import { Mail, Lock, Bell, LogOut, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function Perfil() {
  const { usuario } = useAppContext();
  const [notificaciones, setNotificaciones] = useState(true);

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
          <div className="p-4 flex items-center justify-between hover:bg-red-500/10 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-sm text-red-500 font-medium">Eliminar cuenta</span>
            </div>
          </div>
        </div>
      </div>

      <button className="w-full flex items-center justify-center gap-2 py-4 text-muted hover:text-white transition-colors">
        <LogOut className="w-5 h-5" />
        <span className="font-semibold text-sm">Cerrar Sesión</span>
      </button>

      <p className="text-center text-xs text-muted/50 mt-8 mb-4">
        TuGrifo App v1.0.0
      </p>

    </main>
  );
}
