import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer);

const projCount = document.getElementById('project-count');

projCount.textContent = projects.length;
let query = '';
let selectedYear = '';
let searchInput = document.querySelector('.searchBar');
let selectedIndex = -1;

function filterProjects(projectsGiven, selectedYear, query) {
    return projectsGiven.filter((project) => {
        const matchesYear = selectedYear ? project.year === selectedYear : true;
        const matchesQuery = Object.values(project).join('\n').toLowerCase()
        .includes(query.toLowerCase());

        return matchesYear && matchesQuery;
    });
}

function renderPieChart(projectsGiven, year="") {
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
    let colors = d3.scaleOrdinal(
        ["#4269d0", "#efb118", "#ff725c", "#6cc5b0", "#ff8ab7", "#a463f2"]);

    d3.select('svg').selectAll('*').remove();
    d3.select('.legend').selectAll('*').remove();

    let svg = d3.select('svg');

    arcs.forEach((arc, i) => {
        svg.append('path')
        .attr('d', arc)
        .attr('fill', colors(i))
        .attr('class', data[i].label === selectedYear ? 'selected' : '')
        .on('click', () => {

            if (selectedYear === data[i].label) {
                selectedYear = '';
            } else {
                selectedYear = data[i].label;
            }

            svg.selectAll('path')
            .attr('class', (_, idx) => 
                (data[idx].label === selectedYear ? 'selected' : ''));
            d3.select('.legend').selectAll('li')
            .attr('class', (_, idx) => 
                (data[idx].label === selectedYear ? 'selected' : ''));

            const filteredProjects = filterProjects(
                projects, selectedYear, query);

            renderProjects(filteredProjects, projectsContainer, 'h2');
        });
    });

    let legend = d3.select('.legend');

    data.forEach((d, idx) => {
        legend.append('li')
        .attr('style', `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
        .attr('class', d.label === selectedYear ? 'selected' : '');
    });
}

renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
    console.log(selectedYear);
    query = event.target.value;

    if (query == ""){
        renderPieChart(projects, selectedYear);
    } else {
    const filteredProjects = filterProjects(projects, selectedYear, query);
    
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects,selectedYear);
    }
});
