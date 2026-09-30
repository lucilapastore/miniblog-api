// Vercel Serverless Function: proxy entre el frontend y Gemini.
// La API key vive solo en el servidor (variable de entorno GEMINI_API_KEY).
import { SYSTEM_PROMPT } from './_prompt.js';
import { validateMessages, toGeminiContents, parseGeminiResponse } from './_lib.js';

const DEFAULT_MODEL = 'gemini-2.5-flash';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'El servidor no tiene GEMINI_API_KEY configurada.' });

  const { messages } = req.body ?? {};
  const invalid = validateMessages(messages);
  if (invalid) return res.status(400).json({ error: invalid });

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: toGeminiContents(messages), // historial completo en cada request
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 512,
          // Sin "thinking" en 2.5-flash: respuestas de chat rápidas y sin gastar tokens de salida.
          ...(model.startsWith('gemini-2.5-flash') && { thinkingConfig: { thinkingBudget: 0 } }),
        },
      }),
    });

    if (!response.ok) {
      const status = response.status === 429 ? 429 : 502;
      const error = status === 429 ? 'Demasiadas solicitudes, intenta en unos segundos.' : 'Error al consultar Gemini.';
      return res.status(status).json({ error });
    }

    const reply = parseGeminiResponse(await response.json());
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(502).json({ error: err.message || 'Error al consultar Gemini.' });
  }
}
