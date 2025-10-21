import { CONFIG } from "./config.js";
import { renderMenu } from "./menu1.js";

console.log(`🚀 Smart Vision Index (${CONFIG.PROJECT_NAME})`);

// Верхний блок
document.getElementById("header").innerHTML = `
  <button id="menu-toggle" aria-label="Открыть меню">☰</button>
  <div id="logo">ЛОГО КАРТИНКА</div>
`;

// Основной блок
document.getElementById("content").innerHTML = `
  <nav id="side-menu" class="hidden">${renderMenu()}</nav>
  <section class="main-block">
    <h2>ОСНОВНОЙ БЛОК</h2>
    <p>
      Любая мысль может стать визией.<br />
      Любая визия может стать дорогой.<br />
      А дорога — источником внутреннего света.
    </p>
    <p>Грег Таран | 2025</p>
  </section>
`;

// Нижний блок
document.getElementById("footer").innerHTML = `
  <a href="#">Политика конфиденциальности</a><br />
  <a href="#">Условия использования</a><br />
  <small>© 2025 Smart Vision</small>
`;

// Открытие/закрытие меню
document.getElementById("menu-toggle").addEventListener("click", () => {
  document.getElementById("side-menu").classList.toggle("hidden");
});
