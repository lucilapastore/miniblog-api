// Funciones puras del frontend (transformación de datos), fáciles de testear.

export const ROUTES = ['/home', '/chat', '/about'];
export const DEFAULT_ROUTE = '/home';
export const API_URL = '/api/functions';

// Normaliza un pathname a una ruta conocida ('/' y desconocidas -> /home).
export function resolveRoute(pathname) {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';
  return ROUTES.includes(clean) ? clean : DEFAULT_ROUTE;
}

export function createMessage(role, text, now = new Date()) {
  return { role, text, timestamp: now.toISOString() };
}

// Hora local HH:MM de un timestamp ISO.
export function formatTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

// Historial completo que se envía a la API (sin timestamps ni mensajes de error locales).
export function toApiMessages(messages) {
  return messages.filter((m) => !m.isError).map(({ role, text }) => ({ role, text }));
}

// Extrae la respuesta del JSON de la API; lanza Error con mensaje legible si falla.
export function parseApiResponse(data) {
  if (data && typeof data.reply === 'string' && data.reply.trim()) return data.reply.trim();
  throw new Error(data?.error || 'Respuesta inválida del servidor.');
}

export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
