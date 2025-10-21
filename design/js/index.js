import { CONFIG } from "./config.js";
import { renderMenu } from "./menu1.js";

console.log(`🚀 Smart Vision (${CONFIG.PROJECT_NAME})`);

const sideMenu = document.getElementById("side-menu");
const overlay = document.getElementById("overlay");
const toggle = document.getElementById("menu-toggle");
const pageWrapper = document.getElementById("page-wrapper");

sideMenu.innerHTML = renderMenu();
document.getElementById("footer").innerHTML = `
  <a href="#">Политика конфиденциальности</a><br />
  <a href="#">Условия использования</a><br />
  <small>© 2025 Smart Vision</small>
`;

// helpers
const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

function openMenu() {
  document.body.classList.add("menu-open");
  if (isMobile()) {
    // правая часть (видимая часть страницы) слегка серая
    pageWrapper.style.background = "#f2f2f2";
  }
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  // возвращаем фон
  pageWrapper.style.background = "#ffffff";
}

function toggleMenu() {
  if (document.body.classList.contains("menu-open")) closeMenu();
  else openMenu();
}

// Desktop и Mobile — одна кнопка
toggle.addEventListener("click", toggleMenu);

// Закрытие по кнопке внутри меню
sideMenu.addEventListener("click", (e) => {
  if (e.target && e.target.id === "menu-close") {
    closeMenu();
  }
});

// Свайп для мобилы
let startX = 0, endX = 0;
sideMenu.addEventListener("touchstart", e => startX = e.changedTouches[0].screenX, { passive: true });
sideMenu.addEventListener("touchend", e => {
  endX = e.changedTouches[0].screenX;
  if (startX - endX > 50) closeMenu();
}, { passive: true });

// Клик по полю вокруг (только на мобиле)
overlay.addEventListener("click", closeMenu);

// Активный пункт меню
sideMenu.addEventListener("click", e => {
  if (e.target.tagName === "A") {
    sideMenu.querySelectorAll("a").forEach(a => a.classList.remove("active"));
    e.target.classList.add("active");
  }
});
