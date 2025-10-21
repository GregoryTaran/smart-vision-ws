import { CONFIG } from "./config.js";
import { renderMenu } from "./menu1.js";

console.log(`🚀 Smart Vision (${CONFIG.PROJECT_NAME})`);

// Вставляем меню и футер
document.getElementById("side-menu").innerHTML = renderMenu();
document.getElementById("footer").innerHTML = `
  <a href="#">Политика конфиденциальности</a><br />
  <a href="#">Условия использования</a><br />
  <small>© 2025 Smart Vision</small>
`;

// Логика открытия/закрытия меню
const toggle = document.getElementById("menu-toggle");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("menu-open");
});
