export function renderMenu() {
  return `
    <div class="menu-header">
      <span class="menu-title">МЕНЮ</span>
      <button id="menu-close" class="menu-close">←</button>
    </div>
    <ul class="menu-list">
      <li><a href="#">Главная страница</a></li>
      <li><a href="#">Политика конфиденциальности</a></li>
      <li><a href="#">Условия использования</a></li>
      <li><a href="#">О сервисе</a></li>
    </ul>
  `;
}
