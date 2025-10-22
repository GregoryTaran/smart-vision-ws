import { CONFIG } from './config.js';
import { renderMenu } from './menu1.js';

console.log(`🚀 Smart Vision (${CONFIG.PROJECT_NAME})`);

const menu = document.getElementById('side-menu');
const overlay = document.getElementById('overlay');
const toggle = document.getElementById('menu-toggle');
const page = document.getElementById('page-wrapper');

menu.innerHTML = renderMenu();
document.getElementById('footer').innerHTML = `
  <a href="#">Политика конфиденциальности</a><br />
  <a href="#">Условия использования</a><br />
  <small>© 2025 Smart Vision</small>
`;

function getEnvironment() {
  return window.innerWidth <= 768 ? 'mobile' : 'desktop';
}

let currentEnv = null;

function applyEnvironment() {
  const env = getEnvironment();
  if (env === currentEnv) return;
  currentEnv = env;
  document.body.dataset.env = env;
  document.body.classList.remove('menu-open');

  if (env === 'mobile') initMobile();
  else initDesktop();
}

function initMobile() {
  toggle.onclick = () => document.body.classList.toggle('menu-open');
  overlay.onclick = () => document.body.classList.remove('menu-open');
}

function initDesktop() {
  toggle.onclick = () => document.body.classList.toggle('menu-open');
}

window.addEventListener('resize', applyEnvironment);
window.addEventListener('DOMContentLoaded', applyEnvironment);
