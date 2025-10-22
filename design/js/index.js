// ======== Smart Vision UI System (v2.6) ========
// Автоподключение CSS по STATE.env (base + mobile/desktop)

import { CONFIG } from "./config.js";
import { renderMenu } from "./menu1.js";

console.log(`🌍 Smart Vision (${CONFIG.PROJECT_NAME}) v${CONFIG.VERSION}`);

const STATE = {
  env: null,
  user: null,
  page: "home",
  uiFlags: {
    menuOpen: false,
    debugVisible: false
  }
};

const root = {
  header: document.querySelector("header"),
  menu: document.getElementById("side-menu"),
  main: document.getElementById("content"),
  footer: document.getElementById("footer"),
  overlay: document.getElementById("overlay")
};

// ========== INIT ==========
window.addEventListener("DOMContentLoaded", () => {
  applyEnv();
  loadCSS("base");                // общий стиль всегда
  loadCSS(STATE.env);             // мобильный или десктоп
  renderApp();
  attachGlobalEvents();
  updateEnvButton();
});
window.addEventListener("resize", onResize);
window.addEventListener("hashchange", setPageFromHash);

// ========== ENV DETECT ==========
function detectEnv() {
  return window.innerWidth <= 768 ? "mobile" : "desktop";
}

function applyEnv() {
  const env = detectEnv();
  if (STATE.env !== env) {
    STATE.env = env;
    document.body.dataset.env = env;
    document.body.classList.toggle("menu-open", env === "desktop");
    STATE.uiFlags.menuOpen = env === "desktop";
    updateEnvButton();
  }
}

// при ресайзе пересоздаём CSS-линк если изменилась среда
function onResize() {
  const oldEnv = STATE.env;
  applyEnv();
  if (STATE.env !== oldEnv) {
    removeOldEnvCSS();
    loadCSS(STATE.env);
  }
}

// ========== CSS LOADER ==========
function loadCSS(name) {
  const id = `css-${name}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `/css/${name}.css`;
  document.head.appendChild(link);
}

function removeOldEnvCSS() {
  ["css-mobile", "css-desktop"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
}

// ========== RENDER ==========
function renderApp() {
  renderHeader();
  renderMenuBlock();
  renderMain();
  renderFooter();
}

function renderHeader() {
  const userLabel = STATE.user ? STATE.user.name : "Гость";
  root.header.innerHTML = `
    <button id="menu-toggle" aria-label="Открыть меню">☰</button>
    <div id="logo-wrap"><img src="assets/logo400.jpg" alt="Smart Vision" id="logo"></div>
    <div class="user-label">${userLabel}</div>
  `;
  document.getElementById("menu-toggle").onclick = toggleMenu;
}

function renderMenuBlock() {
  root.menu.innerHTML = renderMenu(STATE.page, STATE.user);
  const closeBtn = document.getElementById("menu-close");
  if (closeBtn) closeBtn.onclick = () => {
    document.body.classList.remove("menu-open");
    STATE.uiFlags.menuOpen = false;
    updateEnvButton();
  };
}

function renderMain() {
  const content = {
    home: `<section class="main-block"><h2>Главная страница</h2>
      <p>Добро пожаловать в Smart Vision — место, где ясность превращается в действие.</p></section>`,
    about: `<h2>О нас</h2><p>Smart Vision — интеллект как форма присутствия.</p>`,
    notfound: `<h2>Страница не найдена</h2>`
  };
  root.main.innerHTML = content[STATE.page] || content.notfound;
  updateEnvButton();
}

function renderFooter() {
  root.footer.innerHTML = `
    <a href="#policy">Политика конфиденциальности</a><br>
    <a href="#terms">Условия использования</a><br>
    <small>© 2025 Smart Vision</small>
    <div style="margin-top:10px;">
      <button id="env-btn" class="env-btn">${formatState()}</button>
    </div>
  `;
  updateEnvButton();
}

// ========== STATE BUTTON ==========
function formatState() {
  const { env, user, page, uiFlags } = STATE;
  return `{ env:${env}, user:${user ? user.name : "guest"}, page:${page}, menu:${uiFlags.menuOpen}, debug:${uiFlags.debugVisible} }`;
}

function updateEnvButton() {
  const btn = document.getElementById("env-btn");
  if (btn) {
    btn.textContent = formatState();
  }
}

// ========== GLOBAL EVENTS ==========
function attachGlobalEvents() {
  root.overlay.onclick = () => {
    STATE.uiFlags.menuOpen = false;
    document.body.classList.remove("menu-open");
    updateEnvButton();
  };
}

function toggleMenu() {
  STATE.uiFlags.menuOpen = !STATE.uiFlags.menuOpen;
  document.body.classList.toggle("menu-open", STATE.uiFlags.menuOpen);
  updateEnvButton();
}

function setPageFromHash() {
  const hash = window.location.hash.replace("#", "") || "home";
  if (hash !== STATE.page) {
    STATE.page = hash;
    renderApp();
  }
}
