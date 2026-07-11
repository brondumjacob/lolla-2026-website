// Smart schedule planner widget — ported verbatim from schedule.html's inline
// script. Self-contained vanilla JS (fuzzy-matches artist names against
// window.SCHEDULE from schedule-data.js), kept in this form per the plan's
// guidance to leave the schedule-builder JS close to its current form
// rather than force a premature React rewrite.
(function () {
  var DAY_NAMES = {1:'THURSDAY · JUL 30', 2:'FRIDAY · JUL 31', 3:'SATURDAY · AUG 1', 4:'SUNDAY · AUG 2'};
  var DAY_LINKS = {1:'/schedule-thursday.html', 2:'/schedule-friday.html', 3:'/schedule-saturday.html', 4:'/schedule-sunday.html'};

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var fab = document.getElementById('plannerFab');
  var panel = document.getElementById('plannerPanel');
  var closeBtn = document.getElementById('plannerClose');
  var input = document.getElementById('plannerInput');
  var goBtn = document.getElementById('plannerGo');
  var results = document.getElementById('plannerResults');

  if (!fab || !panel || !closeBtn || !input || !goBtn || !results) return;

  fab.addEventListener('click', function() {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) input.focus();
  });
  closeBtn.addEventListener('click', function() { panel.classList.remove('open'); });
  document.addEventListener('click', function(e) {
    if (!panel.contains(e.target) && e.target !== fab) panel.classList.remove('open');
  });
  input.addEventListener('keydown', function(e) { if (e.key === 'Enter') runPlanner(); });
  goBtn.addEventListener('click', runPlanner);

  function normalize(s) { return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim(); }

  function fuzzyMatch(query, name) {
    var q = normalize(query);
    var n = normalize(name);
    if (!q) return false;
    if (n.includes(q) || q.includes(n)) return true;
    // simple Levenshtein for short queries
    if (q.length < 3) return false;
    var dist = levenshtein(q, n);
    return dist <= Math.floor(q.length * 0.35);
  }

  function levenshtein(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    var dp = [];
    for (var i = 0; i <= m; i++) dp[i] = [i];
    for (var j = 0; j <= n; j++) dp[0][j] = j;
    for (var i = 1; i <= m; i++)
      for (var j = 1; j <= n; j++)
        dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
    return dp[m][n];
  }

  function runPlanner() {
    var raw = input.value.trim();
    if (!raw) return;
    var queries = raw.split(/,|\band\b/i).map(function(s) { return s.trim(); }).filter(Boolean);
    var schedule = window.SCHEDULE || [];
    var matched = [];
    queries.forEach(function(q) {
      var found = schedule.filter(function(s) { return fuzzyMatch(q, s.name); });
      // Prefer exact/closest match per query
      if (found.length > 0) {
        // if exact match exists, take only that
        var exact = found.filter(function(s) { return normalize(s.name).includes(normalize(q)); });
        matched = matched.concat(exact.length ? exact : [found[0]]);
      }
    });
    // Deduplicate
    var seen = {};
    matched = matched.filter(function(s) {
      var key = s.day + '|' + s.name + '|' + s.stage;
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
    renderResults(matched, queries);
  }

  function renderResults(sets, queries) {
    results.style.display = 'block';
    if (!sets.length) {
      results.innerHTML = '<p class="planner-no-match">No artists found. Try checking the spelling or using shorter names.</p>';
      return;
    }
    // Group by day, sort by start time
    var byDay = {1:[], 2:[], 3:[], 4:[]};
    sets.forEach(function(s) { byDay[s.day].push(s); });
    [1,2,3,4].forEach(function(d) { byDay[d].sort(function(a,b) { return a.start - b.start; }); });

    var html = '';
    [1,2,3,4].forEach(function(d) {
      if (!byDay[d].length) return;
      html += '<div class="planner-day-head">' + DAY_NAMES[d] + '</div>';
      byDay[d].forEach(function(s, i) {
        var conflict = '';
        if (i > 0) {
          var prev = byDay[d][i-1];
          if (s.start < prev.end) conflict = '<div class="planner-conflict">⚠ Overlaps with ' + esc(prev.name) + '</div>';
        }
        html += '<div class="planner-set-item">' +
          '<div class="planner-set-time">' + esc(s.disp) + '</div>' +
          '<div class="planner-set-info">' +
            '<div class="planner-set-name">' + esc(s.name) + '</div>' +
            '<div class="planner-set-stage">' + esc(s.stage) + (s.region ? ' · ' + esc(s.region) + ' zone' : '') + '</div>' +
            conflict +
          '</div></div>';
      });
      html += '<a href="' + DAY_LINKS[d] + '" class="planner-link">Open ' + ['Thu','Fri','Sat','Sun'][d-1] + ' Builder →</a>';
    });
    results.innerHTML = html;
  }
})();
