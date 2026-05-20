-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA PERFILES DE USUARIO (Enlazada a auth.users)
CREATE TABLE public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL,
    meta_diaria_litros INTEGER NOT NULL DEFAULT 150,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en perfiles
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio perfil" 
    ON public.perfiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
    ON public.perfiles FOR UPDATE 
    USING (auth.uid() = id);

-- Trigger para crear perfil automáticamente al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfiles (id, nombre, correo, meta_diaria_litros)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'nombre', 'Nuevo Usuario'),
        new.email,
        150
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. TABLA GRIFOS
CREATE TABLE public.grifos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    ubicacion TEXT NOT NULL,
    ip TEXT,
    status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'alerta')),
    consumo_hoy NUMERIC(10, 2) NOT NULL DEFAULT 0,
    consumo_tiempo_real NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en grifos
ALTER TABLE public.grifos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden gestionar sus propios grifos" 
    ON public.grifos FOR ALL 
    USING (auth.uid() = usuario_id);

-- 3. TABLA HISTORIAL DE CONSUMO
CREATE TABLE public.historial_consumo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    grifo_id UUID NOT NULL REFERENCES public.grifos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    litros NUMERIC(10, 2) NOT NULL,
    duracion_minutos INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en historial
ALTER TABLE public.historial_consumo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden gestionar su historial" 
    ON public.historial_consumo FOR ALL 
    USING (auth.uid() = usuario_id);

-- 4. TABLA ALERTAS
CREATE TABLE public.alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    grifo_id UUID NOT NULL REFERENCES public.grifos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('fuga', 'consumo_alto', 'desconectado')),
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en alertas
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden gestionar sus alertas" 
    ON public.alertas FOR ALL 
    USING (auth.uid() = usuario_id);

-- HABILITAR REALTIME
alter publication supabase_realtime add table public.grifos;
alter publication supabase_realtime add table public.alertas;