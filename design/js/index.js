import { CONFIG } from "./config.js";
import { renderMenu } from "./menu1.js";

console.log(`🚀 Smart Vision (${CONFIG.PROJECT_NAME})`);

const menu = document.getElementById("side-menu");
const overlay = document.getElementById("overlay");
const toggle = document.getElementById("menu-toggle");
const page = document.getElementById("page-wrapper");

// вставляем меню и футер
menu.innerHTML = renderMenu();
document.getElementById("footer").innerHTML = `
  <a href="#">Политика конфиденциальности</a><br />
  <a href="#">Условия использования</a><br />
  <small>© 2025 Smart Vision</small>
`;

// определить тип среды
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
}

function initMobile() {
  console.log("📱 Mobile mode");
  let startX = 0, endX = 0;
  toggle.onclick = () => document.body.classList.toggle("menu-open");
  overlay.onclick = () => document.body.classList.remove("menu-open");

  // свайп для закрытия меню
  menu.addEventListener("touchstart", e => (startX = e.touches[0].clientX), { passive: true });
  menu.addEventListener("touchend", e => {
    endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) document.body.classList.remove("menu-open");
  }, { passive: true });
}

function initDesktop() {
  console.log("💻 Desktop mode");
  toggle.onclick = () => document.body.classList.toggle("menu-open");
}

window.addEventListener("resize", applyEnv);
window.addEventListener("DOMContentLoaded", applyEnv);
// === DEBUG STATE INDICATOR ===
const stateIndicator = document.createElement("div");
stateIndicator.id = "env-indicator";
stateIndicator.style.position = "fixed";
stateIndicator.style.bottom = "10px";
stateIndicator.style.right = "10px";
stateIndicator.style.padding = "8px 12px";
stateIndicator.style.background = "rgba(0,0,0,0.7)";
stateIndicator.style.color = "#fff";
stateIndicator.style.borderRadius = "8px";
stateIndicator.style.fontSize = "14px";
stateIndicator.style.fontFamily = "monospace";
stateIndicator.style.zIndex = "9999";
document.body.appendChild(stateIndicator);

function updateIndicator() {
  const env = window.innerWidth <= 768 ? "mobile" : "desktop";
  stateIndicator.textContent =
    env === "mobile"
      ? "📱 СОСТОЯНИЕ МОБИЛЬНОЙ СТРАНИЦЫ"
      : "💻 СОСТОЯНИЕ ПК";
}
window.addEventListener("resize", updateIndicator);
window.addEventListener("DOMContentLoaded", updateIndicator);
