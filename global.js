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

const ARE_WE_HOME = document.documentElement.classList.contains('home');

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    if (!ARE_WE_HOME && !url.startsWith('http') && url.startsWith('portfolio')) {
        url = './' + url;
    } else if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    }
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);
    
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
      );
  }