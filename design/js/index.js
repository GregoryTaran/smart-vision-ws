console.log("✅ Smart Vision Design started");

document.getElementById("menu-left").innerHTML = `
  <a href="#">Главная</a>
  <a href="#">Vision</a>
  <a href="#">Поиск</a>
`;

document.getElementById("menu-right").innerHTML = `
  <a href="#">Профиль</a>
  <a href="#">Выход</a>
`;

document.getElementById("content").innerHTML += `
  <p>JS работает, меню подставлено динамически.</p>
`;
