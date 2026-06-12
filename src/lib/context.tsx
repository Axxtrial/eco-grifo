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
import { supabase } from "./supabase";
import { Session } from "@supabase/supabase-js";

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
  agregarAlerta: (alerta: Omit<Alerta, "id">) => void;
  marcarAlertaLeida: (id: string) => void;
  eliminarCuenta: () => Promise<void>;
  
  // Soporte de Supabase
  sesion: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
  isSupabaseConfigured: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario>(mockUsuario);
  const [grifos, setGrifos] = useState<Grifo[]>(mockGrifos);
  const [alertas, setAlertas] = useState<Alerta[]>(mockAlertas);
  const [historial, setHistorial] = useState<HistorialConsumo[]>(mockHistorial);
  
  const [sesion, setSesion] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isSupabaseConfigured = !!supabase;

  // 1. Escuchar el estado de autenticación en Supabase
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Obtener la sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      if (session) {
        cargarDatosSupabase(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Suscribirse a cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
      if (session) {
        cargarDatosSupabase(session.user.id);
      } else {
        // Resetear al estado Mock si cierra sesión
        setUsuario(mockUsuario);
        setGrifos(mockGrifos);
        setAlertas(mockAlertas);
        setHistorial(mockHistorial);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Cargar datos desde Supabase
  const cargarDatosSupabase = async (userId: string) => {
    if (!supabase) return;
    setLoading(true);
    try {
      // Perfil
      const { data: dbPerfil, error: pError } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      let perfil = dbPerfil;
      
      if (pError || !perfil) {
        const { data: { user } } = await supabase.auth.getUser();
        const defaultProfile = {
          id: userId,
          nombre: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.nombre || user?.user_metadata?.user_name || "Usuario EcoGrifo",
          correo: user?.email || "usuario@ecogrifo.app",
          meta_diaria_litros: 150
        };
        await supabase.from("perfiles").insert(defaultProfile);
        perfil = defaultProfile;
      }

      setUsuario({
        nombre: perfil.nombre,
        correo: perfil.correo,
        metaDiariaLitros: perfil.meta_diaria_litros
      });

      // Grifos
      const { data: dbGrifos } = await supabase
        .from("grifos")
        .select("*")
        .order("created_at", { ascending: true });

      if (dbGrifos && dbGrifos.length > 0) {
        setGrifos(dbGrifos.map(g => ({
          id: g.id,
          nombre: g.nombre,
          ubicacion: g.ubicacion,
          ip: g.ip || "",
          status: g.status as "online" | "offline" | "alerta",
          consumoHoy: parseFloat(g.consumo_hoy || "0"),
          consumoTiempoReal: parseFloat(g.consumo_tiempo_real || "0"),
          ultimaActividad: g.ultima_actividad
        })));
      } else {
        // Si el usuario es nuevo y no tiene grifos, insertar algunos por defecto opcionalmente
        // o dejar la lista vacía para que use el AddGrifoFlow.
        setGrifos([]);
      }

      // Historial
      const { data: dbHistorial } = await supabase
        .from("historial_consumo")
        .select("*")
        .order("fecha", { ascending: false });

      if (dbHistorial) {
        setHistorial(dbHistorial.map(h => ({
          fecha: h.fecha,
          grifoId: h.grifo_id,
          litros: parseFloat(h.litros || "0"),
          duracionMinutos: h.duracion_minutos
        })));
      } else {
        setHistorial([]);
      }

      // Alertas
      const { data: dbAlertas } = await supabase
        .from("alertas")
        .select("*")
        .order("timestamp", { ascending: false });

      if (dbAlertas) {
        setAlertas(dbAlertas.map(a => ({
          id: a.id,
          tipo: a.tipo as "fuga" | "consumo_alto" | "desconectado",
          titulo: a.titulo,
          descripcion: a.descripcion,
          timestamp: a.timestamp,
          leida: a.leida,
          grifoId: a.grifo_id
        })));
      } else {
        setAlertas([]);
      }
    } catch (err) {
      console.error("Error cargando datos de Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Suscribirse a cambios en tiempo real en Supabase (grifos y alertas)
  useEffect(() => {
    if (!supabase || !sesion) return;

    const channel = supabase
      .channel(`realtime-data-${sesion.user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "grifos", filter: `usuario_id=eq.${sesion.user.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newG = payload.new;
            setGrifos(prev => {
              if (prev.some(x => x.id === newG.id)) return prev;
              return [...prev, {
                id: newG.id,
                nombre: newG.nombre,
                ubicacion: newG.ubicacion,
                ip: newG.ip || "",
                status: newG.status as "online" | "offline" | "alerta",
                consumoHoy: parseFloat(newG.consumo_hoy || "0"),
                consumoTiempoReal: parseFloat(newG.consumo_tiempo_real || "0"),
                ultimaActividad: newG.ultima_actividad
              }];
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedG = payload.new;
            setGrifos(prev => prev.map(x => x.id === updatedG.id ? {
              ...x,
              nombre: updatedG.nombre,
              ubicacion: updatedG.ubicacion,
              ip: updatedG.ip || "",
              status: updatedG.status as "online" | "offline" | "alerta",
              consumoHoy: parseFloat(updatedG.consumo_hoy || "0"),
              consumoTiempoReal: parseFloat(updatedG.consumo_tiempo_real || "0"),
              ultimaActividad: updatedG.ultima_actividad
            } : x));
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            setGrifos(prev => prev.filter(x => x.id !== deletedId));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alertas", filter: `usuario_id=eq.${sesion.user.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newA = payload.new;
            setAlertas(prev => {
              if (prev.some(x => x.id === newA.id)) return prev;
              return [{
                id: newA.id,
                tipo: newA.tipo as "fuga" | "consumo_alto" | "desconectado",
                titulo: newA.titulo,
                descripcion: newA.descripcion,
                timestamp: newA.timestamp,
                leida: newA.leida,
                grifoId: newA.grifo_id
              }, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedA = payload.new;
            setAlertas(prev => prev.map(x => x.id === updatedA.id ? {
              ...x,
              leida: updatedA.leida
            } : x));
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            setAlertas(prev => prev.filter(x => x.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [sesion]);

  // 4. Sincronizar el perfil (meta diaria) a Supabase de manera reactiva al cambiar el state
  useEffect(() => {
    if (!supabase || !sesion || !usuario) return;

    const sincronizarPerfil = async () => {
      await supabase
        ?.from("perfiles")
        .update({
          nombre: usuario.nombre,
          meta_diaria_litros: usuario.metaDiariaLitros
        })
        .eq("id", sesion.user.id);
    };

    sincronizarPerfil();
  }, [usuario, sesion]);

  // 5. Simular consumo en tiempo real (solo activo en modo simulado para evitar escrituras masivas innecesarias)
  useEffect(() => {
    if (supabase && sesion) return; // Si hay conexión real activa, desactivar la oscilación aleatoria global

    const interval = setInterval(() => {
      setGrifos((prevGrifos) => 
        prevGrifos.map((grifo) => {
          if (grifo.status === "online" || grifo.status === "alerta") {
            const fluyendo = Math.random() > 0.7;
            const consumoActual = fluyendo ? parseFloat((Math.random() * 5).toFixed(1)) : 0;
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
  }, [sesion]);

  const alertasNoLeidas = alertas.filter(a => !a.leida).length;

  // 6. Métodos mutadores adaptados a Supabase / Mocks
  const marcarAlertasLeidas = async () => {
    if (supabase && sesion) {
      const { error } = await supabase
        .from("alertas")
        .update({ leida: true })
        .eq("usuario_id", sesion.user.id)
        .eq("leida", false);
      
      if (error) {
        console.error("Error marcando alertas leídas en Supabase:", error);
      } else {
        setAlertas(prev => prev.map(a => ({ ...a, leida: true })));
      }
    } else {
      setAlertas(prev => prev.map(a => ({ ...a, leida: true })));
    }
  };

  const marcarAlertaLeida = async (id: string) => {
    if (supabase && sesion) {
      const { error } = await supabase
        .from("alertas")
        .update({ leida: true })
        .eq("id", id);
      
      if (error) {
        console.error("Error marcando alerta como leída en Supabase:", error);
      } else {
        setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a));
      }
    } else {
      setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a));
    }
  };

  const eliminarCuenta = async () => {
    if (supabase && sesion) {
      setLoading(true);
      try {
        const userId = sesion.user.id;
        
        // Eliminar alertas asociadas
        await supabase.from("alertas").delete().eq("usuario_id", userId);
        
        // Obtener IDs de grifos del usuario para limpiar su historial
        const { data: userGrifos } = await supabase.from("grifos").select("id").eq("usuario_id", userId);
        if (userGrifos && userGrifos.length > 0) {
          const grifoIds = userGrifos.map(g => g.id);
          await supabase.from("historial_consumo").delete().in("grifo_id", grifoIds);
        }
        
        // Eliminar grifos del usuario
        await supabase.from("grifos").delete().eq("usuario_id", userId);
        
        // Eliminar el perfil del usuario
        await supabase.from("perfiles").delete().eq("id", userId);
        
        // Cerrar sesión
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Error al eliminar la cuenta de Supabase:", err);
      } finally {
        setLoading(false);
      }
    } else {
      // Modo Mock offline - reiniciar todo a limpio
      setUsuario({
        nombre: "Usuario EcoGrifo",
        correo: "usuario@ecogrifo.app",
        metaDiariaLitros: 150
      });
      setGrifos([]);
      setAlertas([]);
      setHistorial([]);
    }
  };

  const agregarGrifo = async (grifo: Grifo) => {
    if (supabase && sesion) {
      const { data, error } = await supabase.from("grifos").insert({
        nombre: grifo.nombre,
        ubicacion: grifo.ubicacion,
        ip: grifo.ip,
        status: grifo.status,
        consumo_hoy: grifo.consumoHoy,
        consumo_tiempo_real: grifo.consumoTiempoReal,
        ultima_actividad: grifo.ultimaActividad,
        usuario_id: sesion.user.id
      }).select().single();

      if (error) {
        console.error("Error guardando grifo en Supabase:", error);
      } else if (data) {
        setGrifos(prev => {
          if (prev.some(x => x.id === data.id)) return prev;
          return [...prev, {
            id: data.id,
            nombre: data.nombre,
            ubicacion: data.ubicacion,
            ip: data.ip || "",
            status: data.status as "online" | "offline" | "alerta",
            consumoHoy: parseFloat(data.consumo_hoy || "0"),
            consumoTiempoReal: parseFloat(data.consumo_tiempo_real || "0"),
            ultimaActividad: data.ultima_actividad
          }];
        });
      }
    } else {
      setGrifos(prev => [...prev, grifo]);
    }
  };

  const agregarAlerta = async (alerta: Omit<Alerta, "id">) => {
    if (supabase && sesion) {
      const { error } = await supabase.from("alertas").insert({
        tipo: alerta.tipo,
        titulo: alerta.titulo,
        descripcion: alerta.descripcion,
        timestamp: alerta.timestamp,
        leida: alerta.leida,
        grifo_id: alerta.grifoId,
        usuario_id: sesion.user.id
      });
      if (error) console.error("Error guardando alerta en Supabase:", error);
    } else {
      const nuevaAlerta: Alerta = {
        ...alerta,
        id: "alrt_" + Math.random().toString(36).substring(2, 9),
      };
      setAlertas(prev => [nuevaAlerta, ...prev]);
    }
  };

  const eliminarGrifo = async (id: string) => {
    if (supabase && sesion) {
      try {
        // 1. Eliminar alertas vinculadas a este grifo en base de datos
        await supabase.from("alertas").delete().eq("grifo_id", id);
        
        // 2. Eliminar historial de consumo vinculado a este grifo en base de datos
        await supabase.from("historial_consumo").delete().eq("grifo_id", id);
        
        // 3. Eliminar el grifo en base de datos
        const { error } = await supabase.from("grifos").delete().eq("id", id);
        if (error) {
          console.error("Error al eliminar grifo de Supabase:", error);
        } else {
          setGrifos(prev => prev.filter(g => g.id !== id));
          setAlertas(prev => prev.filter(a => a.grifoId !== id));
          setHistorial(prev => prev.filter(h => h.grifoId !== id));
        }
      } catch (err) {
        console.error("Error durante eliminación de grifo:", err);
      }
    } else {
      setGrifos(prev => prev.filter(g => g.id !== id));
      setAlertas(prev => prev.filter(a => a.grifoId !== id));
      setHistorial(prev => prev.filter(h => h.grifoId !== id));
    }
  };

  const actualizarGrifo = async (id: string, data: Partial<Grifo>) => {
    if (supabase && sesion) {
      const dbData: Partial<{
        nombre: string;
        ubicacion: string;
        status: "online" | "offline" | "alerta";
        consumo_hoy: number;
        consumo_tiempo_real: number;
        ultima_actividad: string;
      }> = {};
      if (data.nombre !== undefined) dbData.nombre = data.nombre;
      if (data.ubicacion !== undefined) dbData.ubicacion = data.ubicacion;
      if (data.status !== undefined) dbData.status = data.status;
      if (data.consumoHoy !== undefined) dbData.consumo_hoy = data.consumoHoy;
      if (data.consumoTiempoReal !== undefined) dbData.consumo_tiempo_real = data.consumoTiempoReal;
      if (data.ultimaActividad !== undefined) dbData.ultima_actividad = data.ultimaActividad;

      const { error } = await supabase.from("grifos").update(dbData).eq("id", id);
      if (error) console.error("Error actualizando grifo en Supabase:", error);
    } else {
      setGrifos(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
    }
  };

  const logout = async () => {
    if (supabase) {
      setLoading(true);
      await supabase.auth.signOut();
    }
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
      marcarAlertaLeida,
      agregarGrifo,
      eliminarGrifo,
      actualizarGrifo,
      agregarAlerta,
      eliminarCuenta,
      
      sesion,
      loading,
      logout,
      isSupabaseConfigured
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
