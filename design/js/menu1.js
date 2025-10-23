// ======== Smart Vision Desktop v2 Menu System (динамическая версия) ========

import { PAGES } from "./config.js";

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

  // генерируем пункты меню из массива PAGES
  PAGES.forEach(page => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.textContent = page.title;
    a.href = `#${page.id}`;

    // активная страница
    if (STATE.page === page.id) a.classList.add("active");

    a.addEventListener("click", () => {
      // обновляем STATE
      STATE.page = page.id;

      // визуально обновляем активный пункт
      document.querySelectorAll("#side-menu a").forEach(el => el.classList.remove("active"));
      a.classList.add("active");

      // закрываем меню
      document.body.classList.remove("menu-open");
    });

    li.appendChild(a);
    list.appendChild(li);
  });

  // обработчик закрытия меню
  const closeBtn = menu.querySelector("#menu-close");
  closeBtn.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
  });
}
