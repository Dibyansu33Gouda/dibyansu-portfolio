// ---------- shared SVG icon markup ----------
function iconSvg(name, className) {
  return '<svg class="icon ' + (className || '') + '" aria-hidden="true"><use href="assets/icons.svg#' + name + '"></use></svg>';
}

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
    if (btn) {
      var icon = t === 'light' ? 'sun' : 'moon';
      btn.innerHTML = iconSvg(icon, 'icon-theme icon-theme-' + icon) + '<span>' + (t === 'light' ? 'light' : 'dark') + '</span>';
      btn.setAttribute('aria-label', 'Switch to ' + (t === 'light' ? 'dark' : 'light') + ' theme');
      btn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
    }
  }
})();

// ---------- entry page: terminal boot sequence + automatic hand-off ----------
(function () {
  var shell = document.querySelector('.entry-shell');
  if (!shell) return;
  var boot = document.getElementById('entryBoot');
  var hint = document.getElementById('entryHint');
  var home = 'home.html';
  var hasLeft = false;
  document.body.classList.add('entry-ready');

  function enterPortfolio() {
    if (hasLeft) return;
    hasLeft = true;
    location.href = home;
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.altKey && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'A' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') enterPortfolio();
  });

  if (!boot) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lines = [
    { type: 'command', text: './open-portfolio' },
    { type: 'output', text: 'connecting to dibyansu@portfolio... established' },
    { type: 'command', text: 'cat profile.md' },
    { type: 'output', text: 'CSE student · NIST University · AI engineering' },
    { type: 'command', text: 'ls --inside' },
    { type: 'output', text: 'projects/  certifications/  skills/  contact/' }
  ];
  var TYPE_SPEED = reduced ? 0 : 28;
  var LINE_PAUSE = reduced ? 0 : 260;

  function typeLine(line, done) {
    var row = document.createElement('div');
    var text = document.createElement('span');
    text.className = line.type === 'command' ? 'entry-command' : 'entry-output';
    if (line.type === 'command') {
      var prompt = document.createElement('span');
      prompt.textContent = 'dibyansu@portfolio:~$';
      text.appendChild(prompt);
      text.appendChild(document.createTextNode(' '));
    }
    row.appendChild(text);
    boot.appendChild(row);
    var i = 0;
    function tick() {
      text.appendChild(document.createTextNode(line.text.charAt(i)));
      i++;
      if (i < line.text.length) setTimeout(tick, TYPE_SPEED);
      else setTimeout(done, LINE_PAUSE);
    }
    if (line.text.length) tick(); else done();
  }

  function typeName(done) {
    var title = document.getElementById('entry-title');
    if (!title) { done(); return; }
    var prefix = title.dataset.prefix || 'Hello, I’m ';
    var name = title.dataset.name || 'Dibyansu Gouda.';
    title.classList.add('is-visible');
    title.textContent = prefix;
    var accent = document.createElement('span');
    title.appendChild(accent);
    var i = 0;
    function tick() {
      accent.textContent += name.charAt(i);
      i++;
      if (i < name.length) setTimeout(tick, reduced ? 0 : 58);
      else setTimeout(done, reduced ? 0 : 420);
    }
    tick();
  }

  function revealRest() {
    var reveals = Array.prototype.slice.call(document.querySelectorAll('.entry-reveal')).filter(function (el) { return el.id !== 'entry-title'; });
    reveals.forEach(function (el, i) {
      setTimeout(function () { el.classList.add('is-visible'); }, i * (reduced ? 0 : 620));
    });
    var total = reveals.length * (reduced ? 0 : 620) + (reduced ? 1800 : 2300);
    setTimeout(function () {
      if (hint) hint.innerHTML = 'portfolio ready — entering now <span aria-hidden="true">·</span> <a href="' + home + '">enter now</a>';
    }, total - 500);
    setTimeout(enterPortfolio, total);
  }

  function runLine(index) {
    if (index < lines.length) typeLine(lines[index], function () { runLine(index + 1); });
    else typeName(revealRest);
  }
  runLine(0);
})();

// ---------- command palette (Ctrl/Cmd + K) ----------
(function () {
  var resumeUrl = 'https://drive.google.com/uc?export=download&id=1nmS7qcL4PreTP0PJkvtV2_1E-4wBlIZb';
  var commands = [
    { label: 'Go to home', hint: 'home.html', icon: 'home', run: function () { location.href = 'home.html'; } },
    { label: 'View projects', hint: 'projects.html', icon: 'projects', run: function () { location.href = 'projects.html'; } },
    { label: 'View certifications', hint: 'certifications.html', icon: 'certifications', run: function () { location.href = 'certifications.html'; } },
    { label: 'View skills', hint: 'skills.html', icon: 'skills', run: function () { location.href = 'skills.html'; } },
    { label: 'Contact Dibyansu', hint: 'contact.html', icon: 'contact', run: function () { location.href = 'contact.html'; } },
    { label: 'Download resume', hint: 'PDF', icon: 'external', run: function () { window.open(resumeUrl, '_blank', 'noopener'); } },
    { label: 'Open GitHub', hint: 'github.com', icon: 'external', run: function () { window.open('https://github.com/Dibyansu33Gouda', '_blank', 'noopener'); } }
  ];
  var active = 0;
  var filtered = commands;
  var palette = document.createElement('div');
  palette.className = 'command-palette';
  palette.innerHTML = '<div class="palette-dialog" role="dialog" aria-modal="true" aria-label="Command palette"><label class="palette-search"><span aria-hidden="true">$</span><input type="text" autocomplete="off" placeholder="type a command..." aria-label="Search commands"></label><div class="palette-results" role="listbox"></div><div class="palette-footer"><span><kbd>↑↓</kbd> navigate</span><span><kbd>Enter</kbd> select</span><span><kbd>Esc</kbd> close</span></div></div>';
  document.body.appendChild(palette);
  var input = palette.querySelector('input');
  var results = palette.querySelector('.palette-results');

  function render() {
    var query = input.value.trim().toLowerCase();
    filtered = commands.filter(function (command) { return command.label.toLowerCase().indexOf(query) !== -1 || command.hint.toLowerCase().indexOf(query) !== -1; });
    active = Math.min(active, Math.max(filtered.length - 1, 0));
    if (!filtered.length) { results.innerHTML = '<p class="palette-empty">command not found</p>'; return; }
    results.innerHTML = filtered.map(function (command, i) { return '<button type="button" class="palette-item" role="option" aria-selected="' + (i === active ? 'true' : 'false') + '" data-index="' + i + '">' + iconSvg(command.icon, '') + '<span>' + command.label + '</span><small>' + command.hint + '</small></button>'; }).join('');
  }
  function close() { palette.classList.remove('open'); }
  function open() { palette.classList.add('open'); input.value = ''; active = 0; render(); setTimeout(function () { input.focus(); }, 0); }
  function runActive() { if (filtered[active]) { close(); filtered[active].run(); } }

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.classList.contains('open') ? close() : open(); }
    else if (e.key === 'Escape' && palette.classList.contains('open')) close();
  });
  input.addEventListener('input', function () { active = 0; render(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, filtered.length - 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); runActive(); }
  });
  results.addEventListener('click', function (e) { var button = e.target.closest('.palette-item'); if (button) { active = Number(button.dataset.index); runActive(); } });
  palette.addEventListener('click', function (e) { if (e.target === palette) close(); });
})();

// ---------- mobile nav ----------
(function () {
  var toggle = document.getElementById('mobileNavToggle');
  var nav = document.getElementById('termnav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
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
      ? '<a href="' + p.source + '" target="_blank" rel="noopener">source' + iconSvg('external', 'icon-link icon-extlink') + '</a>'
      : '<a href="#" class="disabled">source \u2014 [ add repo link ]</a>';
    if (p.demo) links += '<a href="' + p.demo + '" target="_blank" rel="noopener">live demo' + iconSvg('external', 'icon-link icon-extlink') + '</a>';
    return '<div class="card reveal" data-delay="' + Math.min(i * 60, 300) + 'ms">' +
      '<div class="card-head"><span class="card-name">' + iconSvg('folder', 'icon-folder-tag icon-folder') + p.name + '/</span>' +
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
      ? '<a href="' + c.href + '" target="_blank" rel="noopener">view credential' + iconSvg('external', 'icon-link icon-extlink') + '</a>'
      : '<a href="#" class="disabled">view credential \u2014 [ add link ]</a>';
    var thumbUrl = c.thumb || driveThumb(c.href, 800);
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
  var runButton = document.getElementById('twRun');
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
      print('available: whoami, about, projects, certifications, skills, contact, resume, github, linkedin, theme, date, history, clear');
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
      window.open('https://drive.google.com/uc?export=download&id=1nmS7qcL4PreTP0PJkvtV2_1E-4wBlIZb', '_blank', 'noopener');
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
    history: function () {
      if (!cmdHistory.length) { print('no history yet.'); return; }
      print(cmdHistory.map(function (c, i) { return (i + 1) + '  ' + c; }).join('<br>'));
    },
    clear: function () { body.innerHTML = ''; },
    sudo: function () { print("Permission denied: you're not root here — nice try though."); }
  };

  // ---------- persistent command history (survives across visits) ----------
  var HISTORY_KEY = 'tw_history';
  var cmdHistory = [];
  try { cmdHistory = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch (e) { cmdHistory = []; }
  var historyIndex = cmdHistory.length;

  function saveHistory() {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(cmdHistory.slice(-50))); } catch (e) {}
  }

  input.addEventListener('input', function () {
    historyIndex = cmdHistory.length; // any manual typing resets browsing position
  });

  function runCommand() {
    var raw = input.value.trim();
    if (!raw) { input.focus(); return; }
    print('<span class="tw-prompt-inline">$</span> ' + raw.replace(/</g, '&lt;'), 'tw-cmdline');

    if (cmdHistory[cmdHistory.length - 1] !== raw) {
      cmdHistory.push(raw);
      saveHistory();
    }
    historyIndex = cmdHistory.length;

    var cmd = raw.toLowerCase();
    if (commands[cmd]) {
      commands[cmd]();
    } else {
      print('command not found: ' + raw.replace(/</g, '&lt;') + " — type <span class='tw-cmd'>help</span> for a list", 'tw-err');
    }
    input.value = '';
    input.focus();
  }

  // ---------- tab-completion ----------
  function tryComplete() {
    var partial = input.value.trim().toLowerCase();
    if (!partial) return;
    var names = Object.keys(commands);
    var matches = names.filter(function (n) { return n.indexOf(partial) === 0; });
    if (matches.length === 1) {
      input.value = matches[0];
    } else if (matches.length > 1) {
      print('<span class="tw-prompt-inline">$</span> ' + partial.replace(/</g, '&lt;'), 'tw-cmdline');
      print(matches.join('   '));
    }
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      tryComplete();
      return;
    }
    if (e.key === 'ArrowUp') {
      if (!cmdHistory.length) return;
      e.preventDefault();
      if (historyIndex > 0) historyIndex--;
      input.value = cmdHistory[historyIndex] || '';
      var len = input.value.length;
      input.setSelectionRange(len, len);
      return;
    }
    if (e.key === 'ArrowDown') {
      if (!cmdHistory.length) return;
      e.preventDefault();
      if (historyIndex < cmdHistory.length - 1) {
        historyIndex++;
        input.value = cmdHistory[historyIndex];
      } else {
        historyIndex = cmdHistory.length;
        input.value = '';
      }
      var len2 = input.value.length;
      input.setSelectionRange(len2, len2);
      return;
    }
  });
  if (runButton) runButton.addEventListener('click', runCommand);
})();

// ---------- cursor-tilt 3D effect on cards ----------
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduced || !canHover) return; // skip on touch devices and reduced-motion preference

  var MAX_TILT = 8; // degrees
  var attached = new WeakSet();

  function attachTilt(card) {
    if (attached.has(card)) return;
    attached.add(card);
    card.addEventListener('mousemove', function (e) {
      card.classList.add('tilting'); // instant tracking, no transition lag, while cursor is over the card
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      var rotateY = px * MAX_TILT * 2;
      var rotateX = -py * MAX_TILT * 2;
      card.style.transform = 'perspective(700px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-4px)';
      card.style.setProperty('--glow-x', (50 + px * 60) + '%');
      card.style.setProperty('--glow-y', (50 + py * 60) + '%');
    });
    card.addEventListener('mouseleave', function () {
      card.classList.remove('tilting'); // re-enable the transition so it glides back smoothly
      card.style.transform = '';
      card.style.removeProperty('--glow-x');
      card.style.removeProperty('--glow-y');
    });
  }

  function attachAll() {
    document.querySelectorAll('.card').forEach(attachTilt);
  }
  attachAll();

  // projects.html / certifications.html render cards after this script runs — watch for that
  var root = document.getElementById('cards-root');
  if (root) {
    new MutationObserver(attachAll).observe(root, { childList: true });
  }
})();

// ---------- konami code easter egg ----------
(function () {
  var seq = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  var buffer = [];
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('keydown', function (e) {
    if (e.repeat) return; // ignore held-key auto-repeat, only count distinct presses
    var key = e.key.toLowerCase();
    buffer.push(key);
    if (buffer.length > seq.length) buffer.shift();
    if (buffer.length === seq.length && buffer.every(function (k, i) { return k === seq[i]; })) {
      triggerKonami();
      buffer = [];
    }
  });

  function triggerKonami() {
    if (reduced) {
      showToast('\u2191\u2191\u2193\u2193\u2190\u2192\u2190\u2192BA \u2014 cheat code accepted.');
      return;
    }
    showToast('\u2191\u2191\u2193\u2193\u2190\u2192\u2190\u2192BA \u2014 cheat code accepted. Engaging cheat mode\u2026');
    var prevTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'cheat');
    setTimeout(function () {
      if (prevTheme) {
        document.documentElement.setAttribute('data-theme', prevTheme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }, 4000);
  }

  function showToast(msg) {
    var existing = document.getElementById('konamiToast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'konamiToast';
    toast.className = 'konami-toast';
    toast.setAttribute('role', 'status');
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('show'); });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 400);
    }, 4200);
  }
})();

// ---------- counted-up hero stats (one-shot, not tied to bidirectional reveal) ----------
(function () {
  var root = document.getElementById('statReadout');
  if (!root) return;
  var nums = root.querySelectorAll('.stat-num');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setFinal() {
    nums.forEach(function (el) { el.textContent = String(el.dataset.target).padStart(2, '0'); });
  }

  if (reduced || !('IntersectionObserver' in window)) { setFinal(); return; }

  function animateCount(el) {
    var target = parseInt(el.dataset.target, 10) || 0;
    var duration = 900;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(eased * target)).padStart(2, '0');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        nums.forEach(animateCount);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  io.observe(root);
})();

// ---------- footer last-updated date ----------
(function () {
  var f = document.querySelector('[data-footer-date]');
  if (!f) return;
  f.textContent = 'built by dibyansu — last updated ' +
    new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
})();