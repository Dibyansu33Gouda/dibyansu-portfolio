# Portfolio v2 — terminal / dual-theme

Plain static HTML/CSS/JS, no build step — deploys to GitHub Pages the same way
your current pixel-parade-311 site does.

## Structure
```
index.html            → home (about only: intro, photo, resume)
projects.html          → project cards (text-first, no thumbnails)
certifications.html    → certification cards
skills.html             → skills grouped by category
contact.html            → contact details + form
style.css                → both themes live here (dark = terminal, light = Anthropic-style ivory)
script.js                → theme toggle, mobile nav, typed prompt, footer date
assets/                   → drop your real files here (see below)
```

## Before you publish — fill these in

1. **Photo** — save a square photo (500×500+) as `assets/photo.jpg`, then in
   `index.html` swap the placeholder div for:
   ```html
   <div class="photo-slot"><img src="assets/photo.jpg" alt="Dibyansu Gouda"></div>
   ```
2. **Resume** — drop your PDF at `assets/Dibyansu_Gouda_Resume.pdf` (the download
   button on the home page already points there).
3. **Project links** — `projects.html` has `[ add repo link ]` / `[ add deployed URL ]`
   placeholders for the CareerCompass AI live demo, the FIFA analysis repo, and the
   Snake game / Calculator repos. Replace the `href="#"` and remove `class="disabled"`.
4. **Certification credential links** — same pattern in `certifications.html`.
   If a certificate is only a PDF (no public verification URL), drop the PDF in
   `assets/certs/` and link to that instead.
5. **Contact form** — the form in `contact.html` is UI-only right now; a static
   page can't send email by itself. Wire it to something like
   [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com)
   (both have a free tier — just add their `action` URL and a hidden field),
   or point it at a small serverless function if you'd rather not depend on a
   third party.

## Deploying
Same as your current site: push this folder to a repo, enable GitHub Pages
(Settings → Pages → Deploy from a branch, or keep your existing GitHub Actions
workflow if you'd rather build/lint before deploy — there's nothing to build
here, so a plain "checkout + deploy" action is enough).

## Design notes
- **Dark theme** matches the terminal reference exactly: near-black background,
  amber/teal accents, JetBrains Mono + IBM Plex Sans.
- **Light theme** follows Anthropic's public site direction: warm ivory
  background (#FAF9F5), near-black slate text (#141413), clay/terracotta accent,
  serif (Lora) for body and display type. Toggle with the `[ dark ]` / `[ light ]`
  button in the top bar — the choice is remembered on return visits.
- No gradient/pastel placeholder blocks anywhere — project and certification
  cards are text-first (matching the reference site's pattern), and the only
  image slot on the whole site is your actual photo on the home page.
