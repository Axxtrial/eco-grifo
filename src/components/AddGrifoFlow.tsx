"use client";

import React, { useState, useEffect } from 'react';
import { Wifi, Settings, Copy, Check, CheckCircle2, Loader2, X, Info } from 'lucide-react';
import { useAppContext } from '@/lib/context';
import { Grifo } from '@/lib/mock-data';

interface AddGrifoFlowProps {
  onClose: () => void;
}

export default function AddGrifoFlow({ onClose }: AddGrifoFlowProps) {
  const [step, setStep] = useState(1);
  const { grifos, sesion } = useAppContext();
  
  const [nombreGrifo, setNombreGrifo] = useState("Grifo Cocina");
  const [ubicacionGrifo, setUbicacionGrifo] = useState("Cocina");
  
  // Guardar el total inicial de grifos para detectar el nuevo en tiempo real
  const [initialCount] = useState(grifos.length);
  const [copied, setCopied] = useState(false);
  const [newTapDetected, setNewTapDetected] = useState<Grifo | null>(null);

  // Obtener Token de Vinculación (UserID del usuario autenticado o mock)
  const tokenVinculacion = sesion?.user?.id || "usr_ecogrifo_demo_5542";

  // Efecto que escucha en tiempo real si se agrega un nuevo grifo
  useEffect(() => {
    if (step === 3 && grifos.length > initialCount) {
      // Encontrar cuál es el nuevo grifo
      const nuevo = grifos[grifos.length - 1];
      setNewTapDetected(nuevo);
      setStep(4); // Ir a la pantalla de éxito
    }
  }, [grifos, initialCount, step]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(tokenVinculacion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };



  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-[32px] border border-border overflow-hidden shadow-2xl relative">
        
        {/* Círculo difuminado de fondo premium */}
        <div className="absolute top-[-20%] left-[-20%] w-[250px] h-[250px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-border/40 relative z-10">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  s === 4 ? 'hidden' : s <= step ? 'bg-primary w-6' : 'bg-border w-2'
                }`}
              />
            ))}
          </div>
          {step < 4 && (
            <span className="text-xs text-muted font-bold tracking-wider uppercase">Paso {step} de 3</span>
          )}
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full bg-white/5 text-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 relative z-10">
          
          {/* PASO 1: Copiar Token de Vinculación */}
          {step === 1 && (
            <div className="flex flex-col animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                <Settings className="w-8 h-8 text-primary animate-[spin_10s_linear_infinite]" />
              </div>
              
              <h2 className="text-2xl font-black text-white text-center mb-2">Token de Vinculación</h2>
              <p className="text-sm text-muted text-center mb-6 leading-relaxed">
                Este código asocia el hardware físico del grifo con tu cuenta de Supabase de forma segura.
              </p>

              {/* Box del Token */}
              <div className="bg-background border border-border rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Tu ID de Usuario</p>
                  <p className="text-xs font-mono text-white truncate font-medium">
                    {tokenVinculacion}
                  </p>
                </div>
                <button
                  onClick={handleCopyToken}
                  className={`p-3 rounded-xl shrink-0 transition-all ${
                    copied ? 'bg-green-500/20 text-green-400' : 'bg-primary/15 text-primary hover:bg-primary/25'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex gap-2.5 p-3.5 rounded-2xl bg-primary/5 border border-primary/10 text-xs text-muted mb-8 leading-relaxed">
                <Info className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                <p>Copia el token arriba. Lo pegarás en la pantalla de configuración local del grifo en el siguiente paso.</p>
              </div>

              <button 
                onClick={handleNext}
                className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/20 text-white"
              >
                He copiado el Token
              </button>
            </div>
          )}

          {/* PASO 2: Instrucciones de Conexión Local WiFi */}
          {step === 2 && (
            <div className="flex flex-col animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto relative">
                <div className="absolute inset-0 rounded-2xl border border-primary/30 animate-ping" style={{ animationDuration: '3.5s' }} />
                <Wifi className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-xl font-black text-white text-center mb-2">Conectar a la Red</h2>
              <p className="text-xs text-muted text-center mb-6 leading-relaxed">
                Sigue estos pasos en tu dispositivo para mandar la red al grifo:
              </p>

              {/* Pasos */}
              <div className="space-y-4 mb-8">
                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-white/5 text-xs font-bold text-white flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <p className="text-xs text-muted leading-relaxed">
                    Ve a los ajustes Wi-Fi de tu móvil y conéctate a la red temporal del grifo: <span className="text-white font-mono bg-white/10 px-1 rounded font-bold">EcoGrifo_Setup</span>.
                  </p>
                </div>
                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-white/5 text-xs font-bold text-white flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <p className="text-xs text-muted leading-relaxed">
                    Se abrirá un portal cautivo automático. Si no aparece, abre un navegador e ingresa a: <span className="text-primary font-mono font-bold">http://192.168.4.1</span>.
                  </p>
                </div>
                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-white/5 text-xs font-bold text-white flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <p className="text-xs text-muted leading-relaxed">
                    Introduce el SSID y clave de tu red doméstica, **pega tu Token de Vinculación** y presiona **Guardar**. El grifo se reiniciará para conectarse.
                  </p>
                </div>
              </div>

              <button 
                onClick={handleNext}
                className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/20 text-white"
              >
                Ya lo he configurado en http://192.168.4.1
              </button>
            </div>
          )}

          {/* PASO 3: Espera Activa con Websockets */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5 relative">
                <div className="absolute inset-0 rounded-full border-2 border-primary/25 animate-ping" />
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              
              <h2 className="text-xl font-black text-white mb-2">Buscando Dispositivo</h2>
              <p className="text-xs text-muted mb-5 leading-relaxed max-w-xs mx-auto">
                Personaliza los detalles de tu grifo a continuación. El sistema se sincronizará automáticamente cuando se conecte.
              </p>

              {/* Formulario de Personalización de Grifo */}
              <div className="w-full space-y-4 mb-6 text-left bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5 ml-1">Nombre del Grifo</label>
                  <input 
                    type="text" 
                    value={nombreGrifo} 
                    onChange={(e) => setNombreGrifo(e.target.value)}
                    placeholder="Ej. Grifo Cocina, Ducha..."
                    className="w-full bg-background border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5 ml-1">Ubicación</label>
                  <input 
                    type="text" 
                    value={ubicacionGrifo} 
                    onChange={(e) => setUbicacionGrifo(e.target.value)}
                    placeholder="Ej. Cocina, Baño Principal..."
                    className="w-full bg-background border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="w-full p-3.5 rounded-xl bg-white/[0.02] border border-white/5 mb-5">
                <p className="text-[10px] text-muted italic">
                  Escuchando cambios en la base de datos a través de WebSockets...
                </p>
              </div>

            </div>
          )}

          {/* PASO 4: Éxito total */}
          {step === 4 && (
            <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/30">
                <CheckCircle2 className="w-12 h-12 text-green-400 fill-green-500/10" />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2">¡Vinculación Exitosa!</h2>
              <p className="text-sm text-muted mb-6 leading-relaxed">
                El grifo inteligente se ha registrado y conectado con Supabase correctamente.
              </p>

              {newTapDetected && (
                <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-8 text-left space-y-1">
                  <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Dispositivo Detectado</p>
                  <p className="text-base font-bold text-white">{newTapDetected.nombre}</p>
                  <p className="text-xs text-muted">Ubicación: {newTapDetected.ubicacion} • IP: {newTapDetected.ip}</p>
                </div>
              )}

              <button 
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-bold bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20 text-white transition-colors"
              >
                Comenzar Monitoreo
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
