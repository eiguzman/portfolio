console.log('IT’S ALIVE!');

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: 'https://eiguzman.github.io/portfolio/', title: 'Home'},
    { url: 'portfolio/projects/index.html', title: 'Projects'},
    { url: 'portfolio/contact/index.html', title: 'Contact'},
    { url: 'https://github.com/eiguzman', title: 'GitHub'},
    { url: 'portfolio/contact/cv.html', title: 'CV'},
];

const ARE_WE_HOME = document.documentElement.classList.contains('home');
let nav = document.createElement('nav');
document.body.prepend(nav);
const currentUrl = location.href;

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    let displayUrl = p.displayUrl || title;
    if (!ARE_WE_HOME && !url.startsWith('http') && url.startsWith('portfolio')) {
        url = '/' + url;
    } else if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    }
    
    let a = document.createElement('a');
    a.href = url;
    a.textContent = displayUrl;

    if (url.startsWith('https://github.com')) {
        a.setAttribute('target', '_blank');
    }

    nav.append(a);
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <div class="theme-switcher">
          <label class="color-scheme">
              Theme:
              <select id="theme-selector">
                  <option value="default">System Default</option>
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
              </select>
          </label>
      </div>`
);

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

const savedTheme = localStorage.getItem('theme') || 'default';
applyTheme(savedTheme);
const themeSelector = document.getElementById('theme-selector');
themeSelector.value = savedTheme;
themeSelector.addEventListener('change', function() {
    const selectedTheme = this.value;
    applyTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
});
