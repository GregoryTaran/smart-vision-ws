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

// определяем — телефон или десктоп
const isMobile = window.matchMedia("(max-width: 768px)").matches;

if (isMobile) {
  toggle.addEventListener("click", () => document.body.classList.toggle("menu-open"));
  overlay.addEventListener("click", () => document.body.classList.remove("menu-open"));

  // свайп для закрытия
  let startX = 0, endX = 0;
  sideMenu.addEventListener("touchstart", e => startX = e.changedTouches[0].screenX, { passive: true });
  sideMenu.addEventListener("touchend", e => {
    endX = e.changedTouches[0].screenX;
    if (startX - endX > 50) document.body.classList.remove("menu-open");
  }, { passive: true });

  sideMenu.addEventListener("click", e => {
    if (e.target.id === "menu-close") document.body.classList.remove("menu-open");
  });
} else {
  // 💻 десктоп — меню всегда открыто, overlay не нужен
  document.body.classList.add("menu-open");
  overlay.style.display = "none";
}

// активный пункт меню
sideMenu.addEventListener("click", e => {
  if (e.target.tagName === "A") {
    sideMenu.querySelectorAll("a").forEach(a => a.classList.remove("active"));
    e.target.classList.add("active");
  }
});
