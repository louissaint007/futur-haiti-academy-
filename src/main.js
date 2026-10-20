const home = document.querySelector('#home');
const viewer = document.querySelector('#viewer');
const frame = document.querySelector('#app-frame');
const currentTitle = document.querySelector('#current-title');
const titles = {
  'systeme-solaire-futur-haiti': 'Système solaire',
  'geologie-futur-haiti': 'Géologie',
  'chimie-futur-haiti': 'Chimie',
  'histoire-futur-haiti': 'Histoire',
};

function openSubject(id) {
  if (!titles[id]) return;
  currentTitle.textContent = titles[id];
  frame.src = `/apps/${id}/index.html`;
  home.hidden = true;
  viewer.hidden = false;
  history.replaceState({ subject: id }, '', `#${id}`);
}

function goHome() {
  frame.src = 'about:blank';
  viewer.hidden = true;
  home.hidden = false;
  history.replaceState({}, '', location.pathname);
}

document.querySelectorAll('[data-app]').forEach(button => {
  button.addEventListener('click', () => openSubject(button.dataset.app));
});
document.querySelector('#back').addEventListener('click', goHome);
document.querySelector('#home-button').addEventListener('click', goHome);
window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !viewer.hidden) goHome();
});

const initial = location.hash.slice(1);
if (titles[initial]) openSubject(initial);
