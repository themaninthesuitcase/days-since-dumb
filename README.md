# Days Since My Last Dumb

A 50s diner-sign style React app that tracks days since a shared event — with an animated marquee border, 7-segment light-bulb digit displays, and a password-protected reset button.

## Stack & cost

| Layer | Service | Cost |
|---|---|---|
| Frontend hosting | Cloudflare Pages | Free |
| Serverless API | Cloudflare Pages Functions | Free |
| Shared counter storage | Cloudflare Workers KV | Free (100k reads / 1k writes per day) |

All viewers see the same counter. The reset date is stored in KV; days are calculated client-side from that timestamp.

---

## Local development

### Prerequisites

- Node.js 18+
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)

### 1 — Install dependencies

```bash
cd days-since-dumb
npm install
```

### 2 — Create a KV namespace

```bash
# Production namespace
npx wrangler kv namespace create COUNTER_KV

# Preview namespace (used by local dev server)
npx wrangler kv namespace create COUNTER_KV --preview
```

Each command prints an `id`. Paste both into `wrangler.toml`:

```toml
[[kv_namespaces]]
binding    = "COUNTER_KV"
id         = "<production id>"
preview_id = "<preview id>"
```

### 3 — Run the dev server

You need two terminals:

**Terminal 1** — Vite (React hot-reload):
```bash
npm run dev
```

**Terminal 2** — Cloudflare Pages (serves the API functions + proxies to Vite):
```bash
npm run pages:dev
```

Open **http://localhost:8788** in your browser. The Vite hot-reload still works through the Pages proxy.

> The counter initialises itself on the first API call, so you'll see "0 days" immediately.

---

## Deployment

### 1 — Push to GitHub

Create a repo and push the project. Cloudflare Pages builds from Git.

### 2 — Create a Pages project

1. Go to **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**
2. Select your repo, set:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Click **Save and deploy**

### 3 — Attach the KV namespace

In your Pages project: **Settings → Functions → KV namespace bindings**

Add a binding:
- Variable name: `COUNTER_KV`
- KV namespace: select the one you created earlier

### 4 — Set the admin password

```bash
npx wrangler pages secret put ADMIN_PASSWORD
```

Enter your chosen password when prompted. This is stored encrypted in Cloudflare and injected as `env.ADMIN_PASSWORD` at runtime — it is never exposed in the source code or build output.

### 5 — Redeploy

Trigger a new deployment (or push a commit) to pick up the KV binding and secret.

---

## Resetting the counter

1. Open the app
2. Click the 🔒 button in the bottom-right corner
3. Enter the admin password
4. The counter resets to **0** for all viewers immediately

---

## Project structure

```
days-since-dumb/
├── functions/
│   └── api/
│       ├── counter.js      ← GET  /api/counter  (public)
│       └── reset.js        ← POST /api/reset    (password protected)
├── src/
│   ├── components/
│   │   ├── BulbDigit.jsx   ← SVG 7-segment light-bulb digit
│   │   └── AdminModal.jsx  ← Password modal
│   ├── App.jsx             ← Sign layout + marquee border
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── wrangler.toml
```
