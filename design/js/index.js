import { CONFIG } from "./config.js";
import { renderMenu } from "./menu1.js";

console.log(`🚀 Smart Vision (${CONFIG.PROJECT_NAME})`);

const sideMenu = document.getElementById("side-menu");
const overlay = document.getElementById("overlay");
const toggle = document.getElementById("menu-toggle");

sideMenu.innerHTML = renderMenu();
document.getElementById("footer").innerHTML = `
  <a href="#">Политика конфиденциальности</a><br />
  <a href="#">Условия использования</a><br />
  <small>© 2025 Smart Vision</small>
`;

// --- открытие/закрытие меню ---
toggle.addEventListener("click", toggleMenu);
overlay.addEventListener("click", closeMenu);

function toggleMenu() {
  document.body.classList.toggle("menu-open");
}
function closeMenu() {
  document.body.classList.remove("menu-open");
}

// --- свайп влево для закрытия ---
let startX = 0, endX = 0;
sideMenu.addEventListener("touchstart", e => startX = e.changedTouches[0].screenX, { passive: true });
sideMenu.addEventListener("touchend", e => {
  endX = e.changedTouches[0].screenX;
  if (startX - endX > 50) closeMenu();
}, { passive: true });

// --- кнопка ← закрывает меню ---
sideMenu.addEventListener("click", e => {
  if (e.target.id === "menu-close") closeMenu();
});

// --- активный пункт меню ---
sideMenu.addEventListener("click", e => {
  if (e.target.tagName === "A") {
    sideMenu.querySelectorAll("a").forEach(a => a.classList.remove("active"));
    e.target.classList.add("active");
  }
});
