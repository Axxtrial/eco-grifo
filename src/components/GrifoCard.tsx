import React from 'react';
import { Grifo } from '@/lib/mock-data';
import { Droplet, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface GrifoCardProps {
  grifo: Grifo;
  onClick?: () => void;
  className?: string;
  showDetails?: boolean;
}

export default function GrifoCard({ grifo, onClick, className, showDetails = false }: GrifoCardProps) {
  const isOnline = grifo.status === 'online';
  const isAlert = grifo.status === 'alerta';
  const isOffline = grifo.status === 'offline';

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-2xl p-4 transition-all duration-200",
        onClick && "cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]",
        className
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-full",
            isOnline ? "bg-primary/10 text-primary" : 
            isAlert ? "bg-yellow-500/10 text-yellow-500" : "bg-gray-500/10 text-gray-500"
          )}>
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{grifo.nombre}</h3>
            <p className="text-xs text-muted">{grifo.ubicacion}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isOnline && <><Wifi className="w-4 h-4 text-green-500" /><span className="text-[10px] uppercase font-bold text-green-500">Online</span></>}
          {isAlert && <><AlertTriangle className="w-4 h-4 text-yellow-500" /><span className="text-[10px] uppercase font-bold text-yellow-500">Alerta</span></>}
          {isOffline && <><WifiOff className="w-4 h-4 text-gray-500" /><span className="text-[10px] uppercase font-bold text-gray-500">Offline</span></>}
        </div>
      </div>

      <div className="flex items-end justify-between mt-4">
        <div>
          <p className="text-xs text-muted mb-0.5">Consumo hoy</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{grifo.consumoHoy.toFixed(1)}</span>
            <span className="text-sm text-muted font-medium">L</span>
          </div>
        </div>
        
        {grifo.consumoTiempoReal > 0 && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-primary animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-bold">{grifo.consumoTiempoReal.toFixed(1)} L/m</span>
            </div>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider">Dirección IP</p>
            <p className="text-sm text-white font-mono mt-0.5">{grifo.ip}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider">Última act.</p>
            <p className="text-sm text-white mt-0.5">
              {new Date(grifo.ultimaActividad).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
