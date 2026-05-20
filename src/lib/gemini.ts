/**
 * Cliente de integración para Google AI Studio (Gemini REST API)
 * Implementa una cadena de fallbacks automática para garantizar disponibilidad.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Lista de modelos ordenados por prioridad de uso basándose en límites de frecuencia y rendimiento gratis
const MODEL_FALLBACK_CHAIN = [
  // 1. Gemini 3.1 Flash Lite (Primario - 500 RPD, 15 RPM)
  "gemini-3.1-flash-lite",
  "gemini-3.1-flash-lite-latest",
  
  // 2. Gemini 3.5 Flash (Secundario - 20 RPD, 5 RPM)
  "gemini-3.5-flash",
  "gemini-3.5-flash-latest",
  
  // 3. Gemini 2.5 Flash Lite (Terciario - 20 RPD, 10 RPM)
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash-lite-latest",
  
  // 4. Gemini 2.5 Flash (Cuaternario - 20 RPD, 5 RPM)
  "gemini-2.5-flash",
  "gemini-2.5-flash-latest",
  
  // 5. Gemma 4 / Gemma 2 (Altas cuotas - 1.5K RPD, 15 RPM)
  "gemma-4-26b",
  "gemma-4-31b",
  "gemma2-27b-it",
  
  // 6. Gemini 1.5 Flash / 8B (Respaldo robusto final)
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash"
];

/**
 * Realiza una consulta de chat con fallback automático
 */
export async function generateChatResponse(
  systemInstruction: string,
  history: ChatMessage[],
  apiKey: string
): Promise<{ text: string; modelUsed: string }> {
  if (!apiKey) {
    throw new Error("API Key de Gemini no configurada.");
  }

  // Formatear el historial para el esquema de la API de Gemini (v1beta)
  const contents = history.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));

  let lastError: Error | null = null;

  // Recorrer la lista de modelos de forma secuencial
  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      console.log(`[Eco-Coach AI] Intentando generar respuesta con modelo: ${model}...`);
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            topP: 0.95
          }
        }),
        // Timeout para que la cascada sea rápida en caso de cuelgues de red (10 segundos)
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Validar estructura de respuesta
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Respuesta vacía o formato inválido de la API de Gemini.");
      }

      console.log(`[Eco-Coach AI] Éxito con el modelo: ${model}`);
      return {
        text,
        modelUsed: mapFriendlyModelName(model)
      };

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn(`[Eco-Coach AI] Falló el modelo ${model}. Error: ${errorMessage}`);
      lastError = err instanceof Error ? err : new Error(errorMessage);
      // Continuar al siguiente modelo en el bucle
    }
  }

  throw new Error(`Todos los modelos de la cadena de fallback fallaron. Último error: ${lastError?.message}`);
}

/**
 * Traduce el ID técnico del modelo a un nombre legible en la interfaz
 */
function mapFriendlyModelName(modelId: string): string {
  if (modelId.includes("3.1-flash-lite")) return "Gemini 3.1 Flash Lite (⚡ Rápido)";
  if (modelId.includes("3.5-flash")) return "Gemini 3.5 Flash (✨ Último)";
  if (modelId.includes("3-flash")) return "Gemini 3 Flash (🚀 Veloz)";
  if (modelId.includes("2.5-flash-lite")) return "Gemini 2.5 Flash Lite";
  if (modelId.includes("2.5-flash")) return "Gemini 2.5 Flash";
  if (modelId.includes("gemma-4")) return `Gemma 4 (${modelId.includes("31b") ? "31B" : "26B"} 🔮 Altas Cuotas)`;
  if (modelId.includes("gemma2")) return "Gemma 2 27B";
  if (modelId.includes("1.5-flash-8b")) return "Gemini 1.5 Flash 8B (Respaldo)";
  if (modelId.includes("1.5-flash")) return "Gemini 1.5 Flash (Respaldo)";
  return modelId;
}
