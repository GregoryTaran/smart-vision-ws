import { CONFIG } from "./config.js";
import { renderMenu } from "./menu1.js";

console.log(`🚀 Smart Vision (${CONFIG.PROJECT_NAME})`);

const menu = document.getElementById("side-menu");
const overlay = document.getElementById("overlay");
const toggle = document.getElementById("menu-toggle");
const page = document.getElementById("page-wrapper");
const envBtn = document.getElementById("env-btn");

// вставляем меню и футер
menu.innerHTML = renderMenu();
document.getElementById("footer").innerHTML = `
  <a href="#">Политика конфиденциальности</a><br />
  <a href="#">Условия использования</a><br />
  <small>© 2025 Smart Vision</small>
`;

// ======== Состояние страницы ========
function envLabel() {
  return window.innerWidth <= 768 ? "📱 Мобильная страница" : "💻 ПК-страница";
}
function renderEnvBtn() {
  if (!envBtn) return;
  envBtn.textContent = envLabel();
}
window.addEventListener("resize", renderEnvBtn);
window.addEventListener("DOMContentLoaded", renderEnvBtn);

// ======== Определение среды ========
function getEnv() {
  return window.innerWidth <= 768 ? "mobile" : "desktop";
}

let currentEnv = null;
function applyEnv() {
  const env = getEnv();
  if (env === currentEnv) return;
  currentEnv = env;
  document.body.dataset.env = env;
  document.body.classList.remove("menu-open");

  if (env === "mobile") initMobile();
  else initDesktop();

  renderEnvBtn();
}

// ======== Мобильная логика ========
function initMobile() {
  toggle.onclick = () => document.body.classList.toggle("menu-open");
  overlay.onclick = () => document.body.classList.remove("menu-open");

  const menuCloseBtn = document.getElementById("menu-close");
  if (menuCloseBtn) menuCloseBtn.onclick = () => document.body.classList.remove("menu-open");

  let startX = 0;
  menu.addEventListener("touchstart", e => (startX = e.touches[0].clientX), { passive: true });
  menu.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) document.body.classList.remove("menu-open");
  }, { passive: true });
}

// ======== ПК логика ========
function initDesktop() {
  document.body.classList.remove("menu-open");
  toggle.onclick = () => document.body.classList.toggle("menu-open");

  const menuCloseBtn = document.getElementById("menu-close");
  if (menuCloseBtn) menuCloseBtn.onclick = () => document.body.classList.remove("menu-open");
}

window.addEventListener("resize", applyEnv);
window.addEventListener("DOMContentLoaded", applyEnv);
