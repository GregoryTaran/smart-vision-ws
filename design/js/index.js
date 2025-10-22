// ======== Smart Vision UI System (v3.5 stable env-style) ========
// Логика STATE, ENV и подгрузка нужного CSS при старте.

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
  detectAndLoadEnvCSS();   // ← выбор и загрузка стиля
  renderApp();
  attachGlobalEvents();
  initSwipe();
  updateEnvButton();
  console.log(`✅ Environment: ${STATE.env}`);
});

window.addEventListener("resize", applyEnv);
window.addEventListener("hashchange", setPageFromHash);

// ========== ENV DETECT + LOAD ==========
function detectEnv() {
  return window.innerWidth <= 768 ? "mobile" : "desktop";
}

function detectAndLoadEnvCSS() {
  const env = detectEnv();
  STATE.env = env;
  document.body.dataset.env = env;

  // ✅ исправлено: меню закрыто на мобиле, открыто на десктопе
  if (env === "desktop") {
    document.body.classList.add("menu-open");
    STATE.uiFlags.menuOpen = true;
  } else {
    document.body.classList.remove("menu-open");
    STATE.uiFlags.menuOpen = false;
  }

  // загружаем только нужный стиль
  const cssFile = `css/${env}.css`;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cssFile;
  link.id = "env-style";
  document.head.appendChild(link);
}

function applyEnv() {
  const env = detectEnv();
  if (STATE.env !== env) {
    console.log("🔄 Среда изменилась. Для корректного отображения обновите страницу (F5).");
  }
}

// ========== RENDER ==========
function renderApp() {
  renderHeader();
  renderMenuBlock();
  renderMain();
  renderFooter();
}

// ---------- HEADER ----------
function renderHeader() {
  const userLabel = STATE.user ? STATE.user.name : "Гость";
  root.header.innerHTML = `
    <button id="menu-toggle" aria-label="Открыть меню">☰</button>
    <div id="logo-wrap"><img src="assets/logo400.jpg" alt="Smart Vision" id="logo"></div>
    <div class="user-label">${userLabel}</div>
  `;
  document.getElementById("menu-toggle").onclick = toggleMenu;
}

// ---------- MENU ----------
function renderMenuBlock() {
  root.menu.innerHTML = renderMenu(STATE.page, STATE.user);
  const closeBtn = document.getElementById("menu-close");
  if (closeBtn) closeBtn.onclick = () => {
    document.body.classList.remove("menu-open");
    STATE.uiFlags.menuOpen = false;
    updateEnvButton();
  };
}

// ---------- MAIN ----------
function renderMain() {
  const content = {
    home: `
      <section class="main-block">
        <h2>Главная страница</h2>
        <p>Добро пожаловать в Smart Vision — место, где ясность превращается в действие.</p>
      </section>`,
    about: `
      <section class="main-block">
        <h2>О нас</h2>
        <p>Smart Vision — проект ясности, фокуса и интеллекта как формы присутствия.</p>
      </section>`,
    policy: `
      <section class="main-block">
        <h2>Политика конфиденциальности</h2>
        <p>Smart Vision уважает вашу конфиденциальность и обрабатывает данные ответственно.</p>
      </section>`,
    terms: `
      <section class="main-block">
        <h2>Условия использования</h2>
        <p>Используя Smart Vision, вы соглашаетесь с нашими принципами ясности и ответственности.</p>
      </section>`,
    contacts: `
      <section class="main-block">
        <h2>Контакты</h2>
        <p>Связаться: <a href="mailto:info@smartvision.life">info@smartvision.life</a></p>
      </section>`,
    dashboard: `
      <section class="main-block">
        <h2>Личный кабинет</h2>
        <p>Добро пожаловать в ваш Smart Vision Dashboard.</p>
      </section>`,
    notfound: `<section class="main-block"><h2>Страница не найдена</h2></section>`
  };

  root.main.innerHTML = content[STATE.page] || content.notfound;
  updateEnvButton();
}

// ---------- FOOTER ----------
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

// ---------- STATE BUTTON ----------
function formatState() {
  const { env, user, page, uiFlags } = STATE;
  return `{ env:${env}, user:${user ? user.name : "guest"}, page:${page}, menu:${uiFlags.menuOpen}, debug:${uiFlags.debugVisible} }`;
}

function updateEnvButton() {
  const btn = document.getElementById("env-btn");
  if (btn) btn.textContent = formatState();
}

// ---------- EVENTS ----------
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

// ---------- HASHCHANGE ----------
function setPageFromHash() {
  const hash = window.location.hash.replace("#", "") || "home";
  if (hash !== STATE.page) {
    STATE.page = hash;
    renderApp();
  }

  if (STATE.env === "mobile") {
    document.body.classList.remove("menu-open");
    STATE.uiFlags.menuOpen = false;
    updateEnvButton();
  }
}

// ---------- SWIPE GESTURES ----------
let touchStartX = 0;
let touchEndX = 0;

function initSwipe() {
  window.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  window.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
  }, false);
}

function handleSwipeGesture() {
  const diff = touchEndX - touchStartX;
  if (STATE.env === "mobile" && STATE.uiFlags.menuOpen && diff < -70) {
    document.body.classList.remove("menu-open");
    STATE.uiFlags.menuOpen = false;
    updateEnvButton();
  }
}
