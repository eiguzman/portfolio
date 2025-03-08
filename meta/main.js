let data = [];
let xScale;
let yScale;
let selectedCommits = [];
let commitProgress = 100;
let timeScale;

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    timeScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.datetime))
      .range([0, 100]);
    console.log(timeScale);
    displayStats();
  }

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  await createScatterPlot();
  await brushSelector();
});

let commits = d3.groups(data, (d) => d.commit);

function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          // What other options do we need to set?
          // Hint: look up configurable, writable, and enumerable
        });
  
        return ret;
      });
  }
  
function displayStats() {
  // Process commits first
  processCommits();
  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);
  // Add total commits
  dl.append('dt').text('Commits');
  dl.append('dd').text(commits.length);
  // Add total unique files
  const uniqueFiles = new Set(data.map(d => d.file));
  const totalFiles = uniqueFiles.size;
  dl.append('dt').text('Files');
  dl.append('dd').text(totalFiles);
  // Add total file length in characters
  const totalChars = d3.sum(data, d => d.length);
  dl.append('dt').text('Total Characters');
  dl.append('dd').text(totalChars);
  // Add max file length
  const maxLength = d3.max(data, d => d.line);
  dl.append('dt').text('Max File Length (Lines)');
  dl.append('dd').text(maxLength);
  // Add average file length
  const averageLength = data.length / totalFiles;
  dl.append('dt').text('Avg File Length (Lines)');
  dl.append('dd').text(averageLength.toFixed(2));
  // Add longest line length
  const maxLineLength = d3.max(data, d => d.length);
  dl.append('dt').text('Longest Line Length');
  dl.append('dd').text(maxLineLength);
  // Add average line characters
  const averageLineChars = totalChars / data.length;
  dl.append('dt').text('Avg Line Length');
  dl.append('dd').text(averageLineChars.toFixed(2));
  // Add maximum depth
  const maxDepth = d3.max(data, d => d.depth);
  dl.append('dt').text('Max Depth');
  dl.append('dd').text(maxDepth);
  // Add average depth
  const averageDepth = d3.mean(data, d => d.depth)
  dl.append('dt').text('Avg File Depth');
  dl.append('dd').text(averageDepth.toFixed(2));
  // Add most frequent day
  const workByDay = d3.rollups(
    data,
    (v) => v.length,
    (d) => d.date.toLocaleString('en', { weekday: 'long' })
  );
  const maxDay = d3.greatest(workByDay, (d) => d[1])?.[0];
  dl.append('dt').text('Most Frequent Day');
  dl.append('dd').text(maxDay);
  // Add most frequent time
  const workByPeriod = d3.rollups(
    data,
    (v) => v.length,
    (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
  );
  const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
  dl.append('dt').text('Most Frequent Time');
  dl.append('dd').text(maxPeriod);
}

function createScatterPlot() {
  const width = 1000;
  const height = 600;
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();
  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
  
  const dots = svg.append('g').attr('class', 'dots');
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };
  const gridlines = svg.append('g').attr('class', 'gridlines');
  const yTicks = yScale.ticks();
  const colors = ["#011240", "#063779", "#1A77CE", "#A9BFDF", 
    "#FFF5BB", "#FEF87E", "#FFFC3F", "#FABD50", 
    "#FE9657", "#E16F6E", "#604371", "#243071", "#777777"];
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([5, 20]);
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);
  gridlines.selectAll('line')
    .data(yTicks)
    .enter()
    .append('line')
    .attr('x1', usableArea.left)
    .attr('x2', usableArea.right)
    .attr('y1', (d) => yScale(d))
    .attr('y2', (d) => yScale(d))
    .attr('stroke', (d, i) => colors[i % colors.length]);
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);
  dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', function (event, commit, d, i) {
      d3.select(event.currentTarget).classed("selected", true)
      .style('fill-opacity', 1);
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', () => {
      d3.select(event.currentTarget).classed("selected", false)
      .style('fill-opacity', 0.7);
      updateTooltipContent({});
      updateTooltipVisibility(false);
    });
}

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.display = "grid";
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function brushSelector() {
  const svg = document.querySelector('svg');
  d3.select(svg).call(d3.brush().on('start brush end', brushed));
  d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}

let brushSelection = null;

function brushed(event) {
  let brushSelection = event.selection;
  selectedCommits = !brushSelection
    ? []
    : commits.filter((commit) => {
        let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
        let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
        let x = xScale(commit.datetime);
        let y = yScale(commit.hourFrac);

        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
      });
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}

function updateSelection() {
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function updateLanguageBreakdown() {
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }

  return breakdown;
}

const timeSlider = document.getElementById('time-slider');
timeSlider.addEventListener('input', function() {
  commitProgress = +this.value;
  const selectedTime = timeScale.invert(commitProgress);
  document.getElementById('selected-time').textContent = selectedTime.toLocaleString();
});