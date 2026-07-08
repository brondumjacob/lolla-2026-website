// favorites.js — shared "My Lineup" favorites feature added in the 2026 redesign.
// Stores starred artist names in localStorage; wires up star-toggle buttons on any page,
// and (if present) renders the full My Lineup list using window.ARTISTS (from artists.js).
(function () {
  'use strict';

  var SKEY = 'lolla-my-lineup-v1';

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getSaved() {
    try {
      var v = JSON.parse(localStorage.getItem(SKEY) || '[]');
      return new Set(Array.isArray(v) ? v.filter(function (x) { return typeof x === 'string'; }) : []);
    }
    catch (e) { return new Set(); }
  }
  function setSaved(set) {
    localStorage.setItem(SKEY, JSON.stringify(Array.from(set)));
  }

  var saved = getSaved();

  function updateCounters() {
    document.querySelectorAll('#nav-mylineup-count, .mylineup-count').forEach(function (el) {
      el.textContent = saved.size;
    });
  }

  function refreshStarButtons() {
    document.querySelectorAll('.star-toggle').forEach(function (btn) {
      var name = btn.getAttribute('data-name');
      var isSaved = saved.has(name);
      btn.classList.toggle('saved', isSaved);
      btn.setAttribute('aria-label', (isSaved ? 'Remove ' : 'Save ') + name + (isSaved ? ' from' : ' to') + ' your lineup');
    });
  }

  function toggle(name) {
    if (saved.has(name)) saved.delete(name); else saved.add(name);
    setSaved(saved);
    refreshStarButtons();
    updateCounters();
    renderMyLineupIfPresent();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.star-toggle');
    if (!btn) return;
    e.preventDefault();
    toggle(btn.getAttribute('data-name'));
  });

  var DAY_LABEL = { 1: 'THU', 2: 'FRI', 3: 'SAT', 4: 'SUN' };

  function renderMyLineupIfPresent() {
    var root = document.getElementById('mylineup-root');
    if (!root) return;
    if (typeof window.ARTISTS === 'undefined') {
      root.innerHTML = '<div class="mylineup-empty"><div class="me-title">Artist data unavailable</div><div class="me-desc">This page needs artists.js loaded.</div></div>';
      return;
    }
    var picks = window.ARTISTS.filter(function (a) { return saved.has(a.n); })
      .sort(function (a, b) { return a.d - b.d || a.n.localeCompare(b.n); });

    if (!picks.length) {
      root.innerHTML = '<div class="mylineup-empty"><div class="me-title">You haven&#39;t starred anything yet</div><div class="me-desc">Browse the <a href="/">full lineup</a> and tap a \u2605 on any artist to build your personal set list. It\u2019s saved on this device, so it\u2019ll be here next time you visit.</div></div>';
      return;
    }

    function streamLinks(a) {
      var out = '';
      if (a.sp) out += '<a href="' + esc(a.sp) + '" class="stream-btn" target="_blank" rel="noopener noreferrer" aria-label="Listen on Spotify" title="Listen on Spotify"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg></a>';
      if (a.am) out += '<a href="' + esc(a.am) + '" class="stream-btn" target="_blank" rel="noopener noreferrer" aria-label="Listen on Apple Music" title="Listen on Apple Music"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726a10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393z"/></svg></a>';
      if (a.yt) out += '<a href="' + esc(a.yt) + '" class="stream-btn" target="_blank" rel="noopener noreferrer" aria-label="Listen on YouTube Music" title="Listen on YouTube Music"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"/></svg></a>';
      return out;
    }

    root.innerHTML = picks.map(function (a) {
      return '<div class="mylineup-row">' +
        '<span class="ml-day">' + DAY_LABEL[a.d] + '</span>' +
        '<span class="ml-name">' + esc(a.n) + '</span>' +
        '<span class="ml-genre">' + esc(a.g) + '</span>' +
        '<div class="streaming-links">' + streamLinks(a) + '</div>' +
        '<button class="star-toggle saved" data-name="' + esc(a.n) + '" aria-label="Remove ' + esc(a.n) + ' from your lineup" title="Remove from My Lineup">\u2605</button>' +
        '</div>';
    }).join('');
  }

  function showToast(msg) {
    var toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  var shareBtn = document.getElementById('share-lineup-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      if (typeof window.ARTISTS === 'undefined') return;
      var picks = window.ARTISTS.filter(function (a) { return saved.has(a.n); });
      if (!picks.length) { showToast('Star some artists first!'); return; }
      var text = 'My Lolla 2026 Lineup:\n' + picks.map(function (a) {
        return '\u2022 ' + a.n + ' (' + a.g + ', Day ' + a.d + ')';
      }).join('\n');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { showToast('Copied to clipboard!'); }).catch(function () { showToast('Copy failed \u2014 select the text manually.'); });
      } else {
        showToast('Copy not supported on this browser.');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    refreshStarButtons();
    updateCounters();
    renderMyLineupIfPresent();
  });
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    refreshStarButtons();
    updateCounters();
    renderMyLineupIfPresent();
  }
})();
