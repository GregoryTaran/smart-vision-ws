// Глобальные состояния
const STATE = {
  env: null, 
  user: null,
  page: "home",
  uiFlags: {
    menuOpen: false, // Изначально меню закрыто
  },
};

// Инициализация среды
function detectEnvironment() {
  const w = window.innerWidth;
  STATE.env = w <= 768 ? "mobile" : "desktop";
  document.body.dataset.env = STATE.env;
}

// Инициализация
function init() {
  detectEnvironment();
  renderMenuBlock();
  renderPage();
  setupMenuButton();
  setupHashChange();
  console.log(`✅ Smart Vision UI запущен в режиме: ${STATE.env}`);
}

// Рендер меню
function renderMenuBlock() {
  renderMenu(STATE); 
  const closeBtn = document.getElementById("menu-close");
  if (closeBtn) closeBtn.onclick = closeMenu;
}

// Рендер страницы
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

// Кнопка открытия/закрытия меню
function setupMenuButton() {
  const menuButton = document.getElementById("menu-toggle");
  if (!menuButton) return;

  menuButton.addEventListener("click", () => {
    STATE.uiFlags.menuOpen = !STATE.uiFlags.menuOpen;
    document.body.classList.toggle("menu-open", STATE.uiFlags.menuOpen);
    console.log("menu-open class toggled:", document.body.classList.contains("menu-open"));
  });
}

// Закрытие меню
function closeMenu() {
  STATE.uiFlags.menuOpen = false;
  document.body.classList.remove("menu-open");
}

// Изменение страницы при смене хеша
function setupHashChange() {
  window.addEventListener("hashchange", () => {
    const newPage = location.hash.replace("#", "");
    if (newPage) STATE.page = newPage;
    renderPage();
    renderMenuBlock(); 
  });
}

// Инициализация
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
