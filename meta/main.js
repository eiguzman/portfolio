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
  