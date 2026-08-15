# Dibyansu Gouda — Portfolio

A personal developer portfolio with a terminal/CLI aesthetic — built as a
plain static site (HTML/CSS/JS, zero dependencies, no build step) and
deployed on GitHub Pages.

**Live:** https://dibyansu33gouda.github.io/dibyansu-portfolio/

## Why no framework

Every visual effect on this site — dual themes, live data, animations, a
working command palette — is built with plain HTML/CSS/JS on purpose. No
React, no Vite, no `npm install`, nothing to update or break. It loads
instantly, every line is readable, and it avoids the exact stack most
AI website-builders default to.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Boot-sequence entry gate — a terminal splash screen with status LEDs and a typed boot log, then auto-redirects into `home.html` |
| `home.html` | About/intro, photo, resume link, counted-up stats, the interactive terminal |
| `projects.html` | Data-driven project cards |
| `certifications.html` | Data-driven certification cards, real self-hosted PDFs + generated thumbnails |
| `skills.html` | Skills grouped by how they're actually used, "currently learning," live GitHub activity graph |
| `dsa-progress.html` | DSA practice tracker — LeetCode-style heatmap, streaks, driven by real commit data |
| `contact.html` | Contact info + a working form (Formspree) |
| `thankyou.html` | Post-submit confirmation with an auto-redirect countdown |
| `404.html` | Custom not-found page, styled to match |

## Design system

- **Dual theme** — dark (near-black terminal, amber/teal accents, JetBrains
  Mono) and light (warm ivory, clay/terracotta accent, serif type). New
  visitors get whichever matches their OS preference automatically; a manual
  toggle click is remembered from then on.
- **Custom SVG icon set** — a hand-built sprite sheet (`assets/icons.svg`),
  each icon a distinct color drawn from a curated terminal-inspired palette,
  used via `<use href="assets/icons.svg#name">` throughout the nav and links.
- **Ambient glow + ANSI-inspired accents** shared across cards, the
  terminal widget, and the contact box.

## Interactive terminal (home page)

A real command dispatcher, not a decorative typing animation:

- `help`, `whoami`, `about`, `projects`, `certifications`, `skills`,
  `contact`, `resume`, `github`, `linkedin`, `theme`, `date`, `history`,
  `clear`, and a `sudo` easter egg
- **Tab-completion** — partial input + Tab autocompletes, or lists matches
- **Persistent history** — ↑/↓ recall past commands, saved across visits via
  `localStorage`
- A tap-friendly "run ↵" button for mobile, since not all mobile keyboards
  expose a reliable Enter key

## Command palette (Ctrl/Cmd + K)

A full keyboard-driven command palette — search, arrow-key navigation,
Enter to select, Esc to close — available from any page, in the same spirit
as VS Code / Linear / Raycast.

## DSA tracker

- **LeetCode-style heatmap** — 12 independent month blocks (not one
  continuous GitHub-style grid), each padded to align to real weekdays
- Current streak / longest streak / total solved, computed from real commit
  history in the [`DSA_practice_Dib`](https://github.com/Dibyansu33Gouda/DSA_practice_Dib)
  repo
- Click any active day to see exactly which problems were solved
- **Live client-side fetch**, cached 45 minutes in `localStorage` to avoid
  hitting GitHub's unauthenticated rate limit on repeat visits
- **Scheduled snapshot workflow** (`.github/workflows/dsa-snapshot.yml` +
  `scripts/build-dsa-snapshot.js`) — runs daily with an authenticated token,
  writing a real, current fallback into `data/dsa-progress.json` instead of
  a zeroed stub

## Data-driven content

Projects and certifications are plain JS arrays of objects, rendered by a
shared function — adding a new entry is "add one object," not hand-writing
HTML. Certification thumbnails are real first-page renders of the actual
uploaded PDFs (generated once via `pdftoppm`, not AI-generated or stock
images).

## AI chatbot

A floating assistant, available on every page, that answers questions about
Dibyansu directly and can redirect visitors to the relevant page:

- **Frontend** — vanilla JS widget in `script.js`, no framework, matches the
  site's zero-dependency philosophy
- **Backend** — separate FastAPI service (`chatbot-backend/`), deployed on
  Render, calling the Gemini API (`gemini-flash-latest`)
- **Conversation memory** — chat history persists across page navigation
  within a session via `sessionStorage`, and full history is sent with each
  request so Gemini has actual multi-turn context, not just the latest message
- **Page-aware redirects** — the model can respond with a
  `[REDIRECT: page.html]` directive, which the frontend catches and
  navigates to automatically (e.g. asking about certifications sends you
  straight to `certifications.html`)
- API key lives server-side only (Render environment variable), never
  exposed to the client

## Animation, done deliberately

Every animation here is either functional or reacts to something real —
no decoration for its own sake:

- **Bidirectional scroll reveal** — content fades in and back out as you
  scroll past it, staggered on card lists (exit has no stagger delay, so
  scrolling back up never feels laggy)
- **Cursor-tilt 3D cards** — cards tilt toward the mouse in real time, glow
  shifts with them, snaps back smoothly on mouseleave
- **GPU-based depth parallax** — a `position: fixed` + `transform`-animated
  background layer, not `background-attachment: fixed` (a known scroll-jank
  source, deliberately avoided)
- **Native View Transitions** — smooth cross-page fades on navigation in
  supporting browsers, silently falls back to a normal navigation elsewhere
- **Counted-up hero stats** — numbers animate from 0 once, the first time
  they scroll into view, not every time
- Everything above respects `prefers-reduced-motion`

## Easter egg

The Konami code (↑ ↑ ↓ ↓ ← → ← → B A), typed anywhere on the site, briefly
flips the whole page into a neon-green CRT-terminal theme before reverting
to whatever theme you were actually using.

## Accessibility

Skip-to-content link, a real `<main>` landmark, labeled nav, `aria-expanded`
on the mobile menu toggle, `aria-pressed` on the theme toggle, `aria-live`
regions on dynamic content (DSA day-detail, terminal output), full keyboard
navigation, and visible focus states throughout.

## SEO

Unique, human-written meta description per page, Open Graph + Twitter card
tags with a real generated preview image, canonical URLs, `robots.txt` +
`sitemap.xml`, and a custom 404 — not the host's default blank page.

## Contact form

Submits via JavaScript to Formspree, redirects to a proper thank-you page
with a countdown back home — not a blank success page or a silent failure.

## Deployment

- **Frontend** — GitHub Pages, deploying directly from the `main` branch
  (no build step, the static files are the deployed output)
- **Chatbot backend** — FastAPI service on Render's free tier, auto-deploys
  on push to `main`. Note: free tier spins down after ~15 min idle, so the
  first chatbot message after inactivity may take 30-60s to respond
