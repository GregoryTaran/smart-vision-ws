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

  updateIndicator(env);
}

function initMobile() {
  console.log("📱 Mobile mode");
  let startX = 0, endX = 0;
  toggle.onclick = () => document.body.classList.toggle("menu-open");
  overlay.onclick = () => document.body.classList.remove("menu-open");

  // свайп для закрытия меню
  menu.addEventListener(
    "touchstart",
    (e) => (startX = e.touches[0].clientX),
    { passive: true }
  );
  menu.addEventListener(
    "touchend",
    (e) => {
      endX = e.changedTouches[0].clientX;
      if (startX - endX > 50) document.body.classList.remove("menu-open");
    },
    { passive: true }
  );
}

function initDesktop() {
  console.log("💻 Desktop mode");
  toggle.onclick = () => document.body.classList.toggle("menu-open");
}

window.addEventListener("resize", applyEnv);
window.addEventListener("DOMContentLoaded", applyEnv);

// === DEBUG STATE INDICATOR (центр экрана) ===
const stateIndicator = document.createElement("div");
stateIndicator.id = "env-indicator";
stateIndicator.style.position = "fixed";
stateIndicator.style.top = "50%";
stateIndicator.style.left = "50%";
stateIndicator.style.transform = "translate(-50%, -50%)";
stateIndicator.style.padding = "20px 30px";
stateIndicator.style.background = "rgba(0,0,0,0.8)";
stateIndicator.style.color = "#fff";
stateIndicator.style.borderRadius = "16px";
stateIndicator.style.fontSize = "22px";
stateIndicator.style.fontWeight = "bold";
stateIndicator.style.fontFamily = "sans-serif";
stateIndicator.style.textAlign = "center";
stateIndicator.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
stateIndicator.style.transition = "opacity 0.4s ease";
stateIndicator.style.zIndex = "9999";
document.body.appendChild(stateIndicator);

function updateIndicator(env) {
  const current =
    env || (window.innerWidth <= 768 ? "mobile" : "desktop");
  stateIndicator.textContent =
    current === "mobile"
      ? "📱 СОСТОЯНИЕ МОБИЛЬНОЙ СТРАНИЦЫ"
      : "💻 СОСТОЯНИЕ ПК";

  stateIndicator.style.opacity = "1";
  clearTimeout(updateIndicator._timer);
  updateIndicator._timer = setTimeout(() => {
    stateIndicator.style.opacity = "0.3"; // плавное затухание
  }, 2000);
}

window.addEventListener("resize", () => updateIndicator());
window.addEventListener("DOMContentLoaded", () => updateIndicator());
