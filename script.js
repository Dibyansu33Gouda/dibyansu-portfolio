// ---------- theme (persisted, defaults to dark) ----------
(function () {
  var stored = null;
  try { stored = localStorage.getItem('theme'); } catch (e) {}
  var theme = stored || 'dark';
  applyTheme(theme);

  window.toggleTheme = function () {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  };

  function applyTheme(t) {
    if (t === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    var btn = document.getElementById('themeToggleBtn');
    if (btn) btn.textContent = t === 'light' ? '[ light ]' : '[ dark ]';
  }
})();

// ---------- mobile nav ----------
(function () {
  var toggle = document.getElementById('mobileNavToggle');
  var nav = document.getElementById('termnav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
  });
})();

// ---------- typed hero prompt (index page only) — loops: type, pause, delete, pause ----------
(function () {
  var el = document.getElementById('typed');
  if (!el) return;
  var text = el.getAttribute('data-text') || 'whoami';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { el.textContent = text; return; }

  var TYPE_SPEED = 90;
  var DELETE_SPEED = 55;
  var PAUSE_AFTER_TYPE = 1400;
  var PAUSE_AFTER_DELETE = 500;

  var i = 0;
  var deleting = false;

  function tick() {
    if (!deleting) {
      el.textContent = text.slice(0, i);
      if (i < text.length) {
        i++;
        setTimeout(tick, TYPE_SPEED);
      } else {
        deleting = true;
        setTimeout(tick, PAUSE_AFTER_TYPE);
      }
    } else {
      el.textContent = text.slice(0, i);
      if (i > 0) {
        i--;
        setTimeout(tick, DELETE_SPEED);
      } else {
        deleting = false;
        setTimeout(tick, PAUSE_AFTER_DELETE);
      }
    }
  }
  tick();
})();

// ---------- reveal-on-scroll ----------
function observeReveals() {
  var els = document.querySelectorAll('.reveal:not(.revealed)');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('revealed'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(function (e) { io.observe(e); });
}
document.addEventListener('DOMContentLoaded', observeReveals);

// ---------- data-driven project cards ----------
// Each page defines its own PROJECTS array in an inline <script> before this file loads.
function renderProjects(items) {
  var root = document.getElementById('cards-root');
  if (!root || !items) return;
  var pillClass = { live: 'pill-live', progress: 'pill-progress', complete: 'pill-done' };
  root.innerHTML = items.map(function (p) {
    var log = '';
    if (p.log && p.log.length) {
      log = '<div class="card-log">' + p.log.map(function (l) {
        var isMinus = l.charAt(0) === '-';
        var cls = isMinus ? 'minus' : 'plus';
        var sym = isMinus ? '\u2212' : '+';
        var text = isMinus ? l.slice(1).trim() : l.replace(/^\+/, '').trim();
        return '<span class="l"><span class="' + cls + '">' + sym + '</span> ' + text + '</span>';
      }).join('') + '</div>';
    }
    var chips = (p.tags || []).map(function (t) { return '<span class="chip">' + t + '</span>'; }).join('');
    var links = '';
    links += p.source
      ? '<a href="' + p.source + '" target="_blank" rel="noopener">source \u2197</a>'
      : '<a href="#" class="disabled">source \u2014 [ add repo link ]</a>';
    if (p.demo) links += '<a href="' + p.demo + '" target="_blank" rel="noopener">live demo \u2197</a>';
    return '<div class="card reveal">' +
      '<div class="card-head"><span class="card-name">' + p.name + '/</span>' +
      '<span class="pill ' + (pillClass[p.status] || 'pill-done') + '">' + p.status + '</span></div>' +
      '<div class="card-body"><p class="card-desc">' + p.desc + '</p>' + log +
      '<div class="chip-row">' + chips + '</div>' +
      '<div class="card-links">' + links + '</div></div></div>';
  }).join('');
  observeReveals();
}

// ---------- data-driven certification cards ----------
function renderCerts(items) {
  var root = document.getElementById('cards-root');
  if (!root || !items) return;
  root.innerHTML = items.map(function (c) {
    var link = c.href
      ? '<a href="' + c.href + '" target="_blank" rel="noopener">view credential \u2197</a>'
      : '<a href="#" class="disabled">view credential \u2014 [ add link ]</a>';
    return '<div class="card reveal">' +
      '<div class="card-head"><span class="card-name">' + c.name + '</span>' +
      '<span class="pill ' + (c.pillClass || 'pill-done') + '">' + c.status + '</span></div>' +
      '<div class="card-body"><p class="card-desc">' + c.desc + '</p>' +
      '<div class="card-links">' + link + '</div></div></div>';
  }).join('');
  observeReveals();
}
// ---------- footer last-updated date ----------
(function () {
  if (!f) return;
  f.textContent = 'built by dibyansu — last updated ' +
    new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
})();