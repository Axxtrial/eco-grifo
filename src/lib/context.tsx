"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Grifo, 
  Alerta, 
  Usuario, 
  mockGrifos, 
  mockAlertas, 
  mockUsuario, 
  mockHistorial,
  HistorialConsumo
} from "./mock-data";

interface AppContextType {
  usuario: Usuario;
  grifos: Grifo[];
  alertas: Alerta[];
  historial: HistorialConsumo[];
  alertasNoLeidas: number;
  setUsuario: React.Dispatch<React.SetStateAction<Usuario>>;
  marcarAlertasLeidas: () => void;
  agregarGrifo: (grifo: Grifo) => void;
  eliminarGrifo: (id: string) => void;
  actualizarGrifo: (id: string, data: Partial<Grifo>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario>(mockUsuario);
  const [grifos, setGrifos] = useState<Grifo[]>(mockGrifos);
  const [alertas, setAlertas] = useState<Alerta[]>(mockAlertas);
  const [historial, setHistorial] = useState<HistorialConsumo[]>(mockHistorial);

  // Simular consumo en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setGrifos((prevGrifos) => 
        prevGrifos.map((grifo) => {
          if (grifo.status === "online" || grifo.status === "alerta") {
            // Oscilar entre 0 y 5 L/min aleatoriamente si estaba fluyendo, o mantener 0
            const fluyendo = Math.random() > 0.7; // 30% chance de estar fluyendo
            const consumoActual = fluyendo ? parseFloat((Math.random() * 5).toFixed(1)) : 0;
            
            // Si hay consumo en tiempo real, aumentar un poco el consumo de hoy
            const incrementoHoy = consumoActual > 0 ? parseFloat((consumoActual / 60).toFixed(2)) : 0;

            return {
              ...grifo,
              consumoTiempoReal: consumoActual,
              consumoHoy: parseFloat((grifo.consumoHoy + incrementoHoy).toFixed(2))
            };
          }
          return grifo;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const alertasNoLeidas = alertas.filter(a => !a.leida).length;

  const marcarAlertasLeidas = () => {
    setAlertas(prev => prev.map(a => ({ ...a, leida: true })));
  };

  const agregarGrifo = (grifo: Grifo) => {
    setGrifos(prev => [...prev, grifo]);
  };

  const eliminarGrifo = (id: string) => {
    setGrifos(prev => prev.filter(g => g.id !== id));
  };

  const actualizarGrifo = (id: string, data: Partial<Grifo>) => {
    setGrifos(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  };

  return (
    <AppContext.Provider value={{
      usuario,
      grifos,
      alertas,
      historial,
      alertasNoLeidas,
      setUsuario,
      marcarAlertasLeidas,
      agregarGrifo,
      eliminarGrifo,
      actualizarGrifo
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
