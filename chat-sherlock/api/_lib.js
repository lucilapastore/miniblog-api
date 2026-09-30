// Funciones puras usadas por la serverless function (testeables sin red).

export const MAX_MESSAGES = 50;
export const MAX_TEXT_LENGTH = 2000;

// Valida el body recibido. Devuelve un mensaje de error o null si es válido.
export function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'Se requiere un arreglo "messages" no vacío.';
  }
  if (messages.length > MAX_MESSAGES) return `Máximo ${MAX_MESSAGES} mensajes por solicitud.`;
  for (const m of messages) {
    const validRole = m && (m.role === 'user' || m.role === 'assistant');
    if (!validRole || typeof m.text !== 'string' || !m.text.trim()) {
      return 'Cada mensaje debe tener role ("user" | "assistant") y text no vacío.';
    }
    if (m.text.length > MAX_TEXT_LENGTH) return `Cada mensaje admite hasta ${MAX_TEXT_LENGTH} caracteres.`;
  }
  if (messages[messages.length - 1].role !== 'user') return 'El último mensaje debe ser del usuario.';
  return null;
}

// Convierte el historial {role, text} al formato "contents" de Gemini ("assistant" -> "model").
export function toGeminiContents(messages) {
  return messages.map(({ role, text }) => ({
    role: role === 'assistant' ? 'model' : 'user',
    parts: [{ text }],
  }));
}

// Extrae el texto de la respuesta de Gemini. Lanza Error si no hay contenido usable.
export function parseGeminiResponse(data) {
  const blockReason = data?.promptFeedback?.blockReason;
  if (blockReason) throw new Error(`Solicitud bloqueada por Gemini (${blockReason}).`);
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts) ? parts.map((p) => p.text ?? '').join('').trim() : '';
  if (!text) throw new Error('Gemini devolvió una respuesta vacía.');
  return text;
}
