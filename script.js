(function() {
  const graph = document.getElementById('gh-graph');
  const totalEl = document.getElementById('gh-total');
  const monthLabelsEl = document.getElementById('gh-month-labels');
  const USERNAME = 'NguyenThomas986';

  function level(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 6) return 2;
    if (count <= 12) return 3;
    return 4;
  }

  function buildGraph(days) {
    // days: array of { date: Date, count: number }
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const CELL_W = 14;

    const total = days.reduce((s, d) => s + d.count, 0);
    totalEl.textContent = total.toLocaleString();

    // Pad to Sunday
    const firstDay = days[0].date.getDay();
    const paddedDays = Array(firstDay).fill(null).concat(days);
    const weeks = [];
    for (let i = 0; i < paddedDays.length; i += 7) {
      weeks.push(paddedDays.slice(i, i + 7));
    }

    // Month labels
    monthLabelsEl.innerHTML = '';
    let lastMonth = -1;
    weeks.forEach(week => {
      const realDays = week.filter(Boolean);
      const m = realDays.length ? realDays[0].date.getMonth() : lastMonth;
      const lbl = document.createElement('span');
      lbl.className = 'gh-month-label';
      lbl.style.width = CELL_W + 'px';
      if (m !== lastMonth && realDays.length) {
        lbl.textContent = MONTHS[m];
        lastMonth = m;
      }
      monthLabelsEl.appendChild(lbl);
    });

    // Grid
    graph.innerHTML = '';
    weeks.forEach(week => {
      const col = document.createElement('div');
      col.className = 'gh-week';
      week.forEach(day => {
        const cell = document.createElement('div');
        cell.className = 'gh-cell';
        if (day) {
          cell.setAttribute('data-level', level(day.count));
          const dateStr = day.date.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
          cell.title = day.count === 0
            ? `No contributions on ${dateStr}`
            : `${day.count} contribution${day.count > 1 ? 's' : ''} on ${dateStr}`;
        } else {
          cell.style.visibility = 'hidden';
        }
        col.appendChild(cell);
      });
      graph.appendChild(col);
    });
  }

  // Try to fetch real data from GitHub contributions API proxy
  async function fetchReal() {
    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`);
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      // jogruber API returns { contributions: [ { date: "YYYY-MM-DD", count: N, level: 0-4 }, ... ] }
      const days = json.contributions.map(c => ({
        date: new Date(c.date + 'T12:00:00'),
        count: c.count
      }));
      buildGraph(days);
    } catch(e) {
      // Fallback: generate placeholder data
      fallback();
    }
  }

  function fallback() {
    function pseudoRand(seed) {
      let s = seed;
      return function() {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      };
    }
    const rand = pseudoRand(986);
    const today = new Date();
    const days = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const isWeekday = d.getDay() >= 1 && d.getDay() <= 5;
      const r = rand();
      let count = 0;
      if (r < (isWeekday ? 0.55 : 0.25)) {
        const intensity = rand();
        if (intensity < 0.5) count = 1 + Math.floor(rand() * 3);
        else if (intensity < 0.8) count = 4 + Math.floor(rand() * 4);
        else count = 8 + Math.floor(rand() * 6);
      }
      days.push({ date: d, count });
    }
    buildGraph(days);
  }

  fetchReal();
})();

