"use client";

import { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/lib/context";
import { Sparkles, Send, ShieldAlert, BookOpen, BarChart3, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelUsed?: string;
  timestamp: Date;
}

export default function EcoCoachPage() {
  const { usuario, grifos, historial, alertas } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mensaje de bienvenida inicial
  useEffect(() => {
    const saludoInicial = `¡Hola ${usuario.nombre}! 💧 Soy tu **Eco-Coach** personal de EcoGrifo. 

He analizado tu red inteligente doméstica:
- Tienes **${grifos.length} grifos** vinculados.
- Tu consumo total de agua de hoy es de **${grifos.reduce((acc, g) => acc + g.consumoHoy, 0).toFixed(1)} L**.
- Tu meta establecida es de **${usuario.metaDiariaLitros} L** diarios.

¿En qué te gustaría enfocar nuestro análisis hoy? Puedes preguntarme libremente o usar las consultas rápidas de abajo.`;

    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: saludoInicial,
        modelUsed: "EcoGrifo Engine",
        timestamp: new Date()
      }
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario.nombre, grifos.length, usuario.metaDiariaLitros]);

  // Hacer scroll automático al recibir nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Enviar mensaje a la ruta de API
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage: Message = {
      id: userMessageId,
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Crear el historial de mensajes formateado para la API
      const historialMensajes = [...messages, newUserMessage].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/eco-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          usuario,
          grifos,
          historial,
          alertas,
          historialMensajes
        })
      });

      if (!res.ok) {
        throw new Error("Error en la respuesta del servidor.");
      }

      const data = await res.json();
      
      if (data.isDemo) {
        setIsDemoMode(true);
      }

      const botMessageId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          role: "assistant",
          content: data.text,
          modelUsed: data.modelUsed,
          timestamp: new Date()
        }
      ]);

    } catch (error) {
      console.error("Error al obtener respuesta de la IA:", error);
      
      // Fallback amigable local en caso de caída total de red
      const errorMsgId = `err-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: errorMsgId,
          role: "assistant",
          content: "❌ Lo siento, he tenido un problema de conexión temporal con mis servidores neuronales. Por favor, asegúrate de que tu red esté activa e inténtalo de nuevo.",
          modelUsed: "Error Fallback",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // Chips de consultas predefinidas
  const quickChips = [
    { label: "🔍 Detectar Fugas", query: "Inspecciona mis grifos y alertas para buscar fugas de agua silenciosas.", icon: ShieldAlert, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { label: "💡 Consejos de Ahorro", query: "Dame consejos prácticos y personalizados para ahorrar agua en mis grifos actuales.", icon: BookOpen, color: "text-green-400 bg-green-500/10 border-green-500/20" },
    { label: "📈 Progreso Semanal", query: "Analiza mi historial de consumo de los últimos 7 días y dime si he mejorado.", icon: BarChart3, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" }
  ];

  // Función para procesar negritas, cursivas, listas y citas markdown en el chat
  const formatMessageText = (text: string) => {
    const lines = text.split("\n");
    let inList = false;
    let listType: "ul" | "ol" | null = null;
    const elements: React.ReactNode[] = [];

    const processInline = (str: string) => {
      return str
        .replace(/\*\*(.*?)\*\*/g, (_, p1) => `<strong>${p1}</strong>`)
        .replace(/\*(.*?)\*/g, (_, p1) => `<em>${p1}</em>`);
    };

    let currentListItems: string[] = [];

    const renderList = (items: string[], type: "ul" | "ol", keyPrefix: number) => {
      if (type === "ul") {
        return (
          <ul key={`ul-${keyPrefix}`} className="list-none pl-1 my-2 space-y-1.5 animate-in fade-in duration-300">
            {items.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed flex items-start gap-2">
                <span className="text-primary mt-1 text-[10px] shrink-0">💧</span>
                <span dangerouslySetInnerHTML={{ __html: processInline(item) }} />
              </li>
            ))}
          </ul>
        );
      } else {
        return (
          <ol key={`ol-${keyPrefix}`} className="list-decimal pl-5 my-2 space-y-1.5 animate-in fade-in duration-300">
            {items.map((item, idx) => (
              <li 
                key={idx} 
                className="text-sm leading-relaxed text-slate-100 pl-1"
                dangerouslySetInnerHTML={{ __html: processInline(item) }}
              />
            ))}
          </ol>
        );
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Detectar viñetas de lista no ordenada
      const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
      // Detectar viñetas de lista ordenada
      const isNumbered = /^\d+\.\s/.test(trimmed);
      // Detectar bloque de cita
      const isQuote = trimmed.startsWith("> ");

      if (isBullet || isNumbered) {
        const itemType = isBullet ? "ul" : "ol";
        const content = trimmed.substring(trimmed.indexOf(" ") + 1);

        if (inList && listType !== itemType) {
          // Si cambia el tipo de lista, renderizamos la acumulada
          elements.push(renderList(currentListItems, listType!, i));
          currentListItems = [];
        }

        inList = true;
        listType = itemType;
        currentListItems.push(content);
      } else {
        if (inList) {
          // Terminar la lista activa y renderizarla
          elements.push(renderList(currentListItems, listType!, i));
          currentListItems = [];
          inList = false;
          listType = null;
        }

        if (isQuote) {
          const content = trimmed.substring(2);
          elements.push(
            <blockquote 
              key={i} 
              className="my-3 pl-3.5 border-l-2 border-primary/50 bg-primary/5 py-1.5 pr-2 rounded-r-xl text-xs text-slate-300 leading-relaxed italic animate-in fade-in duration-300"
              dangerouslySetInnerHTML={{ __html: processInline(content) }}
            />
          );
        } else if (trimmed === "") {
          elements.push(<div key={i} className="h-2" />);
        } else {
          elements.push(
            <p 
              key={i} 
              className="mb-1.5 last:mb-0 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: processInline(line) }}
            />
          );
        }
      }
    }

    if (inList) {
      elements.push(renderList(currentListItems, listType!, lines.length));
    }

    return elements;
  };

  return (
    <main className="p-6 flex flex-col min-h-[calc(100vh-4rem)]">
      
      {/* Cabecera */}
      <header className="flex items-center gap-3 mb-4 animate-in fade-in duration-300">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-sm text-muted font-medium">Asistente EcoGrifo</h1>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Eco-Coach IA
            {isDemoMode && (
              <span className="text-[9px] px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-semibold rounded-full uppercase tracking-wider">
                Demo
              </span>
            )}
          </h2>
        </div>
      </header>

      {/* Banner de Modo Demo en caso de que no haya API Key configurada */}
      {isDemoMode && (
        <div className="mb-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-3 flex items-start gap-2.5 animate-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-yellow-400">Modo Demo Activado</p>
            <p className="text-[10px] text-muted leading-relaxed">
              No se detectó la clave de API de Gemini. La app simula respuestas inteligentes personalizadas. Añade <code className="text-yellow-300/80">GEMINI_API_KEY</code> a tu <code className="text-yellow-300/80">.env</code> para habilitar la IA en tiempo real.
            </p>
          </div>
        </div>
      )}



      {/* Contenedor de Chat */}
      <div className="flex-1 min-h-[300px] bg-card/25 border border-border/80 rounded-3xl p-4 overflow-y-auto mb-4 flex flex-col gap-4 max-h-[420px] shadow-inner relative">
        {messages.map((msg) => {
          const isBot = msg.role === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 max-w-[85%] ${isBot ? "self-start" : "self-end items-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {/* Burbuja */}
              <div
                className={`p-3.5 rounded-2xl text-white ${
                  isBot
                    ? "bg-[#161622]/90 border border-border rounded-tl-sm shadow-md"
                    : "bg-gradient-to-tr from-primary to-secondary rounded-tr-sm shadow-lg shadow-primary/10"
                }`}
              >
                {formatMessageText(msg.content)}
              </div>
              
              {/* Metadatos (Modelo usado y hora) */}
              <div className="flex items-center gap-1.5 px-1">
                {isBot && msg.modelUsed && (
                  <span className="text-[9px] text-muted/80 font-mono tracking-tighter">
                    {msg.modelUsed}
                  </span>
                )}
                <span className="text-[8px] text-muted/60">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-center gap-2 bg-[#161622]/50 border border-border/40 p-3 rounded-2xl rounded-tl-sm self-start max-w-[80%] animate-pulse">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chips Rápidos de un Solo Clic */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {quickChips.map((chip, index) => {
          const Icon = chip.icon;
          return (
            <button
              key={index}
              disabled={isLoading}
              onClick={() => handleSendMessage(chip.query)}
              className={`p-2.5 rounded-2xl border ${chip.color} flex flex-col items-center justify-center gap-1 text-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-tight">{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Entrada del Chat */}
      <form onSubmit={handleFormSubmit} className="relative flex items-center mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Pregúntale a tu Eco-Coach..."
          disabled={isLoading}
          className="w-full bg-[#12121A] border border-border focus:border-primary/50 text-white rounded-2xl py-3.5 pl-4 pr-14 text-xs placeholder:text-muted/60 outline-none transition-all focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="absolute right-2 p-2 bg-gradient-btn hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all rounded-xl"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </main>
  );
}
