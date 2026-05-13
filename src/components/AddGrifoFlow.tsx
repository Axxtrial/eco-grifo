"use client";

import React, { useState } from 'react';
import { Wifi, Settings, Edit3, X } from 'lucide-react';
import { useAppContext } from '@/lib/context';
import { Grifo } from '@/lib/mock-data';

interface AddGrifoFlowProps {
  onClose: () => void;
}

export default function AddGrifoFlow({ onClose }: AddGrifoFlowProps) {
  const [step, setStep] = useState(1);
  const { agregarGrifo } = useAppContext();
  
  // State for form
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleFinish = () => {
    const nuevoGrifo: Grifo = {
      id: `g${Date.now()}`,
      nombre: nombre || "Nuevo Grifo",
      ubicacion: ubicacion || "Casa",
      ip: `192.168.1.${Math.floor(Math.random() * 100) + 100}`,
      status: "online",
      consumoHoy: 0,
      consumoTiempoReal: 0,
      ultimaActividad: new Date().toISOString()
    };
    agregarGrifo(nuevoGrifo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-sm rounded-3xl border border-border overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-border/50">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? 'bg-primary w-6' : 'bg-border w-2'}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted font-medium">Paso {step} de 3</span>
          <button onClick={onClose} className="p-1.5 rounded-full bg-border/50 text-muted hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {step === 1 && (
            <div className="flex flex-col items-center text-center animate-in slide-in-from-right-4 duration-300">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '3s' }} />
                <Wifi className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Conecta al Grifo</h2>
              <p className="text-sm text-muted mb-8 leading-relaxed">
                Ve a la configuración Wi-Fi de tu teléfono y conéctate a la red llamada <span className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded">TuGrifo_Setup</span>
              </p>
              <button 
                onClick={handleNext}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-btn"
              >
                Siguiente
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col animate-in slide-in-from-right-4 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                <Settings className="w-8 h-8 text-primary animate-[spin_4s_linear_infinite]" />
              </div>
              <h2 className="text-xl font-bold text-white text-center mb-2">Configura la Red</h2>
              <p className="text-xs text-muted text-center mb-6">
                Ingresa los datos de tu red WiFi para que el grifo pueda enviar datos.
              </p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-semibold text-muted ml-1 mb-1 block">Nombre de Red (SSID)</label>
                  <input 
                    type="text" 
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="Mi_WiFi_Casa"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted ml-1 mb-1 block">Contraseña</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                onClick={handleNext}
                disabled={!ssid || !password}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col animate-in slide-in-from-right-4 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                <Edit3 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-white text-center mb-2">Personaliza tu Grifo</h2>
              <p className="text-xs text-muted text-center mb-6">
                Dale un nombre y ubicación para identificarlo fácilmente.
              </p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-semibold text-muted ml-1 mb-1 block">Nombre del Grifo</label>
                  <input 
                    type="text" 
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="Grifo Cocina"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted ml-1 mb-1 block">Ubicación</label>
                  <input 
                    type="text" 
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="Ej. Cocina, Baño, Jardín"
                  />
                </div>
              </div>

              <button 
                onClick={handleFinish}
                disabled={!nombre}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Finalizar
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
