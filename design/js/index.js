// ======== Smart Vision UI System (v2) ========

import { CONFIG } from "./config.js";
import { renderMenu } from "./menu1.js";

console.log(`🌍 Smart Vision (${CONFIG.PROJECT_NAME}) v${CONFIG.VERSION}`);

const STATE = {
  env: null,
  page: "home",
  user: null,
  menuOpen: false
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
  renderApp();
  attachGlobalEvents();
});
window.addEventListener("resize", applyEnv);
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
    document.body.classList.remove("menu-open");
  }
}

// ========== CORE RENDER ==========
function renderApp() {
  renderHeader();
  renderMenuBlock();
  renderMain();
  renderFooter();
}

// ========== HEADER ==========
function renderHeader() {
  const userLabel = STATE.user ? STATE.user.name : "Гость";
  root.header.innerHTML = `
    <button id="menu-toggle" aria-label="Открыть меню">☰</button>
    <div id="logo-wrap"><img src="assets/logo400.jpg" alt="Smart Vision" id="logo"></div>
    <div class="user-label">${userLabel}</div>
  `;
  document.getElementById("menu-toggle").onclick = toggleMenu;
}

// ========== MENU ==========
function renderMenuBlock() {
  root.menu.innerHTML = renderMenu(STATE.page, STATE.user);
  const closeBtn = document.getElementById("menu-close");
  if (closeBtn) closeBtn.onclick = () => (document.body.classList.remove("menu-open"), STATE.menuOpen = false);
}

// ========== MAIN ==========
function renderMain() {
  const content = {
    home: `
      <section class="main-block">
        <button id="env-btn" class="env-btn">${envLabel()}</button>
        <h2>Главная страница</h2>
        <p>Добро пожаловать в Smart Vision — место, где ясность превращается в действие.</p>
      </section>`,
    policy: `<h2>Политика конфиденциальности</h2><p>Текст политики...</p>`,
    terms: `<h2>Условия использования</h2><p>Текст условий...</p>`,
    about: `<h2>О нас</h2><p>Smart Vision — проект ясности, фокуса и интеллекта как формы присутствия.</p>`,
    contacts: `<h2>Контакты</h2><p>Связаться: info@smartvision.life</p>`,
    dashboard: renderDashboard(),
    notfound: `<h2>Страница не найдена</h2>`
  };
  root.main.innerHTML = content[STATE.page] || content.notfound;
}

// ========== FOOTER ==========
function renderFooter() {
  root.footer.innerHTML = `
    <a href="#policy">Политика конфиденциальности</a><br>
    <a href="#terms">Условия использования</a><br>
    <small>© 2025 Smart Vision</small>
  `;
}

// ========== DASHBOARD ==========
function renderDashboard() {
  if (!STATE.user) {
    return `<h2>Личный кабинет</h2><p>Пожалуйста, <a href="#login">войдите</a> в систему.</p>`;
  }
  return `<h2>Здравствуйте, ${STATE.user.name}</h2><p>Это ваш личный кабинет Smart Vision.</p>`;
}

// ========== MENU / PAGE ==========
function toggleMenu() {
  STATE.menuOpen = !STATE.menuOpen;
  document.body.classList.toggle("menu-open", STATE.menuOpen);
}
function setPageFromHash() {
  const hash = window.location.hash.replace("#", "") || "home";
  if (hash !== STATE.page) {
    STATE.page = hash;
    renderApp();
  }
}

// ========== UTILS ==========
function envLabel() {
  return STATE.env === "mobile" ? "📱 Мобильная версия" : "💻 ПК версия";
}

// ========== GLOBAL EVENTS ==========
function attachGlobalEvents() {
  root.overlay.onclick = () => {
    STATE.menuOpen = false;
    document.body.classList.remove("menu-open");
  };
}
