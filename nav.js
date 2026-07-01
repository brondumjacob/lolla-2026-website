// nav.js — shared navigation logic for all pages
(function () {
  'use strict';

  // ── Hamburger menu ──────────────────────────────────────────────────────
  var btn = document.querySelector('.hamburger-btn');
  var links = document.querySelector('.nav-links');
  var nav = document.querySelector('.site-nav');

  if (btn && links && nav) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = links.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        links.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        links.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close when a nav link is clicked (mobile)
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── Editorial collapse (index.html only) ────────────────────────────────
  var toggleBtn = document.querySelector('.editorial-toggle');
  var editorialBody = document.querySelector('.editorial-body');

  if (toggleBtn && editorialBody) {
    toggleBtn.addEventListener('click', function () {
      var expanded = editorialBody.classList.toggle('expanded');
      toggleBtn.textContent = expanded ? 'READ LESS ▴' : 'READ MORE ▾';
      toggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }
})();
