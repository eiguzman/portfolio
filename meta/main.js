let data = [];

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    console.log(data);
    displayStats();
  }

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
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

    // Add total unique projects
    const uniqueProjects = new Set(data.map(d => d.file));
    const totalProjects = uniqueProjects.size;
    dl.append('dt').text('Files');
    dl.append('dd').text(totalProjects);

    // Add maximum depth
    const maxDepth = d3.max(data, d => d.depth);
    dl.append('dt').text('Max Depth');
    dl.append('dd').text(maxDepth);

    // Add max file length
    const maxLength = d3.max(data, d => d.length);
    dl.append('dt').text('Max File Length');
    dl.append('dd').text(maxLength);

    // Add average file length
    const totalLength = d3.sum(data, d => d.length);
    const averageLength = totalLength / data.length;
    dl.append('dt').text('Average File Length');
    dl.append('dd').text(averageLength.toFixed(2)); // Show 2 decimal places
  }