// Lógica del chat: estado, llamada a la API y renderizado. No sabe nada del routing.
import { API_URL, createMessage, formatTime, toApiMessages, parseApiResponse } from './utils.js';

const STORAGE_KEY = 'sherlock-chat-history';
const GREETING = 'Buenas tardes. Soy Sherlock Holmes. Exponga su caso, y sea breve: el tiempo es un lujo.';

let messages = [];
let loading = false;

// --- Estado y persistencia (localStorage es opcional: no debe romper la app) ---
export function getMessages() { return messages; }

export function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) { messages = saved; return true; }
  } catch { /* sin storage o JSON inválido */ }
  return false;
}

function saveHistory() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* ignorar */ }
}

export function clearHistory() {
  messages = [createMessage('assistant', GREETING)];
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignorar */ }
}

// --- Red ---
export async function requestReply(history, fetchFn = fetch) {
  const res = await fetchFn(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: toApiMessages(history) }),
  });
  let data = null;
  try { data = await res.json(); } catch { /* cuerpo no JSON */ }
  if (!res.ok) throw new Error(data?.error || `Error del servidor (${res.status}).`);
  return parseApiResponse(data);
}

// --- Render ---
function messageEl(m) {
  const li = document.createElement('li');
  li.className = `msg msg--${m.role}${m.isError ? ' msg--error' : ''}`;
  const p = document.createElement('p');
  p.textContent = m.text;
  const meta = document.createElement('div');
  meta.className = 'msg__meta';
  const time = document.createElement('time');
  time.textContent = formatTime(m.timestamp);
  meta.append(time);
  if (m.role === 'assistant' && !m.isError) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = 'Copiar';
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(m.text); btn.textContent = '¡Copiado!'; } catch { btn.textContent = 'Error'; }
      setTimeout(() => { btn.textContent = 'Copiar'; }, 1500);
    });
    meta.append(btn);
  }
  li.append(p, meta);
  return li;
}

function typingEl() {
  const li = document.createElement('li');
  li.className = 'msg msg--assistant msg--typing';
  li.setAttribute('aria-label', 'Sherlock está escribiendo');
  li.innerHTML = '<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span> <small>escribiendo…</small>';
  return li;
}

function render(list) {
  list.replaceChildren(...messages.map(messageEl));
  if (loading) list.append(typingEl());
  list.scrollTop = list.scrollHeight; // scroll automático al último mensaje
}

// --- Montaje de la vista /chat ---
// `view` apunta siempre al DOM vigente: si el usuario cambia de ruta mientras
// llega una respuesta, la UI correcta se actualiza al volver a /chat.
let view = null;

function refresh() {
  if (!view) return;
  render(view.list);
  view.badge.hidden = messages.length <= 1;
  view.sendBtn.disabled = view.input.disabled = loading;
}

async function send(text) {
  messages.push(createMessage('user', text));
  loading = true;
  saveHistory();
  refresh();
  try {
    messages.push(createMessage('assistant', await requestReply(messages)));
  } catch (err) {
    const msg = createMessage('assistant', `⚠️ ${err.message || 'No se pudo contactar con Sherlock.'} Inténtelo de nuevo.`);
    messages.push({ ...msg, isError: true });
  } finally {
    loading = false;
    saveHistory();
    refresh();
    if (view && document.body.contains(view.input)) view.input.focus();
  }
}

export function mountChat(root) {
  view = {
    list: root.querySelector('#messages'),
    input: root.querySelector('#chat-input'),
    sendBtn: root.querySelector('#send-btn'),
    badge: root.querySelector('#saved-badge'),
  };
  const form = root.querySelector('#chat-form');
  const clearBtn = root.querySelector('#clear-btn');

  if (!messages.length && !loadHistory()) clearHistory();

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Enter en el input también dispara submit
    const text = view.input.value.trim();
    if (!text || loading) return;
    view.input.value = '';
    send(text);
  });

  clearBtn.addEventListener('click', () => {
    if (loading) return;
    clearHistory();
    refresh();
  });

  refresh();
}
