"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface AuthScreenProps {
  onSuccess?: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (!supabase) {
      setTimeout(() => {
        setLoading(false);
        if (onSuccess) onSuccess();
      }, 900);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: correo,
          password: contrasenia,
          options: { data: { nombre: nombre || "Usuario Nuevo" } },
        });
        if (signUpError) throw signUpError;
        if (data.user && !data.session) {
          setSuccessMsg("¡Registro exitoso! Revisa tu correo para activar tu cuenta.");
          setLoading(false);
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: correo,
          password: contrasenia,
        });
        if (signInError) throw signInError;
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (!supabase) {
      setTimeout(() => {
        setLoading(false);
        if (onSuccess) onSuccess();
      }, 900);
      return;
    }

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: { redirectTo: window.location.origin },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || "Error al iniciar sesión con Discord.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">

      {/* ── Decoración de fondo ── */}
      <div className="absolute top-0 left-0 w-56 h-56 bg-primary/20 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* ── Wordmark ── */}
      <div className="relative z-10 flex flex-col items-center pt-16 pb-10 px-6">
        {/* Nombre de la app como wordmark grande */}
        <h1 className="text-5xl font-black tracking-tight text-center leading-none mb-3">
          <span className="text-white">Eco</span>
          <span className="text-gradient">Grifo</span>
        </h1>

        <p className="text-sm text-muted text-center max-w-[200px] leading-relaxed">
          {isSignUp
            ? "Crea tu cuenta y empieza a monitorear"
            : "Bienvenido de vuelta"}
        </p>
      </div>

      {/* ── Card principal ── */}
      <div className="relative z-10 flex-1 px-4 pb-8">
        <div className="bg-card border border-border rounded-3xl p-5 shadow-2xl relative overflow-hidden">
          {/* Acento interior */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          {/* ── Tabs ── */}
          <div className="relative flex bg-background rounded-2xl p-1 mb-5">
            <button
              onClick={() => { setIsSignUp(false); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                !isSignUp
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20"
                  : "text-muted hover:text-white"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isSignUp
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20"
                  : "text-muted hover:text-white"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* ── Alertas ── */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{successMsg}</p>
            </div>
          )}

          {/* ── Formulario ── */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <div className="group">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1 mb-1.5 block">
                  Nombre Completo
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center group-focus-within:bg-primary/20 transition-colors">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-background border border-border focus:border-primary rounded-2xl pl-13 pr-4 py-3.5 text-sm text-white focus:outline-none transition-all placeholder-muted/40 font-medium"
                    style={{ paddingLeft: "3.25rem" }}
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>
            )}

            <div className="group">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1 mb-1.5 block">
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center group-focus-within:bg-primary/20 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                </div>
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full bg-background border border-border focus:border-primary rounded-2xl pr-4 py-3.5 text-sm text-white focus:outline-none transition-all placeholder-muted/40 font-medium"
                  style={{ paddingLeft: "3.25rem" }}
                  placeholder="juan@ejemplo.com"
                />
              </div>
            </div>

            <div className="group">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1 mb-1.5 block">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center group-focus-within:bg-primary/20 transition-colors">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                </div>
                <input
                  type="password"
                  required
                  value={contrasenia}
                  onChange={(e) => setContrasenia(e.target.value)}
                  className="w-full bg-background border border-border focus:border-primary rounded-2xl pr-4 py-3.5 text-sm text-white focus:outline-none transition-all placeholder-muted/40 font-medium"
                  style={{ paddingLeft: "3.25rem" }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Botón principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-4 bg-gradient-btn rounded-2xl text-sm font-bold text-white shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? "Crear Cuenta" : "Entrar"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ── Separador ── */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted/50 font-bold uppercase tracking-widest whitespace-nowrap">
              o continúa con
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* ── Discord OAuth ── */}
          <button
            type="button"
            onClick={handleDiscordSignIn}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl border border-[#5865F2]/30 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 hover:border-[#5865F2]/60 text-white text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-lg hover:shadow-[#5865F2]/10 group"
          >
            <svg
              className="w-5 h-5 flex-shrink-0 fill-[#5865F2]"
              viewBox="0 0 127.14 96.36"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.45-5c.87-.64,1.72-1.32,2.53-2a75.47,75.47,0,0,0,72.76,0c.81.71,1.66,1.4,2.53,2a68.61,68.61,0,0,1-10.45,5,77.94,77.94,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.81,48.74,124,25.9,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
            </svg>
            <span>Continuar con Discord</span>
          </button>
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-[11px] text-muted/40 mt-5 leading-relaxed px-6">
          Al continuar, aceptas nuestros{" "}
          <span className="text-primary/60">Términos de Servicio</span> y{" "}
          <span className="text-primary/60">Política de Privacidad</span>
        </p>
      </div>
    </div>
  );
}
