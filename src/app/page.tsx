"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/lib/context";
import { UserCircle } from "lucide-react";
import GrifoCard from "@/components/GrifoCard";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Home() {
  const { usuario, grifos, historial } = useAppContext();
  const [totalConsumoHoy, setTotalConsumoHoy] = useState(0);
  const [tiempoReal, setTiempoReal] = useState(0);

  useEffect(() => {
    const totalHoy = grifos.reduce((acc, g) => acc + g.consumoHoy, 0);
    const tr = grifos.reduce((acc, g) => acc + g.consumoTiempoReal, 0);
    setTotalConsumoHoy(totalHoy);
    setTiempoReal(tr);
  }, [grifos]);

  // Preparar datos para la gráfica
  // Agrupar historial por fecha
  const dataMap = historial.reduce((acc: any, curr) => {
    const fechaCortada = curr.fecha.split("-").slice(1).join("/");
    if (!acc[fechaCortada]) {
      acc[fechaCortada] = { name: fechaCortada, litros: 0 };
    }
    acc[fechaCortada].litros += curr.litros;
    return acc;
  }, {});

  const chartData = Object.values(dataMap).reverse().map((d: any) => ({
    ...d,
    promedio: d.litros * 0.8 // Línea de promedio simulada
  }));

  const porcentajeMeta = Math.min((totalConsumoHoy / usuario.metaDiariaLitros) * 100, 100);

  return (
    <main className="p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-sm text-muted">Buenos días,</h1>
          <h2 className="text-xl font-bold text-white">{usuario.nombre}</h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-btn flex items-center justify-center">
          <UserCircle className="w-6 h-6 text-white" />
        </div>
      </header>

      {/* Main cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="col-span-2 bg-gradient-to-br from-card to-card/50 border border-border p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10" />
          <p className="text-sm text-muted mb-2 relative z-10">Consumo Total Hoy</p>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-bold text-white tabular-nums tracking-tighter">
              {totalConsumoHoy.toFixed(1)}
            </span>
            <span className="text-xl font-medium text-muted">L</span>
          </div>
        </div>

        <div className="col-span-2 bg-card border border-border p-4 rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-xs text-muted mb-1">Caudal en tiempo real</p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {tiempoReal > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${tiempoReal > 0 ? 'bg-primary' : 'bg-gray-600'}`}></span>
              </span>
              <span className="text-2xl font-bold text-white tabular-nums tracking-tighter">
                {tiempoReal.toFixed(1)} <span className="text-sm text-muted font-normal">L/min</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Meta diaria */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-medium mb-2">
          <span className="text-white">Meta diaria ({usuario.metaDiariaLitros} L)</span>
          <span className={porcentajeMeta >= 100 ? "text-red-400" : "text-primary"}>
            {porcentajeMeta.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 w-full bg-border rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${porcentajeMeta >= 100 ? 'bg-red-500' : 'bg-gradient-to-r from-primary to-secondary'}`}
            style={{ width: `${porcentajeMeta}%` }}
          />
        </div>
      </div>

      {/* Accesos rápidos a Grifos */}
      <div className="mb-8">
        <h3 className="text-white font-semibold mb-4">Mis Grifos</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar -mx-6 px-6">
          {grifos.map(grifo => (
            <div key={grifo.id} className="min-w-[200px] snap-center shrink-0">
              <GrifoCard grifo={grifo} />
            </div>
          ))}
        </div>
      </div>

      {/* Gráfica de últimos 7 días */}
      <div className="mb-4">
        <h3 className="text-white font-semibold mb-4">Últimos 7 días</h3>
        <div className="h-64 bg-card border border-border rounded-3xl p-4 pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E1E2E" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A1A1AA', fontSize: 10}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#A1A1AA', fontSize: 10}} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#12121A', borderColor: '#1E1E2E', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="litros" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Line type="monotone" dataKey="promedio" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </main>
  );
}
