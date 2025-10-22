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

// определяем тип среды
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
  updateEnvButton();
}

function initMobile() {
  toggle.onclick = () => document.body.classList.toggle("menu-open");
  overlay.onclick = () => document.body.classList.remove("menu-open");
}

function initDesktop() {
  toggle.onclick = () => document.body.classList.toggle("menu-open");
}

function updateEnvButton() {
  if (!envBtn) return;
  const env = getEnv();
  envBtn.textContent = env === "mobile" ? "📱 Мобильная страница" : "💻 ПК-страница";
}

envBtn.addEventListener("click", updateEnvButton);
window.addEventListener("resize", applyEnv);
window.addEventListener("DOMContentLoaded", applyEnv);

// === MOBILE MENU FIX: стрелка + свайп ===
const menuCloseBtn = document.getElementById("menu-close");
const menu = document.getElementById("side-menu");

// закрытие меню по стрелке
if (menuCloseBtn) {
  menuCloseBtn.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
  });
}

// свайп влево для закрытия
let startX = 0;
menu.addEventListener("touchstart", e => (startX = e.touches[0].clientX), { passive: true });
menu.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  if (startX - endX > 50) document.body.classList.remove("menu-open");
}, { passive: true });
