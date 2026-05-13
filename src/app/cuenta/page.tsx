"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/context";
import { Plus, Edit2, Droplet, Check } from "lucide-react";
import GrifoCard from "@/components/GrifoCard";
import AddGrifoFlow from "@/components/AddGrifoFlow";
import GrifoConfig from "@/components/GrifoConfig";
import StatCard from "@/components/StatCard";
import { Grifo } from "@/lib/mock-data";

export default function Cuenta() {
  const { grifos, usuario, setUsuario } = useAppContext();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGrifo, setSelectedGrifo] = useState<Grifo | null>(null);
  
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [tempMeta, setTempMeta] = useState(usuario.metaDiariaLitros.toString());

  const totalConsumoMes = grifos.reduce((acc, g) => acc + g.consumoHoy * 30, 0); // simulado
  const grifoMasUsado = [...grifos].sort((a, b) => b.consumoHoy - a.consumoHoy)[0];

  const handleSaveMeta = () => {
    const val = parseInt(tempMeta, 10);
    if (!isNaN(val) && val > 0) {
      setUsuario(prev => ({ ...prev, metaDiariaLitros: val }));
    }
    setIsEditingMeta(false);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Mis Grifos</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard 
          title="Total Grifos" 
          value={grifos.length} 
          icon={Droplet}
          className="col-span-1"
        />
        <StatCard 
          title="Consumo Mes" 
          value={totalConsumoMes.toFixed(0)} 
          subtitle="Litros (est.)" 
          icon={Droplet}
          className="col-span-1"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 mb-8 flex justify-between items-center">
        <div>
          <p className="text-xs text-muted mb-1">Meta Diaria Global</p>
          {isEditingMeta ? (
            <div className="flex items-center gap-2">
              <input 
                type="number"
                value={tempMeta}
                onChange={(e) => setTempMeta(e.target.value)}
                className="w-20 bg-background border border-border rounded px-2 py-1 text-white focus:outline-none focus:border-primary"
                autoFocus
              />
              <span className="text-muted text-sm font-medium">L</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">{usuario.metaDiariaLitros}</span>
              <span className="text-sm text-muted font-medium">L</span>
            </div>
          )}
        </div>
        <div>
          {isEditingMeta ? (
            <button 
              onClick={handleSaveMeta}
              className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => {
                setTempMeta(usuario.metaDiariaLitros.toString());
                setIsEditingMeta(true);
              }}
              className="p-2 rounded-full bg-border/50 text-muted hover:text-white transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-white font-semibold">Lista de Grifos</h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:scale-110 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {grifos.map(grifo => (
          <div key={grifo.id} className="relative">
            <GrifoCard grifo={grifo} />
            <button 
              onClick={() => setSelectedGrifo(grifo)}
              className="absolute top-4 right-4 p-2 bg-background/50 rounded-full text-muted hover:text-white backdrop-blur-sm border border-border/50"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {grifos.length === 0 && (
          <div className="text-center p-8 border border-dashed border-border rounded-2xl">
            <p className="text-muted text-sm mb-4">No tienes grifos configurados</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 rounded-full bg-primary text-white text-sm font-semibold"
            >
              Agregar el primero
            </button>
          </div>
        )}
      </div>

      {showAddModal && <AddGrifoFlow onClose={() => setShowAddModal(false)} />}
      {selectedGrifo && <GrifoConfig grifo={selectedGrifo} onClose={() => setSelectedGrifo(null)} />}
    </main>
  );
}
