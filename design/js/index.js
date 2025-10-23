// ======== Smart Vision / design v2 — Index Controller ========

// 🔹 Импорт динамического меню
import { renderMenu } from "./menu1.js";

// ======== ГЛОБАЛЬНОЕ СОСТОЯНИЕ ========
const STATE = {
  env: null, // 'desktop' | 'mobile'
  user: null,
  page: "home",
  uiFlags: {
    menuOpen: false,
    overlay: false,
    debugVisible: false,
  },
};

// ======== ОПРЕДЕЛЕНИЕ СРЕДЫ ========
function detectEnvironment() {
  const w = window.innerWidth;
  STATE.env = w <= 768 ? "mobile" : "desktop";
  document.body.dataset.env = STATE.env;
}

// ======== ИНИЦИАЛИЗАЦИЯ ========
function init() {
  detectEnvironment();
  renderMenuBlock(); // создаём меню
  renderPage();
  setupMenuButton();
  setupHashChange();
  console.log(`✅ Smart Vision UI запущен в режиме: ${STATE.env}`);
}

// ======== РЕНДЕР МЕНЮ (исправлено) ========
function renderMenuBlock() {
  // раньше здесь затирался DOM, теперь просто рендерим меню внутрь #side-menu
  renderMenu(STATE);

  const closeBtn = document.getElementById("menu-close");
  if (closeBtn) closeBtn.onclick = closeMenu;
}

// ======== РЕНДЕР КОНТЕНТА ========
function renderPage() {
  const main = document.querySelector("main");
  if (!main) return;

  main.innerHTML = `
    <div class="page">
      <h1>${STATE.page}</h1>
      <p>Контент страницы "${STATE.page}"</p>
    </div>
  `;
}

// ======== КНОПКА ОТКРЫТИЯ / ЗАКРЫТИЯ МЕНЮ ========
function setupMenuButton() {
  const menuButton = document.getElementById("menu-toggle");
  if (!menuButton) return;

  menuButton.addEventListener("click", () => {
    STATE.uiFlags.menuOpen = !STATE.uiFlags.menuOpen;
    document.body.classList.toggle("menu-open", STATE.uiFlags.menuOpen);
  });
}

// ======== ЗАКРЫТИЕ МЕНЮ ========
function closeMenu() {
  STATE.uiFlags.menuOpen = false;
  document.body.classList.remove("menu-open");
}

// ======== ИЗМЕНЕНИЕ СТРАНИЦ ПРИ HASHCHANGE ========
function setupHashChange() {
  window.addEventListener("hashchange", () => {
    const newPage = location.hash.replace("#", "");
    if (newPage) STATE.page = newPage;
    renderPage();
    renderMenuBlock(); // обновляем активный пункт меню
  });
}

// ======== РЕСАЙЗ (смена среды) ========
window.addEventListener("resize", () => {
  const prevEnv = STATE.env;
  detectEnvironment();
  if (STATE.env !== prevEnv) {
    console.log(`🖥️ Среда изменилась: ${prevEnv} → ${STATE.env}`);
  }
});

// ======== СТАРТ ПРИ ЗАГРУЗКЕ ========
document.addEventListener("DOMContentLoaded", init);
