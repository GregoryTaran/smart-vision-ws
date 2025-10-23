// menu1.js

import { PAGES } from "./config.js";

// Функция рендера меню
export function renderMenu(STATE) {
  const menu = document.getElementById("side-menu");
  if (!menu) return;

  menu.innerHTML = `
    <div class="menu-header">
      <div>МЕНЮ</div>
      <span id="menu-close">←</span>
    </div>
    <ul class="menu-list"></ul>
  `;

  const list = menu.querySelector(".menu-list");

  // Генерируем пункты меню из массива PAGES
  PAGES.forEach(page => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.textContent = page.label;
    a.href = `#${page.id}`;

    // Активный пункт
    if (STATE.page === page.id) a.classList.add("active");

    a.addEventListener("click", () => {
      // Обновляем STATE
      STATE.page = page.id;

      // Визуально обновляем активный пункт
      document.querySelectorAll("#side-menu a").forEach(el => el.classList.remove("active"));
      a.classList.add("active");

      // Закрываем меню
      document.body.classList.remove("menu-open");
    });

    li.appendChild(a);
    list.appendChild(li);
  });

  // Обработчик закрытия меню
  const closeBtn = menu.querySelector("#menu-close");
  closeBtn.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
  });
}
