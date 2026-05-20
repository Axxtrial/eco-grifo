"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/context";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import StatCard from "@/components/StatCard";
import { Activity, CalendarDays, Droplet } from "lucide-react";

export default function Historial() {
  const { historial, grifos } = useAppContext();
  const [selectedGrifoId, setSelectedGrifoId] = useState<string>("all");

  const filteredHistorial = selectedGrifoId === "all" 
    ? historial 
    : historial.filter(h => h.grifoId === selectedGrifoId);

  // Preparar datos de gráfica
  const dataMap = filteredHistorial.reduce((acc: Record<string, { name: string; litros: number }>, curr) => {
    const fechaCortada = curr.fecha.split("-").slice(1).join("/");
    if (!acc[fechaCortada]) acc[fechaCortada] = { name: fechaCortada, litros: 0 };
    acc[fechaCortada].litros += curr.litros;
    return acc;
  }, {});

  const chartData = Object.values(dataMap).reverse();
  const totalLitros = filteredHistorial.reduce((sum, h) => sum + h.litros, 0);
  const promedioDiario = chartData.length ? totalLitros / chartData.length : 0;

  // Umbral: consumo alto si supera 60 L/día
  const UMBRAL_ALTO = 60;
  const getBarColor = (litros: number) => litros > UMBRAL_ALTO ? "#EF4444" : "#22C55E";

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Historial</h1>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-2 -mx-6 px-6">
        <button 
          onClick={() => setSelectedGrifoId("all")}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${selectedGrifoId === "all" ? 'bg-primary text-white' : 'bg-card text-muted hover:bg-card/80 border border-border'}`}
        >
          Todos
        </button>
        {grifos.map(g => (
          <button 
            key={g.id}
            onClick={() => setSelectedGrifoId(g.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${selectedGrifoId === g.id ? 'bg-primary text-white' : 'bg-card text-muted hover:bg-card/80 border border-border'}`}
          >
            {g.nombre}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard 
          title="Consumo Total" 
          value={totalLitros.toFixed(0)} 
          subtitle="Litros" 
          icon={Droplet}
          className="col-span-1"
        />
        <StatCard 
          title="Promedio / Día" 
          value={promedioDiario.toFixed(1)} 
          subtitle="Litros" 
          icon={Activity}
          className="col-span-1"
        />
      </div>

      <div className="mb-8">
        <h3 className="text-white font-semibold mb-4">Últimos 30 días</h3>
        <div className="h-64 bg-card border border-border rounded-3xl p-4 flex flex-col justify-center items-center">
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Droplet className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Sin estadísticas</h4>
              <p className="text-xs text-muted max-w-[240px] leading-relaxed">
                No hay consumos registrados en este período. Registra flujos en tu simulador para visualizar las gráficas.
              </p>
            </div>
          ) : (
            <>
              {/* Leyenda */}
              <div className="flex gap-4 mb-3 w-full justify-end pr-4">
                <span className="flex items-center gap-1.5 text-[10px] text-muted font-medium">
                  <span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" />Normal
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted font-medium">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />Consumo alto
                </span>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={chartData} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E1E2E" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A1A1AA', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#A1A1AA', fontSize: 10}} dx={-10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#12121A', borderColor: '#1E1E2E', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`${value} L`, 'Consumo']}
                  />
                  <Bar dataKey="litros" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={getBarColor(entry.litros)} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-4">Registros recientes</h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {filteredHistorial.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">
              No hay lecturas registradas.
            </div>
          ) : (
            filteredHistorial.slice(0, 10).map((registro, idx) => {
              const grifoNombre = grifos.find(g => g.id === registro.grifoId)?.nombre || 'Desconocido';
              return (
                <div key={idx} className="flex justify-between items-center p-4 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{registro.fecha}</p>
                      <p className="text-xs text-muted">{grifoNombre} • {registro.duracionMinutos} min</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{registro.litros} L</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </main>
  );
}
