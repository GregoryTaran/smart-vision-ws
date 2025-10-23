// Массив страниц внутри menu1.js
const PAGES = [
  { id: "home", label: "Главная" },
  { id: "privacy", label: "Политика конфиденциальности" },
  { id: "terms", label: "Условия использования" },
  { id: "about", label: "О нас" },
  { id: "contacts", label: "Контакты" },
  { id: "dashboard", label: "Личный кабинет" }
];

export function renderMenu(STATE) {
  console.log("PAGES:", PAGES); // Проверка данных

  const menu = document.getElementById("side-menu");
  if (!menu) {
    console.error("Меню не найдено!");
    return;
  }

  // Очищаем меню перед рендерингом
  menu.innerHTML = `
    <div class="menu-header">
      <div>МЕНЮ</div>
      <span id="menu-close">←</span>
    </div>
    <ul class="menu-list"></ul>
  `;

  const list = menu.querySelector(".menu-list");

  // Проверка на пустой PAGES
  if (PAGES.length === 0) {
    list.innerHTML = "<li>Нет страниц для отображения</li>";
    return;
  }

  // Генерация пунктов меню из массива PAGES
  PAGES.forEach(page => {
    if (!page.id || !page.label) {
      console.error("Ошибка в данных страницы:", page);
      return;  // Пропускаем страницы с отсутствующими id или label
    }

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.textContent = page.label;  // Убедись, что это правильный текст
    a.href = `#${page.id}`;

    console.log(`Добавление пункта меню: ${page.label}`);  // Лог для диагностики

    // Активный пункт
    if (STATE.page === page.id) a.classList.add("active");

    a.addEventListener("click", () => {
      STATE.page = page.id;
      document.querySelectorAll("#side-menu a").forEach(el => el.classList.remove("active"));
      a.classList.add("active");
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
