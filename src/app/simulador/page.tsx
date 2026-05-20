"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context";
import { ArrowLeft, Droplet, Play, Square, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Simulador() {
  const { grifos, actualizarGrifo, agregarAlerta, sesion } = useAppContext();
  
  // Seleccionar grifo activo o fallback a uno por defecto
  const [selectedId, setSelectedId] = useState<string>("");
  const [caudal, setCaudal] = useState<number>(0); // 0 a 10 L/min
  const [leakTimer, setLeakTimer] = useState<number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertSent, setAlertSent] = useState<boolean>(false);

  // Historial local de la simulación
  const [litrosConsumidosSim, setLitrosConsumidosSim] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const selectedGrifo = grifos.find((g) => g.id === selectedId) || grifos[0];

  // Auto-seleccionar el primer grifo cuando se carguen
  useEffect(() => {
    if (grifos.length > 0 && !selectedId) {
      setSelectedId(grifos[0].id);
    }
  }, [grifos, selectedId]);

  // Manejar simulación activa y actualizar Supabase/Contexto en tiempo real
  useEffect(() => {
    if (!isSimulating || !selectedGrifo) return;

    const interval = setInterval(() => {
      // Incrementar consumo simulado local
      // (caudal L / 60 seg) = litros por segundo
      const litrosPorSegundo = caudal / 60;
      setLitrosConsumidosSim((prev) => prev + litrosPorSegundo);

      // Actualizar el grifo en el contexto global (y por ende en Supabase en tiempo real)
      const nuevoConsumoHoy = parseFloat((selectedGrifo.consumoHoy + litrosPorSegundo).toFixed(4));
      
      actualizarGrifo(selectedGrifo.id, {
        consumoTiempoReal: caudal,
        consumoHoy: nuevoConsumoHoy,
        status: caudal > 0 ? (caudal > 6 ? "alerta" : "online") : "online",
        ultimaActividad: new Date().toISOString()
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, caudal, selectedGrifo, actualizarGrifo]);

  // Controlar temporizador de fuga
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating && caudal > 4.5) {
      timer = setInterval(() => {
        setLeakTimer((prev) => {
          const next = prev + 1;
          if (next >= 8 && !alertSent) {
            // Disparar Alerta de Fuga
            dispararAlertaFuga();
          }
          return next;
        });
      }, 1000);
    } else {
      setLeakTimer(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSimulating, caudal, alertSent]);

  const dispararAlertaFuga = () => {
    if (!selectedGrifo) return;
    setAlertSent(true);
    setShowAlert(true);
    
    // Registrar alerta en Supabase / Contexto
    agregarAlerta({
      tipo: "fuga",
      titulo: `Posible fuga en ${selectedGrifo.nombre}`,
      descripcion: `Se detectó un caudal constante de ${caudal.toFixed(1)} L/min por más de 8 segundos continuos.`,
      timestamp: new Date().toISOString(),
      leida: false,
      grifoId: selectedGrifo.id
    });

    // Poner el estado del grifo en alerta
    actualizarGrifo(selectedGrifo.id, {
      status: "alerta"
    });
  };

  const handleStartSimulation = () => {
    if (!selectedGrifo) return;
    setIsSimulating(true);
    setAlertSent(false);
    setShowAlert(false);
  };

  const handleStopSimulation = () => {
    setIsSimulating(false);
    setCaudal(0);
    setLeakTimer(0);
    
    if (selectedGrifo) {
      actualizarGrifo(selectedGrifo.id, {
        consumoTiempoReal: 0,
        status: "online"
      });
    }
  };

  const handleForzarFuga = () => {
    if (!isSimulating) handleStartSimulation();
    setCaudal(7.8);
    setAlertSent(false);
    setShowAlert(false);
  };

  // Determinar color de barra de agua según caudal
  const getWaterColorClass = () => {
    if (caudal === 0) return "bg-transparent";
    if (caudal < 3) return "bg-sky-400/60 shadow-sky-400/30";
    if (caudal < 6) return "bg-primary/70 shadow-primary/40";
    return "bg-red-500/80 shadow-red-500/50 animate-pulse";
  };

  return (
    <div className="min-h-screen bg-background text-white p-6 pb-24 relative overflow-hidden">
      
      {/* ── Fondos Decorativos ── */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-16 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -ml-16 pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between mb-8 relative z-10">
        <Link href="/" className="w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center text-muted hover:text-white hover:border-primary/50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-black tracking-tight uppercase">Simulador IoT</h1>
        <div className="w-10 h-10 opacity-0" />
      </header>

      {grifos.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-8 text-center relative z-10 max-w-sm mx-auto mt-12">
          <Droplet className="w-12 h-12 text-primary mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-white mb-2">No hay grifos activos</h2>
          <p className="text-xs text-muted leading-relaxed mb-6">
            Necesitas agregar al menos un grifo en la sección de **Mis Grifos** para poder simular su comportamiento.
          </p>
          <Link href="/cuenta" className="inline-block px-6 py-3 bg-gradient-btn text-white text-xs font-bold rounded-2xl shadow-lg">
            Ir a Mis Grifos
          </Link>
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-6 relative z-10">
          
          {/* Tarjeta de control de dispositivo */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />

            <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1 mb-2.5 block">
              Seleccionar Grifo Físico a Simular
            </label>
            
            <select
              value={selectedId}
              onChange={(e) => {
                handleStopSimulation();
                setSelectedId(e.target.value);
              }}
              className="w-full bg-background border border-border focus:border-primary rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none transition-all font-semibold cursor-pointer mb-5"
            >
              {grifos.map((g) => (
                <option key={g.id} value={g.id} className="bg-[#12121A]">
                  {g.nombre} ({g.ubicacion})
                </option>
              ))}
            </select>

            {/* Panel de Estado Simulado */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background border border-border/60 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Estado IoT</span>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isSimulating ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
                  <span className="text-sm font-bold">{isSimulating ? "Transmitiendo" : "Desconectado"}</span>
                </div>
              </div>
              <div className="bg-background border border-border/60 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Enviando a</span>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{sesion ? "Supabase Live" : "Modo Local PWA"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Animación del Grifo Interactivo */}
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden shadow-xl">
            {/* Fondo de agua dinámico detrás */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />

            {/* Cabezal de grifo simulado */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-border to-card border border-border/80 flex items-center justify-center relative shadow-lg z-10">
              <Droplet className={`w-7 h-7 text-sky-400 transition-transform duration-300 ${caudal > 0 ? "scale-110 fill-sky-400/20 animate-bounce" : "opacity-40"}`} />
              
              {/* Válvula de rosca interactiva visual */}
              <div 
                className="absolute -top-3 w-8 h-2.5 bg-neutral-600 rounded-full border border-neutral-500 transition-all duration-300"
                style={{ transform: `rotate(${caudal * 36}deg)` }}
              />
            </div>

            {/* Chorro de agua animado en CSS */}
            <div className="relative w-full flex flex-col items-center mt-0.5 min-h-[90px]">
              {caudal > 0 ? (
                <>
                  {/* El chorro de agua principal */}
                  <div 
                    className={`w-3.5 transition-all duration-300 rounded-b-full shadow-inner ${getWaterColorClass()}`}
                    style={{ 
                      height: "75px",
                      width: `${Math.max(4, caudal * 2.2)}px`,
                      opacity: 0.85
                    }}
                  />
                  {/* Partículas cayendo */}
                  <div className="absolute bottom-1.5 w-full flex justify-center gap-4 text-sky-400">
                    <span className="w-1 h-1 rounded-full bg-sky-400 animate-ping" />
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce delay-75" />
                    <span className="w-1 h-1 rounded-full bg-sky-400 animate-ping delay-150" />
                  </div>
                </>
              ) : (
                /* Goteo inactivo sutil */
                <div className="w-1 h-3 bg-sky-400/20 rounded-full animate-pulse mt-1" />
              )}
            </div>

            {/* Indicador de Caudal digital */}
            <div className="text-center mt-3 z-10">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Caudal Generado</p>
              <p className="text-3xl font-black tabular-nums text-white tracking-tight">
                {caudal.toFixed(1)} <span className="text-sm font-medium text-muted">L/min</span>
              </p>
            </div>
          </div>

          {/* Controles del Simulador */}
          <div className="bg-card border border-border rounded-3xl p-5 space-y-5 shadow-xl">
            
            {/* Slider de control de flujo */}
            <div>
              <div className="flex justify-between text-xs font-bold text-muted uppercase tracking-wider mb-2">
                <span>Cerrado</span>
                <span className={caudal > 6.5 ? "text-red-400" : caudal > 3 ? "text-yellow-400" : "text-primary"}>
                  {caudal > 0 ? `${caudal.toFixed(1)} Litros/min` : "Flujo detenido"}
                </span>
                <span>Max (10 L/m)</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.2"
                value={caudal}
                disabled={!isSimulating}
                onChange={(e) => setCaudal(parseFloat(e.target.value))}
                className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer focus:outline-none accent-primary disabled:opacity-40"
              />
            </div>

            {/* Botones de acción principal */}
            <div className="flex gap-3">
              {!isSimulating ? (
                <button
                  onClick={handleStartSimulation}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-btn text-white text-xs font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Conectar & Abrir</span>
                </button>
              ) : (
                <button
                  onClick={handleStopSimulation}
                  className="flex-1 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-red-400/20" />
                  <span>Detener Grifo</span>
                </button>
              )}

              <button
                onClick={handleForzarFuga}
                className="px-4 py-3.5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Forzar Fuga</span>
              </button>
            </div>

            {/* Datos acumulados en la sesión */}
            {isSimulating && (
              <div className="pt-4 border-t border-border/60 flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Consumo acumulado esta sesión:</span>
                <span className="font-bold text-white tabular-nums">{litrosConsumidosSim.toFixed(2)} Litros</span>
              </div>
            )}
          </div>

          {/* Notificación de Fuga simulada */}
          {showAlert && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-3xl flex gap-3.5 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-400 mb-0.5">¡Alerta de Fuga Reportada!</h4>
                <p className="text-xs text-muted leading-relaxed">
                  El sistema detectó flujo desatendido. Se ha registrado una alerta oficial en tu pestaña de **Alertas** y se envió una notificación a tu perfil.
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-green-400 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Sincronizado con Base de Datos</span>
                </div>
              </div>
            </div>
          )}

          {/* Temporizador de Fuga visual */}
          {isSimulating && caudal > 4.5 && !alertSent && (
            <div className="bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-2xl text-center text-xs text-yellow-500 font-semibold animate-pulse">
              ⚠️ Caudal elevado sostenido: Registrando alerta en {Math.max(0, 8 - leakTimer)}s...
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}
