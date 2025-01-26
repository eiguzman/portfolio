console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
};

let navLinks = $$("nav a");

let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
  );

currentLink?.classList.add('current');

// let pages = [
//     { url: 'https://eiguzman.github.io/portfolio/', title: 'Main' },
//     { url: '../portfolio/projects/index.html', title: 'Projects' },
//     { url: '../portfolio/contact/index.html', title: 'Contact' },
//     { url: '../portfolio/contact/cv.html', title: 'CV' },
//   ];