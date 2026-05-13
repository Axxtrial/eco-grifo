export interface Grifo {
  id: string;
  nombre: string;
  ubicacion: string;
  ip: string;
  status: "online" | "offline" | "alerta";
  consumoHoy: number; // litros
  consumoTiempoReal: number; // L/min
  ultimaActividad: string; // ISO date string
}

export interface HistorialConsumo {
  fecha: string;
  grifoId: string;
  litros: number;
  duracionMinutos: number;
}

export interface Alerta {
  id: string;
  tipo: "fuga" | "consumo_alto" | "desconectado";
  titulo: string;
  descripcion: string;
  timestamp: string; // ISO date string
  leida: boolean;
  grifoId: string;
}

export interface Usuario {
  nombre: string;
  correo: string;
  metaDiariaLitros: number;
}

export const mockUsuario: Usuario = {
  nombre: "Usuario Demo",
  correo: "demo@tugrifo.app",
  metaDiariaLitros: 150,
};

export const mockGrifos: Grifo[] = [
  {
    id: "g1",
    nombre: "Grifo Cocina",
    ubicacion: "Cocina",
    ip: "192.168.1.101",
    status: "online",
    consumoHoy: 45.5,
    consumoTiempoReal: 0,
    ultimaActividad: new Date().toISOString(),
  },
  {
    id: "g2",
    nombre: "Grifo Baño",
    ubicacion: "Baño principal",
    ip: "192.168.1.102",
    status: "alerta",
    consumoHoy: 85.2,
    consumoTiempoReal: 2.1,
    ultimaActividad: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "g3",
    nombre: "Grifo Jardín",
    ubicacion: "Jardín",
    ip: "192.168.1.103",
    status: "offline",
    consumoHoy: 0,
    consumoTiempoReal: 0,
    ultimaActividad: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

// Generar historial de 7 días (mock dinámico para tener fechas recientes)
const generarHistorial = (): HistorialConsumo[] => {
  const historial: HistorialConsumo[] = [];
  const hoy = new Date();
  
  mockGrifos.forEach((grifo) => {
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      
      historial.push({
        fecha: fecha.toISOString().split("T")[0],
        grifoId: grifo.id,
        litros: Math.floor(Math.random() * 50) + 10, // 10 a 60 litros
        duracionMinutos: Math.floor(Math.random() * 15) + 2, // 2 a 17 min
      });
    }
  });
  
  return historial.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

export const mockHistorial: HistorialConsumo[] = generarHistorial();

export const mockAlertas: Alerta[] = [
  {
    id: "a1",
    tipo: "fuga",
    titulo: "Posible fuga detectada",
    descripcion: "Se ha detectado flujo constante inusual en Grifo Baño durante más de 30 minutos.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    leida: false,
    grifoId: "g2",
  },
  {
    id: "a2",
    tipo: "consumo_alto",
    titulo: "Consumo elevado",
    descripcion: "El consumo del Grifo Cocina ha superado el promedio diario en un 40%.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    leida: false,
    grifoId: "g1",
  },
  {
    id: "a3",
    tipo: "desconectado",
    titulo: "Grifo fuera de línea",
    descripcion: "El Grifo Jardín ha perdido conexión con la red Wi-Fi.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    leida: true,
    grifoId: "g3",
  },
];
