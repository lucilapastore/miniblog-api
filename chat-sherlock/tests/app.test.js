import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestReply, clearHistory, getMessages } from '../src/chat.js';
import handler from '../api/functions.js';

describe('requestReply (fetch mockeado)', () => {
  it('envía el historial completo y devuelve la respuesta', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ reply: 'Elemental.' }) });
    const history = [
      { role: 'user', text: 'hola', timestamp: 't1' },
      { role: 'assistant', text: 'buenas', timestamp: 't2' },
      { role: 'user', text: 'caso?', timestamp: 't3' },
    ];
    await expect(requestReply(history, fetchFn)).resolves.toBe('Elemental.');
    const [url, opts] = fetchFn.mock.calls[0];
    expect(url).toBe('/api/functions');
    expect(JSON.parse(opts.body).messages).toHaveLength(3);
  });

  it('propaga el error del servidor', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({ error: 'Error al consultar Gemini.' }) });
    await expect(requestReply([{ role: 'user', text: 'x' }], fetchFn)).rejects.toThrow('Error al consultar Gemini.');
  });

  it('propaga errores de red', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
    await expect(requestReply([{ role: 'user', text: 'x' }], fetchFn)).rejects.toThrow('Failed to fetch');
  });
});

describe('clearHistory', () => {
  it('reinicia con el saludo de Sherlock', () => {
    clearHistory();
    expect(getMessages()).toHaveLength(1);
    expect(getMessages()[0].role).toBe('assistant');
  });
});

describe('routing SPA', () => {
  beforeEach(() => {
    document.body.innerHTML = `<nav><a href="/home" data-link>Home</a><a href="/chat" data-link>Chat</a><a href="/about" data-link>About</a></nav><main id="app"></main>`;
    history.replaceState({}, '', '/');
  });

  it('navega con pushState y responde a popstate (back/forward)', async () => {
    const { initRouter, navigate } = await import('../src/app.js');
    initRouter();
    expect(location.pathname).toBe('/home');
    expect(document.querySelector('h1').textContent).toBe('Sherlock Holmes');

    navigate('/about');
    expect(location.pathname).toBe('/about');
    expect(document.querySelector('h1').textContent).toBe('Acerca del proyecto');

    history.replaceState({}, '', '/home'); // simula el cambio de URL que hace el navegador al volver
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(document.querySelector('h1').textContent).toBe('Sherlock Holmes');
  });
});

describe('serverless function', () => {
  const mockRes = () => {
    const res = { headers: {} };
    res.status = (c) => { res.code = c; return res; };
    res.json = (b) => { res.body = b; return res; };
    res.setHeader = (k, v) => { res.headers[k] = v; };
    return res;
  };

  it('rechaza métodos distintos de POST', async () => {
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.code).toBe(405);
  });

  it('llama a Gemini con la key del servidor y devuelve reply', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'Fascinante.' }] } }] }),
    });
    const res = mockRes();
    await handler({ method: 'POST', body: { messages: [{ role: 'user', text: 'hola' }] } }, res);
    expect(res.code).toBe(200);
    expect(res.body).toEqual({ reply: 'Fascinante.' });
    const [, opts] = fetchSpy.mock.calls[0];
    expect(opts.headers['x-goog-api-key']).toBe('test-key');
    expect(JSON.parse(opts.body).system_instruction.parts[0].text).toContain('Sherlock Holmes');
    fetchSpy.mockRestore();
  });

  it('responde 400 ante un body inválido', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const res = mockRes();
    await handler({ method: 'POST', body: {} }, res);
    expect(res.code).toBe(400);
  });
});
