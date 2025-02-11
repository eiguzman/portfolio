console.log('IT’S ALIVE!');

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: 'index.html', title: 'Home', class: 'Home'},
    { url: 'projects/index.html', title: 'Projects'},
    { url: 'contact/cv.html', title: 'CV'},
    { url: 'contact/index.html', title: 'Contact'},
    { url: 'meta/index.html', title: 'Meta'},
    { url: 'https://github.com/eiguzman', title: 'GitHub'},
];

const ARE_WE_HOME = document.documentElement.classList.contains('Home');
let nav = document.createElement('nav');
document.body.prepend(nav);
const currentUrl = location.href;

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    let displayUrl = p.displayUrl || title;
    if (ARE_WE_HOME && p.class == "Home") {
        url = './' + url;
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
    a.classList.add('top-bar')
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

export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        const data = await response.json();
        return data; 
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = ''; // Clear previous content
    project.forEach(proj => {
        const article = document.createElement('article');
        article.innerHTML = `
        <${headingLevel}>${proj.title}</${headingLevel}>
        <img src="${proj.image}" alt="${proj.title}">
        <div class="desc">
        <p>${proj.description}</p>
        <br>
        <p class="year">c. ${proj.year}</p>
        </div>
        `;
        containerElement.appendChild(article);
    });
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
  }

  