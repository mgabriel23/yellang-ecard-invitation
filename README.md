# Szhawn Marq's 1st Birthday & Christening

Static single-page e-card. No backend, no build step required for dev.

## Structure

- `index.html` — markup only
- `css/main.css` — custom components + reduced-motion safety net
- `js/main.js` — page behaviour (envelope gate, audio, countdown, calendar, reveals, floating RSVP pill)
- `js/rsvp.js` — RSVP form submission (Web3Forms / Formspree, with retry + `mailto:` fallback)
- `robots.txt` — keeps the invite out of search engines
- `.nojekyll` — required for GitHub Pages (empty file)
- `assets/img/szhawn.jpg` — hero photo (you provide)
- `assets/img/og-preview.jpg` — 1200×630 social preview (you provide)
- `assets/audio/lullaby.mp3` — background music (you provide; or keep the Pixabay hotlink for now)

## Local preview

`index.html` opens directly in a browser, but the RSVP POST to Web3Forms is
most reliable when served over HTTP. Use:

```sh
python3 -m http.server 8000
# visit http://localhost:8000
```
