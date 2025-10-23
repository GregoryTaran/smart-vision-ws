// ======== Smart Vision / design v2 — Index Controller ========

// 🔹 Импорт динамического меню (новый модуль)
import { renderMenu } from "./menu1.js";

// ======== ТВОЙ ОСНОВНОЙ STATE ========
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

// ======== ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ ========
function init() {
  detectEnvironment();
  renderMenuBlock(); // меню создаётся динамически
  renderPage();
  setupMenuButton();
  setupHashChange();
  console.log(`✅ Smart Vision UI запущен в режиме: ${STATE.env}`);
}

// ======== РЕНДЕР МЕНЮ (обновлено) ========
function renderMenuBlock() {
  renderMenu(STATE); // формирует “коробку” меню внутри <nav id="side-menu">
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

// ======== ОБРАБОТКА ПЕРЕХОДОВ ПО СТРАНИЦАМ ========
function setupHashChange() {
  window.addEventListener("hashchange", () => {
    const newPage = location.hash.replace("#", "");
    if (newPage) STATE.page = newPage;
    renderPage();
    renderMenuBlock(); // обновляем активный пункт
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
