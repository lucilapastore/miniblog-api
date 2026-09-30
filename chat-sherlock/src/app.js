// Punto de entrada: routing SPA con History API y render de vistas.
import { resolveRoute } from './utils.js';
import { mountChat } from './chat.js';

const views = {
  '/home': {
    title: 'Inicio',
    html: `
      <section class="hero">
        <div class="hero__avatar" aria-hidden="true">🕵️</div>
        <h1>Sherlock Holmes</h1>
        <p class="hero__tagline">Detective consultor · 221B Baker Street, Londres</p>
        <p>Brillante, observador y de lengua afilada. Ha resuelto los casos que Scotland Yard no pudo.
        Cuéntele su misterio… pero no espere que le trate con condescendencia: solo con lógica.</p>
        <a href="/chat" data-link class="btn btn--primary">Empezar a chatear</a>
      </section>`,
  },
  '/chat': {
    title: 'Chat',
    html: `
      <section class="chat">
        <div class="chat__bar">
          <h1>Chat con Sherlock</h1>
          <span id="saved-badge" class="badge" hidden title="Tu conversación se guarda en este navegador">💾 Historial guardado</span>
          <button id="clear-btn" type="button" class="btn btn--ghost">Borrar historial</button>
        </div>
        <ul id="messages" class="messages" aria-live="polite"></ul>
        <form id="chat-form" class="composer" autocomplete="off">
          <input id="chat-input" type="text" placeholder="Escriba su mensaje…" aria-label="Mensaje" maxlength="2000" required />
          <button id="send-btn" type="submit" class="btn btn--primary">Enviar</button>
        </form>
      </section>`,
    mount: mountChat,
  },
  '/about': {
    title: 'Acerca de',
    html: `
      <section class="prose">
        <h1>Acerca del proyecto</h1>
        <p>Proyecto Integrador 3: una <strong>Single Page Application</strong> para conversar con Sherlock Holmes
        usando <strong>Google Gemini</strong>.</p>
        <h2>El personaje</h2>
        <p>Sherlock Holmes, creado por Sir Arthur Conan Doyle: deductivo, formal, algo arrogante y con humor ácido.
        Responde siempre en frases cortas y sin salir del personaje.</p>
        <h2>Tecnología</h2>
        <ul>
          <li>HTML, CSS (mobile-first) y JavaScript (módulos ES) sin frameworks.</li>
          <li>Routing con History API (<code>pushState</code> / <code>popstate</code>).</li>
          <li>Vercel Serverless Function como proxy: la API key nunca llega al navegador.</li>
          <li>Tests unitarios con Vitest.</li>
        </ul>
      </section>`,
  },
};

const outlet = () => document.getElementById('app');

export function render(pathname = location.pathname) {
  const route = resolveRoute(pathname);
  const view = views[route];
  const root = outlet();
  root.innerHTML = view.html;
  view.mount?.(root);
  document.title = `${view.title} · Sherlock Holmes`;
  document.querySelectorAll('[data-link]').forEach((a) => {
    const active = a.getAttribute('href') === route;
    a.classList.toggle('active', active && a.closest('nav') !== null);
    if (a.closest('nav')) active ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
  return route;
}

export function navigate(path) {
  const route = resolveRoute(path);
  if (route !== location.pathname) history.pushState({}, '', route);
  render(route);
}

export function initRouter() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest?.('a[data-link]');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(link.getAttribute('href'));
  });
  // back / forward del navegador
  window.addEventListener('popstate', () => render(location.pathname));
  const route = resolveRoute(location.pathname);
  if (route !== location.pathname) history.replaceState({}, '', route); // "/" -> "/home"
  render(route);
}

if (typeof document !== 'undefined' && document.getElementById('app')) initRouter();
