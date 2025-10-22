// ======== Smart Vision UI System (v3.7 sync) ========
// Среда определяется в index.html — здесь только логика и динамическая отрисовка.

import { CONFIG } from "./config.js";
import { renderMenu } from "./menu1.js";

console.log(`🌍 Smart Vision (${CONFIG.PROJECT_NAME}) v${CONFIG.VERSION}`);

// ---------- STATE ----------
const STATE = {
  env: window.SMART_ENV || "desktop",
  user: null,
  page: "home",
  uiFlags: {
    menuOpen: false,
    debugVisible: false
  }
};

// ---------- ROOT ----------
const root = {
  header: document.querySelector("header"),
  menu: document.getElementById("side-menu"),
  main: document.getElementById("content"),
  footer: document.getElementById("footer"),
  overlay: document.getElementById("overlay")
};

// ========== INIT ==========
window.addEventListener("DOMContentLoaded", () => {
  setupInitialState();
  renderApp();
  attachGlobalEvents();
  initSwipe();
  console.log(`✅ Environment detected: ${STATE.env}`);
});

// ---------- INITIAL SETUP ----------
function setupInitialState() {
  document.body.dataset.env = STATE.env;

  if (STATE.env === "desktop") {
    document.body.classList.add("menu-open");
    STATE.uiFlags.menuOpen = true;
  } else {
    document.body.classList.remove("menu-open");
    STATE.uiFlags.menuOpen = false;
  }
}

// ========== RENDER APP ==========
function renderApp() {
  renderHeader();
  renderMenuBlock();
  renderMain();
  renderFooter();
  updateEnvButton();
}

// ---------- HEADER ----------
function renderHeader() {
  const userLabel = STATE.user ? STATE.user.name : "Гость";
  root.header.innerHTML = `
    <button id="menu-toggle" aria-label="Открыть меню">☰</button>
    <div id="logo-wrap">
      <img src="assets/logo_${STATE.env}.png" alt="Smart Vision" id="logo">
    </div>
    <div class="user-label">${userLabel}</div>
  `;
  document.getElementById("menu-toggle").onclick = toggleMenu;
}

// ---------- MENU ----------
function renderMenuBlock() {
  root.menu.innerHTML = renderMenu(STATE.page, STATE.user);
  const closeBtn = document.getElementById("menu-close");
  if (closeBtn) closeBtn.onclick = closeMenu;
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
        <h2>О проекте</h2>
        <p>Smart Vision — это архитектура присутствия, фокуса и интеллекта. Здесь каждый элемент интерфейса живой и динамичный.</p>
      </section>`,
    policy: `
      <section class="main-block">
        <h2>Политика конфиденциальности</h2>
        <p>Smart Vision ценит вашу конфиденциальность и соблюдает законы обработки данных. Мы защищаем всё, что передаётся пользователем.</p>
      </section>`,
    terms: `
      <section class="main-block">
        <h2>Условия использования</h2>
        <p>Используя Smart Vision, вы соглашаетесь с принципами ясности, фокуса, интеллекта и свободы.</p>
      </section>`,
    notfound: `
      <section class="main-block">
        <h2>Страница не найдена</h2>
        <p>Похоже, вы перешли по несуществующему адресу.</p>
      </section>`
  };

  root.main.innerHTML = content[STATE.page] || content.notfound;
}

// ---------- FOOTER ----------
function renderFooter() {
  root.footer.innerHTML = `
    <a href="#policy">Политика</a> |
    <a href="#terms">Условия</a>
    <br><small>© 2025 Smart Vision</small>
    <div style="margin-top:10px;">
      <button id="env-btn" class="env-btn">${formatState()}</button>
    </div>
  `;
}

// ---------- STATE BUTTON ----------
function formatState() {
  const { env, user, page, uiFlags } = STATE;
  return `{ env:${env}, user:${user ? user.name : "guest"}, page:${page}, menu:${uiFlags.menuOpen} }`;
}

function updateEnvButton() {
  const btn = document.getElementById("env-btn");
  if (btn) btn.textContent = formatState();
}

// ---------- EVENTS ----------
function attachGlobalEvents() {
  root.overlay.onclick = closeMenu;
  window.addEventListener("hashchange", setPageFromHash);
}

function toggleMenu() {
  STATE.uiFlags.menuOpen = !STATE.uiFlags.menuOpen;
  document.body.classList.toggle("menu-open", STATE.uiFlags.menuOpen);
  updateEnvButton();
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  STATE.uiFlags.menuOpen = false;
  updateEnvButton();
}

// ---------- HASHCHANGE ----------
function setPageFromHash() {
  const hash = window.location.hash.replace("#", "") || "home";
  if (hash !== STATE.page) {
    STATE.page = hash;
    renderApp();
  }
  if (STATE.env === "mobile") closeMenu();
}

// ---------- SWIPE ----------
let touchStartX = 0;
let touchEndX = 0;

function initSwipe() {
  if (STATE.env !== "mobile") return;

  window.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  });

  window.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
  });
}

function handleSwipeGesture() {
  const diff = touchEndX - touchStartX;
  if (diff > 80) toggleMenu(true);
  if (diff < -80) closeMenu();
}
