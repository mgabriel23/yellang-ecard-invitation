# Szhawn Marq's 1st Birthday & Christening

Static single-page e-card. No backend, no build step required for dev.

## Structure

- `index.html` — markup only
- `css/main.css` — custom components + reduced-motion safety net
- `js/main.js` — all behaviour
- `assets/img/szhawn.jpg` — hero photo (you provide)
- `assets/img/og-preview.jpg` — 1200×630 social preview (you provide)
- `assets/audio/lullaby.mp3` — background music (you provide; or keep the Pixabay hotlink for now)

## Local preview

Because `js/main.js` is a deferred script (no CORS needed), you can just open `index.html`.
For a more faithful GH Pages preview:

```sh
python3 -m http.server 8000
# visit http://localhost:8000
```
