import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer);
const projCount = document.getElementById('project-count');
projCount.textContent = projects.length;

let query = '';
let searchInput = document.querySelector('.searchBar');

function renderPieChart(projectsGiven) {
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );
    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));
    let colors = d3.scaleOrdinal(["#4269d0","#efb118","#ff725c","#6cc5b0","#ff8ab7","#a463f2","#97bbf5","#9c6b4e","#9498a0"]);
    d3.select('svg').selectAll('*').remove();
    d3.select('.legend').selectAll('*').remove();

    let selectedIndex = -1;
    let svg = d3.select('svg');
    svg.selectAll('path').remove();
    
    arcs.forEach((arc, i) => {
        svg.append('path')
        .attr('d', arc)
        .attr('fill', colors(i))
        .on('click', () => {
            selectedIndex = selectedIndex === i ? -1 : i;
            svg.selectAll('path')
            .attr('class', (_, idx) => (
                idx === selectedIndex ? 'selected' : ''
            ));
            d3.select('.legend').selectAll('li')
            .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

            if (selectedIndex === -1) {
                renderProjects(projects, projectsContainer, 'h2');
            } else {
                const selectedLabel = data[selectedIndex].label;
                const filteredProjects = projectsGiven.filter((project) => project.year === selectedLabel);
                renderProjects(filteredProjects, projectsContainer, 'h2');
            }
        });
    });

    let legend = d3.select('.legend');
    data.forEach((d, idx) => {
        legend.append('li')
        .attr('style', `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
        .attr('class', idx === selectedIndex ? 'selected' : '');
    });
}

renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});