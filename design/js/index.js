// ======== Smart Vision index.js v3.9 ========
import { CONFIG } from "./config.js";
import { renderMenu } from "./menu1.js";

const STATE = {
  env: window.SMART_ENV || "desktop",
  user: null,
  page: "home",
  uiFlags: { menuOpen: false }
};

const root = {
  header: document.querySelector("header"),
  menu: document.getElementById("side-menu"),
  main: document.getElementById("content"),
  footer: document.getElementById("footer"),
  overlay: document.getElementById("overlay")
};

// DOM Ready гарант
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", init);
} else init();

function init() {
  renderApp();
  attachEvents();
  console.log(`✅ Smart Vision UI initialized (${STATE.env})`);
  setInterval(updateEnvButton, 1000); // чекер обновляется раз в секунду
}

function renderApp() {
  renderHeader();
  renderMenuBlock();
  renderMain();
  renderFooter();
  updateEnvButton();
}

// ---------- HEADER ----------
function renderHeader() {
  root.header.innerHTML = `
    <button id="menu-toggle" aria-label="Открыть меню">☰</button>
    <img src="assets/logo.png" id="logo" alt="Smart Vision">
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
  root.main.innerHTML = `
    <section class="main-block">
      <h2>Smart Vision — ясность, фокус, интеллект, свобода.</h2>
      <p>Среда: <b>${STATE.env}</b></p>
      <p>Страница: <b>${STATE.page}</b></p>
    </section>`;
}

// ---------- FOOTER ----------
function renderFooter() {
  root.footer.innerHTML = `
    <div class="footer-links">
      <a href="#home">Главная</a> |
      <a href="#policy">Политика</a> |
      <a href="#terms">Условия</a>
    </div>
    <br>
    <small>© 2025 Smart Vision</small>
    <div style="margin-top:10px;">
      <button id="env-btn" class="env-btn"></button>
    </div>`;
}

// ---------- CHECKER ----------
function formatState() {
  const { env, user, page, uiFlags } = STATE;
  return `env:${env} | page:${page} | menu:${uiFlags.menuOpen}`;
}
function updateEnvButton() {
  const btn = document.getElementById("env-btn");
  if (btn) btn.textContent = formatState();
}

// ---------- EVENTS ----------
function attachEvents() {
  root.overlay.onclick = closeMenu;
  window.addEventListener("hashchange", setPageFromHash);
  initSwipe();
}

function toggleMenu() {
  STATE.uiFlags.menuOpen = !STATE.uiFlags.menuOpen;
  document.body.classList.toggle("menu-open", STATE.uiFlags.menuOpen);
}
function closeMenu() {
  STATE.uiFlags.menuOpen = false;
  document.body.classList.remove("menu-open");
}

function setPageFromHash() {
  const hash = window.location.hash.replace("#", "") || "home";
  if (hash !== STATE.page) {
    STATE.page = hash;
    renderApp();
  }
  if (STATE.env === "mobile") closeMenu();
}

// ---------- SWIPE ----------
let startX = 0;
function initSwipe() {
  if (STATE.env !== "mobile") return;
  window.addEventListener("touchstart", e => startX = e.touches[0].clientX);
  window.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (dx > 80) STATE.uiFlags.menuOpen = true;
    if (dx < -80) STATE.uiFlags.menuOpen = false;
    document.body.classList.toggle("menu-open", STATE.uiFlags.menuOpen);
  });
}
