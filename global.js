console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: 'https://eiguzman.github.io/portfolio/', title: 'Home' },
    { url: 'portfolio/projects/index.html', title: 'Projects' },
    { url: 'portfolio/contact/index.html', title: 'Contact' },
    { url: 'https://github.com/eiguzman', title: 'GitHub' },
    { url: 'portfolio/contact/cv.html', title: 'CV' },
  ];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
    nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
  }