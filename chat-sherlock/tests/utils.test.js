import { describe, it, expect } from 'vitest';
import { resolveRoute, createMessage, formatTime, toApiMessages, parseApiResponse, escapeHtml } from '../src/utils.js';
import { validateMessages, toGeminiContents, parseGeminiResponse } from '../api/_lib.js';

describe('resolveRoute', () => {
  it('acepta rutas conocidas, con o sin barra final', () => {
    expect(resolveRoute('/chat')).toBe('/chat');
    expect(resolveRoute('/about/')).toBe('/about');
  });
  it('redirige "/" y rutas desconocidas a /home', () => {
    expect(resolveRoute('/')).toBe('/home');
    expect(resolveRoute('/nope')).toBe('/home');
  });
});

describe('mensajes', () => {
  it('createMessage crea rol, texto y timestamp ISO', () => {
    const m = createMessage('user', 'hola', new Date('2024-01-01T10:00:00Z'));
    expect(m).toEqual({ role: 'user', text: 'hola', timestamp: '2024-01-01T10:00:00.000Z' });
  });
  it('formatTime devuelve vacío para fechas inválidas', () => {
    expect(formatTime('basura')).toBe('');
    expect(formatTime('2024-01-01T10:05:00Z')).toMatch(/\d{1,2}:\d{2}/);
  });
  it('toApiMessages quita timestamps y mensajes de error', () => {
    const msgs = [
      createMessage('user', 'a'),
      { ...createMessage('assistant', 'fallo'), isError: true },
      createMessage('assistant', 'b'),
    ];
    expect(toApiMessages(msgs)).toEqual([{ role: 'user', text: 'a' }, { role: 'assistant', text: 'b' }]);
  });
  it('escapeHtml neutraliza etiquetas', () => {
    expect(escapeHtml('<b>"x"</b>')).toBe('&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
  });
});

describe('parseApiResponse (frontend)', () => {
  it('devuelve el texto de reply', () => {
    expect(parseApiResponse({ reply: '  Elemental.  ' })).toBe('Elemental.');
  });
  it('lanza el error del servidor o uno genérico', () => {
    expect(() => parseApiResponse({ error: 'boom' })).toThrow('boom');
    expect(() => parseApiResponse(null)).toThrow('Respuesta inválida');
  });
});

describe('serverless helpers', () => {
  it('toGeminiContents mapea assistant -> model y conserva el historial', () => {
    const out = toGeminiContents([{ role: 'user', text: 'hola' }, { role: 'assistant', text: 'sí' }, { role: 'user', text: 'y?' }]);
    expect(out.map((c) => c.role)).toEqual(['user', 'model', 'user']);
    expect(out[1].parts[0].text).toBe('sí');
  });
  it('validateMessages detecta entradas inválidas', () => {
    expect(validateMessages(undefined)).toBeTruthy();
    expect(validateMessages([])).toBeTruthy();
    expect(validateMessages([{ role: 'system', text: 'x' }])).toBeTruthy();
    expect(validateMessages([{ role: 'assistant', text: 'x' }])).toMatch(/último/);
    expect(validateMessages([{ role: 'user', text: 'hola' }])).toBeNull();
  });
  it('parseGeminiResponse extrae y une el texto de los parts', () => {
    const data = { candidates: [{ content: { parts: [{ text: 'Hola, ' }, { text: 'Watson.' }] } }] };
    expect(parseGeminiResponse(data)).toBe('Hola, Watson.');
  });
  it('parseGeminiResponse falla con respuesta vacía o bloqueada', () => {
    expect(() => parseGeminiResponse({ candidates: [] })).toThrow('vacía');
    expect(() => parseGeminiResponse({ promptFeedback: { blockReason: 'SAFETY' } })).toThrow('SAFETY');
  });
});
