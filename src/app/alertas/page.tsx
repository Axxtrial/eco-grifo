"use client";

import { useAppContext } from "@/lib/context";
import AlertaItem from "@/components/AlertaItem";
import { CheckCheck } from "lucide-react";

export default function Alertas() {
  const { alertas, alertasNoLeidas, marcarAlertasLeidas } = useAppContext();

  return (
    <main className="p-0">
      <div className="sticky top-0 bg-background/90 backdrop-blur-md z-10 p-6 pb-4 border-b border-border">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-white">Alertas</h1>
          {alertasNoLeidas > 0 && (
            <button 
              onClick={marcarAlertasLeidas}
              className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
            >
              <CheckCheck className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-sm text-muted">
          {alertasNoLeidas > 0 
            ? `Tienes ${alertasNoLeidas} alerta${alertasNoLeidas > 1 ? 's' : ''} sin leer` 
            : 'Estás al día'}
        </p>
      </div>

      <div className="pb-6">
        {alertas.length === 0 ? (
          <div className="p-6 text-center text-muted">No hay alertas.</div>
        ) : (
          alertas.map(alerta => (
            <AlertaItem key={alerta.id} alerta={alerta} />
          ))
        )}
      </div>
    </main>
  );
}
