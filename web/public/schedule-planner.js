// Smart schedule planner widget — ported verbatim from schedule.html's inline
// script, then extended (2026-07) with: per-query "you searched for" chip
// feedback, a match summary, typeahead suggestions, ★ favorites prefill, a
// clear button, and a11y (focus trap, Escape, aria-expanded). Self-contained
// vanilla JS (fuzzy-matches artist names against window.SCHEDULE from
// schedule-data.js), kept in this form per the plan's guidance to leave the
// schedule-builder JS close to its current form rather than force a
// premature React rewrite.
(function () {
  var DAY_NAMES = {1:'THURSDAY · JUL 30', 2:'FRIDAY · JUL 31', 3:'SATURDAY · AUG 1', 4:'SUNDAY · AUG 2'};
  var DAY_LINKS = {1:'/schedule-thursday.html', 2:'/schedule-friday.html', 3:'/schedule-saturday.html', 4:'/schedule-sunday.html'};
  var FAVORITES_KEY = 'lolla-my-lineup-v1';

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
  var inputRow = document.getElementById('plannerInputRow');
  var clearBtn = document.getElementById('plannerClear');
  var suggest = document.getElementById('plannerSuggest');
  var favAdd = document.getElementById('plannerFavAdd');
  var goBtn = document.getElementById('plannerGo');
  var results = document.getElementById('plannerResults');

  if (!fab || !panel || !closeBtn || !input || !inputRow || !clearBtn || !suggest || !favAdd || !goBtn || !results) return;

  var ARTIST_NAMES = buildArtistNameList();
  var activeSuggestIndex = -1;

  // ── open / close / focus management ─────────────────────────────────────
  function setOpen(isOpen) {
    panel.classList.toggle('open', isOpen);
    fab.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      input.focus();
    } else {
      closeSuggestions();
    }
  }

  fab.addEventListener('click', function() {
    setOpen(!panel.classList.contains('open'));
  });
  closeBtn.addEventListener('click', function() {
    setOpen(false);
    fab.focus();
  });
  document.addEventListener('click', function(e) {
    if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== fab) {
      setOpen(false);
    }
    if (suggest.classList.contains('open') && !suggest.contains(e.target) && e.target !== input) {
      closeSuggestions();
    }
  });
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape' || !panel.classList.contains('open')) return;
    if (suggest.classList.contains('open')) {
      closeSuggestions();
      return;
    }
    setOpen(false);
    fab.focus();
  });
  // Focus trap: Tab/Shift+Tab cycles within the open panel.
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab' || !panel.classList.contains('open')) return;
    var focusable = panel.querySelectorAll('button, input, a[href]');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  goBtn.addEventListener('click', runPlanner);

  // ── input row: clear button + typeahead ─────────────────────────────────
  input.addEventListener('input', function() {
    updateClearVisibility();
    updateSuggestions();
  });
  input.addEventListener('keydown', function(e) {
    if (suggest.classList.contains('open')) {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveActiveSuggestion(1); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); moveActiveSuggestion(-1); return; }
      if (e.key === 'Tab') { closeSuggestions(); return; }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeSuggestions(); return; }
      if (e.key === 'Enter' && activeSuggestIndex >= 0) {
        e.preventDefault();
        var items = suggest.querySelectorAll('.planner-suggest-item');
        selectSuggestion(items[activeSuggestIndex].textContent);
        return;
      }
    }
    if (e.key === 'Enter') runPlanner();
  });

  clearBtn.tabIndex = -1;
  clearBtn.addEventListener('click', function() {
    input.value = '';
    updateClearVisibility();
    closeSuggestions();
    results.style.display = 'none';
    results.innerHTML = '';
    input.focus();
  });

  function updateClearVisibility() {
    var hasText = input.value.length > 0;
    inputRow.classList.toggle('has-text', hasText);
    clearBtn.tabIndex = hasText ? 0 : -1;
  }

  function buildArtistNameList() {
    var schedule = window.SCHEDULE || [];
    var seen = {};
    var names = [];
    schedule.forEach(function(s) {
      var key = normalize(s.name);
      if (!seen[key]) { seen[key] = true; names.push(s.name); }
    });
    names.sort();
    return names;
  }

  // Returns the text of the token currently being typed — i.e. everything
  // after the last comma or the last standalone "and", so suggestions match
  // only the name in progress, not the whole multi-name input.
  function getCurrentToken(value) {
    var lastComma = value.lastIndexOf(',');
    var andMatch = -1;
    var andRe = /\band\b/gi;
    var m;
    while ((m = andRe.exec(value))) { andMatch = m.index + m[0].length; }
    var splitAt = Math.max(lastComma + 1, andMatch);
    return value.slice(splitAt).replace(/^\s+/, '');
  }

  function updateSuggestions() {
    var raw = input.value;
    var token = getCurrentToken(raw).trim();
    if (token.length < 2) { closeSuggestions(); return; }
    var q = normalize(token);
    var matches = ARTIST_NAMES.filter(function(n) { return normalize(n).indexOf(q) !== -1; }).slice(0, 8);
    if (!matches.length) { closeSuggestions(); return; }
    activeSuggestIndex = -1;
    suggest.innerHTML = matches.map(function(name, i) {
      return '<div class="planner-suggest-item" data-index="' + i + '" role="option">' + esc(name) + '</div>';
    }).join('');
    suggest.classList.add('open');
    Array.prototype.forEach.call(suggest.querySelectorAll('.planner-suggest-item'), function(el) {
      el.addEventListener('mousedown', function(e) {
        e.preventDefault(); // keep focus on the input instead of blurring
        selectSuggestion(el.textContent);
      });
    });
  }

  function moveActiveSuggestion(delta) {
    var items = suggest.querySelectorAll('.planner-suggest-item');
    if (!items.length) return;
    if (activeSuggestIndex >= 0) items[activeSuggestIndex].classList.remove('active');
    activeSuggestIndex = (activeSuggestIndex + delta + items.length) % items.length;
    items[activeSuggestIndex].classList.add('active');
    items[activeSuggestIndex].scrollIntoView({ block: 'nearest' });
  }

  function selectSuggestion(name) {
    var raw = input.value;
    var token = getCurrentToken(raw);
    var prefix = raw.slice(0, raw.length - token.length);
    input.value = prefix + name + ', ';
    updateClearVisibility();
    closeSuggestions();
    input.focus();
  }

  function closeSuggestions() {
    suggest.classList.remove('open');
    suggest.innerHTML = '';
    activeSuggestIndex = -1;
  }

  // ── ★ favorites prefill ──────────────────────────────────────────────────
  function readFavorites() {
    try {
      var raw = window.localStorage.getItem(FAVORITES_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function(v) { return typeof v === 'string'; });
    } catch (e) {
      return [];
    }
  }

  (function initFavorites() {
    var favs = readFavorites();
    if (!favs.length) return;
    favAdd.style.display = 'block';
    favAdd.textContent = '＋ Add my ' + favs.length + ' ★ favorite' + (favs.length === 1 ? '' : 's');
    favAdd.addEventListener('click', function() {
      var current = readFavorites();
      if (!current.length) return;
      var joined = current.join(', ');
      var existing = input.value.trim();
      input.value = existing ? existing + ', ' + joined : joined;
      updateClearVisibility();
      runPlanner();
    });
  })();

  // ── matching ─────────────────────────────────────────────────────────────
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
    closeSuggestions();
    var raw = input.value.trim();
    if (!raw) return;
    var queries = raw.split(/,|\band\b/i).map(function(s) { return s.trim(); }).filter(Boolean);
    var schedule = window.SCHEDULE || [];
    // Track per-query results (not just the flat matched list) so we can show
    // the user which of their searched names actually matched.
    var perQuery = queries.map(function(q) {
      var found = schedule.filter(function(s) { return fuzzyMatch(q, s.name); });
      var exact = found.filter(function(s) { return normalize(s.name).includes(normalize(q)); });
      var picked = exact.length ? exact : (found.length ? [found[0]] : []);
      return { query: q, sets: picked };
    });
    var matched = [];
    perQuery.forEach(function(pq) { matched = matched.concat(pq.sets); });
    // Deduplicate
    var seen = {};
    matched = matched.filter(function(s) {
      var key = s.day + '|' + s.name + '|' + s.stage;
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
    renderResults(matched, perQuery);
  }

  function renderResults(sets, perQuery) {
    results.style.display = 'block';

    var matchedQueries = perQuery.filter(function(pq) { return pq.sets.length > 0; }).length;
    var totalQueries = perQuery.length;
    var dayNums = {};
    sets.forEach(function(s) { dayNums[s.day] = true; });
    var dayCount = Object.keys(dayNums).length;

    var html = '<p class="planner-summary">Found ' + matchedQueries + ' of ' + totalQueries +
      ' artist' + (totalQueries === 1 ? '' : 's') +
      (dayCount ? ' across ' + dayCount + ' day' + (dayCount === 1 ? '' : 's') : '') + '</p>';

    html += '<div class="planner-chip-row">';
    perQuery.forEach(function(pq) {
      if (pq.sets.length) {
        html += '<span class="planner-chip planner-chip-match">' + esc(pq.sets[0].name) +
          ' <span aria-hidden="true">✓</span></span>';
      } else {
        html += '<span class="planner-chip planner-chip-miss">' + esc(pq.query) +
          ' <span class="planner-chip-status">not found</span></span>';
      }
    });
    html += '</div>';

    if (!sets.length) {
      html += '<p class="planner-no-match">No artists found. Try checking the spelling or using shorter names.</p>';
      results.innerHTML = html;
      return;
    }

    // Group by day, sort by start time
    var byDay = {1:[], 2:[], 3:[], 4:[]};
    sets.forEach(function(s) { byDay[s.day].push(s); });
    [1,2,3,4].forEach(function(d) { byDay[d].sort(function(a,b) { return a.start - b.start; }); });

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
