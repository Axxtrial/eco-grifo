import React from 'react';
import { Alerta } from '@/lib/mock-data';
import { Droplet, AlertTriangle, WifiOff, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface AlertaItemProps {
  alerta: Alerta;
}

export default function AlertaItem({ alerta }: AlertaItemProps) {
  const isFuga = alerta.tipo === 'fuga';
  const isAlto = alerta.tipo === 'consumo_alto';
  const isDesc = alerta.tipo === 'desconectado';

  const formatRelTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `hace ${diffMins} min`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `hace ${diffHrs} h`;
    return `hace ${Math.floor(diffHrs / 24)} d`;
  };

  return (
    <div className={cn(
      "flex gap-4 p-4 border-b border-border transition-colors",
      !alerta.leida ? "bg-primary/5" : "bg-transparent"
    )}>
      <div className="shrink-0 mt-1">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
          isFuga ? "bg-red-500/20 text-red-500 shadow-red-500/10" : 
          isAlto ? "bg-yellow-500/20 text-yellow-500 shadow-yellow-500/10" : 
          "bg-gray-500/20 text-gray-400 shadow-gray-500/10"
        )}>
          {isFuga && <AlertTriangle className="w-5 h-5" />}
          {isAlto && <Droplet className="w-5 h-5" />}
          {isDesc && <WifiOff className="w-5 h-5" />}
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h4 className={cn(
            "font-semibold text-sm",
            !alerta.leida ? "text-white" : "text-gray-300"
          )}>
            {alerta.titulo}
          </h4>
          {!alerta.leida && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted leading-relaxed mb-2">
          {alerta.descripcion}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-muted/80 font-medium">
          <Clock className="w-3 h-3" />
          <span>{formatRelTime(alerta.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
