"use client";

import React, { useState } from 'react';
import { X, Droplet, Wifi, WifiOff, AlertTriangle, Trash2 } from 'lucide-react';
import { Grifo } from '@/lib/mock-data';
import { useAppContext } from '@/lib/context';

interface GrifoConfigProps {
  grifo: Grifo;
  onClose: () => void;
}

export default function GrifoConfig({ grifo, onClose }: GrifoConfigProps) {
  const { actualizarGrifo, eliminarGrifo } = useAppContext();
  const [nombre, setNombre] = useState(grifo.nombre);
  const [ubicacion, setUbicacion] = useState(grifo.ubicacion);
  const [alertasActivadas, setAlertasActivadas] = useState(true); // simulado
  const [isDeleting, setIsDeleting] = useState(false);

  const isOnline = grifo.status === 'online';
  const isAlert = grifo.status === 'alerta';
  const isOffline = grifo.status === 'offline';

  const handleSave = () => {
    actualizarGrifo(grifo.id, { nombre, ubicacion });
    onClose();
  };

  const handleDelete = () => {
    if (isDeleting) {
      eliminarGrifo(grifo.id);
      onClose();
    } else {
      setIsDeleting(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-sm rounded-t-3xl sm:rounded-3xl border border-border overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border/50 p-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-white">Configuración</h3>
          <button onClick={onClose} className="p-1.5 rounded-full bg-border/50 text-muted hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-4 rounded-full ${
              isOnline ? "bg-primary/10 text-primary" : 
              isAlert ? "bg-yellow-500/10 text-yellow-500" : "bg-gray-500/10 text-gray-500"
            }`}>
              <Droplet className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                {isOnline && <><Wifi className="w-4 h-4 text-green-500" /><span className="text-xs uppercase font-bold text-green-500">Online</span></>}
                {isAlert && <><AlertTriangle className="w-4 h-4 text-yellow-500" /><span className="text-xs uppercase font-bold text-yellow-500">Alerta</span></>}
                {isOffline && <><WifiOff className="w-4 h-4 text-gray-500" /><span className="text-xs uppercase font-bold text-gray-500">Offline</span></>}
              </div>
              <p className="text-xs text-muted font-mono">{grifo.ip}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="text-xs font-semibold text-muted ml-1 mb-1 block">Nombre</label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted ml-1 mb-1 block">Ubicación</label>
              <input 
                type="text" 
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-white">Alertas de consumo</p>
                <p className="text-xs text-muted">Recibir notificaciones de este grifo</p>
              </div>
              <button 
                onClick={() => setAlertasActivadas(!alertasActivadas)}
                className={`w-12 h-6 rounded-full transition-colors relative ${alertasActivadas ? 'bg-primary' : 'bg-border'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${alertasActivadas ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted flex justify-between">
                <span>Versión Firmware:</span>
                <span className="font-mono text-white">v1.2.4</span>
              </p>
              <p className="text-xs text-muted flex justify-between mt-2">
                <span>Última conexión:</span>
                <span className="text-white">
                  {new Date(grifo.ultimaActividad).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleSave}
              className="w-full py-3.5 rounded-xl font-bold bg-gradient-btn"
            >
              Guardar Cambios
            </button>
            <button 
              onClick={handleDelete}
              className={`w-full py-3.5 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 ${
                isDeleting ? "bg-red-500 hover:bg-red-600 text-white" : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "¿Estás seguro? Presiona para confirmar" : "Eliminar Grifo"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
