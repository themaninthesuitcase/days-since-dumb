# Copilot Instructions — days-since-dumb

## Project overview

A single-page React app styled as a retro 50s diner sign that displays "Days Since My Last Dumb" as two 7-segment light-bulb digits. The counter is shared across all viewers and backed by Cloudflare Workers KV. A password-protected admin button lets an authorised user reset the counter to zero.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite (plain JSX, no TypeScript) |
| Hosting | Cloudflare Pages (static) |
| API | Cloudflare Pages Functions (`/functions/api/`) |
| Shared state | Cloudflare Workers KV (`COUNTER_KV` binding) |
| Auth | Single admin password stored as a Cloudflare Pages secret (`ADMIN_PASSWORD`) |
| Fonts | Google Fonts — "Rye" (headings/buttons), "Special Elite" (body/labels) |

## Code conventions

- **Plain JSX, no TypeScript.** Do not add `.ts`/`.tsx` files or type annotations.
- **No build-time environment variables.** All secrets live in Cloudflare Pages secrets, accessed via `env.*` inside Functions only — never exposed to the client bundle.
- **Functional components only.** No class components.
- **CSS Modules are not used.** Styles live in `src/App.css` (component styles) and `src/index.css` (global reset). Add new rules to those files rather than creating new stylesheets, unless adding a genuinely independent component.
- **No third-party UI libraries.** Keep the dependency footprint minimal.
- **No router.** This is a single-page app with no client-side routing.

## Visual design — DO NOT break these

- **Colour palette:** backgrounds are near-black warm browns (`#0a0200`, `#130800`, `#1f0e03`). Accent colours are ambers and oranges (`#ffcc40`, `#ff7700`, `#3e1c00`). Do not introduce cool blues, greens, or greys.
- **Fonts:** use `'Rye', serif` for display text and `'Special Elite', serif` for secondary/label text. Do not add other fonts.
- **Bulb digits:** the `BulbDigit` component renders a 7-segment display as SVG circles. Each bulb has a socket recess, radial-gradient fill (lit = warm white→amber, unlit = near-black brown), glow filter, and specular highlight. Do not replace this with a canvas, image, or CSS-only approach.
- **Marquee border:** the animated chase border is built from individual `<span>` elements positioned absolutely around the sign panel. The animation uses a CSS `@keyframes marquee-chase` with staggered `animationDelay`. Preserve this mechanism.
- **Sign dimensions:** the sign panel is fixed at `680 × 460 px` and scales via `transform: scale()` at smaller viewports. Do not switch to a fluid/percentage layout.

## API — `/functions/api/`

- `counter.js` — `onRequestGet`: reads `resetDate` from KV, calculates elapsed days, auto-initialises on first call. **Public — no auth.**
- `reset.js` — `onRequestPost`: validates `password` from the JSON body against `env.ADMIN_PASSWORD`, writes the current ISO timestamp to KV. **Returns 401 on wrong/missing password.** Never log or echo the password back.
- Do not add additional API endpoints without a clear requirement.
- Always return `Response.json(...)` — do not return plain text.

## Security notes

- The admin button (`🔒`) is intentionally low-visibility (opacity 0.35, no accessible label text visible in normal use). Do not increase its prominence, rename it to something descriptive, or add it to the main visual layout.
- Password comparison in `reset.js` is synchronous string equality — acceptable for a low-traffic hobby project. Do not introduce JWT, sessions, or OAuth unless explicitly asked.
- Never embed `ADMIN_PASSWORD` in client-side code, environment files committed to the repo, or comments.

## Testing & running locally

```bash
# Install
npm install

# Vite dev server (port 5173)
npm run dev

# Full Pages dev (Vite + Functions + KV) — run alongside npm run dev
npm run pages:dev   # → http://localhost:8788
```

KV namespace IDs must be set in `wrangler.toml` before `pages:dev` will work. See README.md for setup steps.
