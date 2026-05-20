import { NextResponse } from "next/server";
import { generateChatResponse, ChatMessage } from "@/lib/gemini";

// Interfaces de tipado estricto para evitar uso de "any"
interface Usuario {
  nombre: string;
  metaDiariaLitros: number;
}

interface Grifo {
  id: string;
  nombre: string;
  ubicacion?: string;
  estado: string;
  consumoTiempoReal: number;
  consumoHoy: number;
}

interface Alerta {
  id: string;
  grifoId: string;
  tipo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
}

interface Historial {
  id: string;
  grifoId: string;
  litros: number;
  fecha: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { usuario, grifos, historial, alertas, historialMensajes } = body;

    // Obtener la clave de API (soporta tanto del servidor como pública en desarrollo)
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    // Si no hay API Key configurada, activar el modo demo inteligente con respuestas simuladas enriquecidas
    if (!apiKey) {
      console.log("[Eco-Coach API] No se encontró GEMINI_API_KEY. Activando modo Demo.");
      const demoResponse = getSmartDemoResponse(usuario, grifos, historial, alertas, historialMensajes);
      return NextResponse.json({
        text: demoResponse,
        modelUsed: "Eco-Coach Simulador Local (Modo Demo 💧)",
        isDemo: true
      });
    }

    // Calcular resúmenes rápidos para alimentar el Prompt del sistema
    const totalConsumoHoy = grifos?.reduce((acc: number, g: Grifo) => acc + (g.consumoHoy || 0), 0) || 0;
    const grifosAbiertos = grifos?.filter((g: Grifo) => g.estado === "abierto") || [];
    const tieneFugaSimulada = alertas?.some((a: Alerta) => a.tipo === "fuga" && !a.leida);

    // Formatear lista de grifos
    const grifosListText = grifos && grifos.length > 0 
      ? grifos.map((g: Grifo) => `- ${g.nombre} (Ubicación: ${g.ubicacion || "No especificada"}), Estado: ${g.estado}, Flujo actual: ${g.consumoTiempoReal || 0}L/min, Consumido hoy: ${g.consumoHoy || 0}L`).join("\n")
      : "Ningún grifo vinculado.";

    // Formatear historial reciente (últimos 7 registros)
    const historialListText = historial && historial.length > 0
      ? historial.slice(0, 7).map((h: Historial) => `- Fecha: ${h.fecha}, Litros: ${h.litros}L`).join("\n")
      : "Sin registros de historial aún.";

    // Formatear alertas recientes
    const alertasListText = alertas && alertas.length > 0
      ? alertas.slice(0, 5).map((a: Alerta) => `- [${a.tipo.toUpperCase()}] ${a.mensaje} (${a.fecha})`).join("\n")
      : "No hay alertas recientes.";

    // Construir el System Instruction enriquecido
    const systemInstruction = `Eres "Eco-Coach", el asistente virtual de inteligencia artificial integrado en la aplicación EcoGrifo. Tu misión es motivar, educar y ayudar al usuario a optimizar su consumo de agua, detectar fugas silenciosas (anomalías) y sugerir consejos prácticos y personalizados en base a los datos reales de sus grifos inteligentes.

DATOS ACTUALES DEL USUARIO Y SU HOGAR:
- Nombre del usuario: ${usuario?.nombre || "Usuario EcoGrifo"}
- Meta de consumo diaria: ${usuario?.metaDiariaLitros || 50} litros
- Consumo total acumulado hoy: ${totalConsumoHoy.toFixed(1)} litros
- Grifos abiertos actualmente: ${grifosAbiertos.length} de ${grifos?.length || 0} grifos.
- ¿Hay alerta de fuga activa?: ${tieneFugaSimulada ? "SÍ (Urgente)" : "NO"}

DETALLE DE LOS GRIFOS REGISTRADOS:
${grifosListText}

HISTORIAL DE CONSUMOS RECIENTES:
${historialListText}

ALERTAS RECIENTES EN EL SISTEMA:
${alertasListText}

DIRECTRICES DE RESPUESTA:
1. Sé empático, motivador y sumamente claro. Usa un lenguaje natural y ecológico.
2. Mantén respuestas concisas, ya que se leen en una pantalla móvil. Evita párrafos muy largos. Usa viñetas.
3. Usa emojis estratégicamente para animar al usuario (💧, 🌱, 🚿, 🌎, ⚠️, 🧼).
4. Si detectas un flujo continuo prolongado o una alerta de fuga activa, dale prioridad absoluta al aviso de reparación y explícale los riesgos (daños estructurales, desperdicio de agua, aumento de factura).
5. Personaliza tus consejos. Por ejemplo, si consume mucho agua en la "Cocina", sugiérele hábitos de lavado de vajilla eficientes. Si consume mucho en el "Baño", sugiérele duchas cortas.
6. Háblale directamente por su nombre (${usuario?.nombre || "Usuario EcoGrifo"}).
`;

    // Ejecutar el chat a través de nuestra librería con fallbacks automáticos
    const aiResult = await generateChatResponse(systemInstruction, historialMensajes, apiKey);

    return NextResponse.json({
      text: aiResult.text,
      modelUsed: aiResult.modelUsed,
      isDemo: false
    });

  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[Eco-Coach API] Error crítico:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar la solicitud de IA.", detail: error.message },
      { status: 500 }
    );
  }
}

/**
 * Generador de respuestas inteligentes simuladas para el modo Demo (sin API Key)
 */
function getSmartDemoResponse(
  usuario: Usuario,
  grifos: Grifo[],
  historial: Historial[],
  alertas: Alerta[],
  historialMensajes: ChatMessage[]
): string {
  const nombre = usuario?.nombre || "Usuario EcoGrifo";
  const meta = usuario?.metaDiariaLitros || 50;
  const totalHoy = grifos?.reduce((acc: number, g: Grifo) => acc + (g.consumoHoy || 0), 0) || 0;
  const grifosAbiertos = grifos?.filter((g: Grifo) => g.estado === "abierto") || [];
  
  // Obtener el último mensaje enviado por el usuario para responder de manera coherente
  const ultimoMensajeUsuario = historialMensajes && historialMensajes.length > 0
    ? historialMensajes[historialMensajes.length - 1].content.toLowerCase()
    : "";

  // 1. Respuesta a saludos generales
  if (ultimoMensajeUsuario.includes("hola") || ultimoMensajeUsuario.includes("buenos") || ultimoMensajeUsuario.includes("tardes")) {
    return `¡Hola ${nombre}! 💧 Soy tu **Eco-Coach**. Estoy aquí para analizar tu consumo doméstico de agua y ayudarte a ser más eficiente.

Hoy has consumido **${totalHoy.toFixed(1)} L** de tu meta diaria de **${meta} L**. 
Tenemos registrados **${grifos?.length || 0} grifos** inteligentes.

¿En qué puedo ayudarte hoy?
1. 🔍 *Analizar posibles fugas silenciosas en la casa*
2. 💡 *Dame consejos para reducir el gasto de agua*
3. 📈 *Revisar mi progreso semanal*`;
  }

  // 2. Respuesta a fugas o anomalías
  if (ultimoMensajeUsuario.includes("fuga") || ultimoMensajeUsuario.includes("anomalia") || ultimoMensajeUsuario.includes("alerta")) {
    const alertasFuga = alertas?.filter((a: Alerta) => a.tipo === "fuga") || [];
    if (alertasFuga.length > 0 || grifosAbiertos.length > 0) {
      const ubicacionGrifo = grifosAbiertos[0]?.ubicacion || "el Baño";
      return `⚠️ **¡Alerta de Consumo Inusual detectada!**

Analizando tus patrones históricos, he detectado lo siguiente:
- **Grifo Abierto**: Veo que el grifo de *${grifosAbiertos[0]?.nombre || "Ducha"}* en *${ubicacionGrifo}* está fluyendo ahora mismo a **${(grifosAbiertos[0]?.consumoTiempoReal || 1.2).toFixed(1)} L/min**.
- **Recomendación**: Si no lo estás usando activamente, ciérralo de inmediato. Un grifo abierto por error durante 15 minutos puede desperdiciar hasta **18 litros** de agua potable.
- Si notas que el caudal sigue registrándose incluso con la llave apretada, podría tratarse de una **fuga silenciosa** en el cartucho de la válvula. ¡Valdría la pena revisarlo!`;
    }
    return `🔍 **Análisis de Fugas Completado:**
    
¡Excelentes noticias, ${nombre}! En las últimas 48 horas no he detectado ningún patrón de consumo constante o residual durante la madrugada (2:00 AM - 5:00 AM), que es cuando típicamente se manifiestan las fugas silenciosas (como inodoros dañados). 

¡Tu red doméstica se encuentra en perfectas condiciones y libre de anomalías! 🎉`;
  }

  // 3. Respuesta a consejos de ahorro
  if (ultimoMensajeUsuario.includes("consejo") || ultimoMensajeUsuario.includes("ahorr") || ultimoMensajeUsuario.includes("tips") || ultimoMensajeUsuario.includes("ayuda")) {
    // Buscar grifo con mayor consumo
    const grifoMasConsumo = grifos && grifos.length > 0
      ? [...grifos].sort((a: Grifo, b: Grifo) => b.consumoHoy - a.consumoHoy)[0]
      : null;

    let consejoEspecifico = "Intenta reducir el tiempo de tus duchas diarias en 2 minutos para ahorrar hasta 20 litros por día.";
    if (grifoMasConsumo) {
      if (grifoMasConsumo.ubicacion?.toLowerCase().includes("cocina") || grifoMasConsumo.nombre?.toLowerCase().includes("cocina")) {
        consejoEspecifico = `Veo que tu grifo de la **${grifoMasConsumo.nombre}** es el que más ha consumido hoy (**${grifoMasConsumo.consumoHoy.toFixed(1)} L**). Te aconsejo enjabonar todos los platos juntos con el grifo cerrado y solo abrirlo para enjuagar en cascada. ¡Reducirá el uso en un 40%!`;
      } else if (grifoMasConsumo.ubicacion?.toLowerCase().includes("jardin") || grifoMasConsumo.nombre?.toLowerCase().includes("jardin")) {
        consejoEspecifico = `El grifo del **Jardín** tiene un consumo alto. Te sugiero regar únicamente después de las 6:00 PM para evitar la evaporación solar rápida del agua y permitir que las raíces la absorban mejor.`;
      }
    }

    return `💡 **Consejos de Ahorro Eco-Personalizados para ${nombre}:**

Basado en tus hábitos y la configuración de tus grifos inteligentes:

1. **Optimiza tu grifo principal**: ${consejoEspecifico}
2. **Meta Diaria**: Hoy estás al **${((totalHoy / meta) * 100).toFixed(0)}%** de tu límite de **${meta} L**. Vas con un ritmo de consumo fantástico para cumplir tu meta ecológica.
3. **Instala Aireadores**: Si colocas una boquilla aireadora en tus grifos del baño, puedes reducir el caudal de 9 L/min a 4.5 L/min sin perder sensación de presión. ¡Un ahorro automático del 50%! 🧼`;
  }

  // 4. Progreso o historial
  if (ultimoMensajeUsuario.includes("historial") || ultimoMensajeUsuario.includes("seman") || ultimoMensajeUsuario.includes("progreso")) {
    const totalSemana = historial?.reduce((acc: number, h: Historial) => acc + (h.litros || 0), 0) || 0;
    const promedioSemanal = historial && historial.length > 0 ? (totalSemana / historial.length) : 0;
    
    return `📈 **Tu Resumen Semanal de Eficiencia:**

- **Consumo Promedio Diario**: **${promedioSemanal.toFixed(1)} Litros** en los últimos 7 días.
- **Tu Meta**: Estás logrando mantenerte por debajo de tu límite establecido de **${meta} Litros** en la mayoría de los días. ¡Excelente disciplina!
- **El Campeón del Ahorro**: Tu grifo de *${grifos?.[0]?.nombre || "Lavamanos"}* es el que registra un uso más eficiente de agua. ¡Sigue así, ${nombre}! 🌍`;
  }

  // 5. Respuesta genérica
  return `💧 **Hola ${nombre}, he recibido tu pregunta.** 

Actualmente estoy analizando tus datos domésticos. Como recomendación general rápida:
- Tu consumo actual hoy es de **${totalHoy.toFixed(1)} Litros**.
- Te sugiero mantener un ojo en los flujos continuos de más de 3 minutos.

Dime si tienes alguna duda específica sobre cómo ahorrar en la cocina, en el baño o si quieres que inspeccione tus grifos en busca de fugas latentes.`;
}
