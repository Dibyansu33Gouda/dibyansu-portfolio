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

// ---------- reveal-on-scroll (fades in AND back out as you scroll past) ----------
function observeReveals() {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('revealed'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var el = entry.target;
      if (entry.isIntersecting) {
        el.style.transitionDelay = el.dataset.delay || '0ms';
        el.classList.add('revealed');
      } else {
        el.style.transitionDelay = '0ms'; // no stagger on the way out — exits should feel instant
        el.classList.remove('revealed');
      }
    });
  }, { threshold: 0.12, rootMargin: '-30px 0px -30px 0px' });
  els.forEach(function (e) { io.observe(e); });
}
document.addEventListener('DOMContentLoaded', observeReveals);

// ---------- data-driven project cards ----------
// Each page defines its own PROJECTS array in an inline <script> before this file loads.
function renderProjects(items) {
  var root = document.getElementById('cards-root');
  if (!root || !items) return;
  var pillClass = { live: 'pill-live', progress: 'pill-progress', complete: 'pill-done' };
  root.innerHTML = items.map(function (p, i) {
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
    return '<div class="card reveal" data-delay="' + Math.min(i * 60, 300) + 'ms">' +
      '<div class="card-head"><span class="card-name">' + p.name + '/</span>' +
      '<span class="pill ' + (pillClass[p.status] || 'pill-done') + '">' + p.status + '</span></div>' +
      '<div class="card-body"><p class="card-desc">' + p.desc + '</p>' + log +
      '<div class="chip-row">' + chips + '</div>' +
      '<div class="card-links">' + links + '</div></div></div>';
  }).join('');
  observeReveals();
}

// ---------- data-driven certification cards ----------
function driveThumb(href, size) {
  if (!href) return null;
  var m = href.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!m) return null;
  return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w' + (size || 800);
}
function renderCerts(items) {
  var root = document.getElementById('cards-root');
  if (!root || !items) return;
  root.innerHTML = items.map(function (c, i) {
    var link = c.href
      ? '<a href="' + c.href + '" target="_blank" rel="noopener">view credential \u2197</a>'
      : '<a href="#" class="disabled">view credential \u2014 [ add link ]</a>';
    var thumbUrl = driveThumb(c.href, 800);
    var thumb = thumbUrl
      ? '<div class="cert-thumb"><img src="' + thumbUrl + '" alt="' + c.name + ' — first page preview" loading="lazy" onerror="this.closest(\'.cert-thumb\').remove()"></div>'
      : '';
    return '<div class="card reveal" data-delay="' + Math.min(i * 60, 300) + 'ms">' + thumb +
      '<div class="card-head"><span class="card-name">' + c.name + '</span>' +
      '<span class="pill ' + (c.pillClass || 'pill-done') + '">' + c.status + '</span></div>' +
      '<div class="card-body"><p class="card-desc">' + c.desc + '</p>' +
      '<div class="card-links">' + link + '</div></div></div>';
  }).join('');
  observeReveals();
}
// ---------- functional terminal widget (home page) ----------
(function () {
  var input = document.getElementById('twInput');
  var body = document.getElementById('twBody');
  if (!input || !body) return;

  function print(html, cls) {
    var div = document.createElement('div');
    div.className = 'tw-line ' + (cls || 'tw-out');
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function go(url, label) {
    print('opening ' + label + '...');
    setTimeout(function () { location.href = url; }, 350);
  }

  var commands = {
    help: function () {
      print('available: whoami, about, projects, certifications, skills, contact, resume, github, linkedin, theme, date, clear');
    },
    whoami: function () {
      print('B.Tech CSE student at NIST University, building in Python, AI, and full-stack web. Currently 3rd semester.');
    },
    about: function () {
      var el = document.getElementById('about');
      if (el) { print('scrolling to about...'); el.scrollIntoView({ behavior: 'smooth' }); }
    },
    projects: function () { go('projects.html', 'projects'); },
    certifications: function () { go('certifications.html', 'certifications'); },
    certs: function () { commands.certifications(); },
    skills: function () { go('skills.html', 'skills'); },
    contact: function () { go('contact.html', 'contact'); },
    home: function () { print('already home.'); },
    resume: function () {
      print('opening resume...');
      window.open('https://drive.google.com/file/d/1nmS7qcL4PreTP0PJkvtV2_1E-4wBlIZb/view?usp=drive_link', '_blank');
    },
    github: function () {
      print('opening github...');
      window.open('https://github.com/Dibyansu33Gouda', '_blank');
    },
    linkedin: function () {
      print('opening linkedin...');
      window.open('https://www.linkedin.com/in/dibyansu-gouda-b5b432379/', '_blank');
    },
    theme: function () {
      if (typeof toggleTheme === 'function') toggleTheme();
      print('theme switched.');
    },
    date: function () { print(new Date().toString()); },
    clear: function () { body.innerHTML = ''; },
    sudo: function () { print("Permission denied: you're not root here — nice try though."); }
  };

  input.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var raw = input.value.trim();
    if (!raw) return;
    print('<span class="tw-prompt-inline">$</span> ' + raw.replace(/</g, '&lt;'), 'tw-cmdline');
    var cmd = raw.toLowerCase();
    if (commands[cmd]) {
      commands[cmd]();
    } else {
      print('command not found: ' + raw.replace(/</g, '&lt;') + " — type <span class='tw-cmd'>help</span> for a list", 'tw-err');
    }
    input.value = '';
  });
})();

// ---------- footer last-updated date ----------
(function () {
  var f = document.querySelector('[data-footer-date]');
  if (!f) return;
  f.textContent = 'built by dibyansu — last updated ' +
    new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
})();