function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: 'https://github.io/portfolio/', title: 'Home', displayUrl: 'https://github.io/portfolio/' },
    { url: 'portfolio/projects/index.html', title: 'Projects', displayUrl: 'https://github.io/portfolio/projects' },
    { url: 'portfolio/contact/index.html', title: 'Contact', displayUrl: 'https://github.io/portfolio/contact' },
    { url: 'https://github.com', title: 'GitHub', displayUrl: 'https://github.com' },
    { url: 'portfolio/contact/cv.html', title: 'CV', displayUrl: 'https://github.io/portfolio/contact/cv.html' },
];

const ARE_WE_HOME = document.documentElement.classList.contains('home');
let nav = document.createElement('nav');
document.body.prepend(nav);
const currentUrl = location.href;

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    let displayUrl = p.displayUrl;
    if (!ARE_WE_HOME && !url.startsWith('http') && url.startsWith('portfolio')) {
        url = '/' + url;
    } else if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    }
    let a = document.createElement('a');
    a.href = url;
    a.textContent = displayUrl;
    nav.append(a);
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select id="theme-selector">
              <option value="default">System Default</option>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
          </select>
      </label>`
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
