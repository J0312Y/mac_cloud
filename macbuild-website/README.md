# MacBuild Cloud — Public Website

A production-grade React + TailwindCSS public website for the Mac Build Cloud iOS CI/CD platform. Connects seamlessly to the existing dashboard and backend.

---

## Architecture

```
www.macbuild.cloud          → This website (port 3000)
app.macbuild.cloud          → React dashboard (port 5173)
api.macbuild.cloud          → Node.js API (port 3001)
```

**User flow:**
```
Landing page → Register (picks plan) → Dashboard
Landing page → Login → Dashboard
```

---

## Pages

| Route       | Component          | Description                                    |
|-------------|-------------------|------------------------------------------------|
| `/`         | `Landing.jsx`     | Full marketing page — hero, features, pricing, FAQ |
| `/login`    | `Login.jsx`       | Split-screen login with terminal animation     |
| `/register` | `Register.jsx`    | Account creation with live plan selector       |
| `*`         | 404 inline        | 404 page                                       |

---

## File structure

```
macbuild-website/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env
├── package.json
└── src/
    ├── main.jsx               Entry point
    ├── App.jsx                Router with layouts
    ├── styles/
    │   └── globals.css        Design tokens + utilities
    ├── lib/
    │   └── api.js             API client (auth, pub, user)
    ├── hooks/
    │   └── index.js           useReveal, useCountUp, usePlans, useTypewriter, useToast
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.jsx     Sticky transparent→glass nav
    │   │   └── Footer.jsx     Full footer with links
    │   ├── sections/
    │   │   ├── Hero.jsx       Hero + live terminal + stats counter + integration ticker
    │   │   ├── Features.jsx   6-card features grid + metrics panel
    │   │   ├── HowItWorks.jsx 3-step process
    │   │   ├── Pricing.jsx    Dynamic plans from API + billing toggle
    │   │   └── FAQCTA.jsx     Accordion FAQ + CTA section
    │   └── ui/
    │       └── Toasts.jsx     Notification toasts
    └── pages/
        ├── Landing.jsx        Assembles all sections
        ├── Login.jsx          Auth page with terminal visual
        └── Register.jsx       Registration + plan chooser
```

---

## Design System

**Fonts:**
- `Syne` — display/headings (bold, tight tracking)
- `DM Sans` — body text (matches the existing dashboard)
- `JetBrains Mono` — code, terminal, metrics

**Colors** (match dashboard exactly):
- Background: `#090710`
- Card: `#100e1c`
- Accent: `#06b6d4` (cyan — same as dashboard client theme)
- Text: `#e2e8f0`
- Subtext: `#94a3b8`

**Key utilities** (in `globals.css`):
- `.glass` — frosted glass card
- `.text-grad` — white → cyan → indigo gradient text
- `.text-grad-cyan` — cyan → indigo
- `.bg-grid` — subtle CSS grid lines background
- `.glow-cyan` — cyan box-shadow glow
- `.card-lift` — hover lift animation
- `.reveal` + `.reveal.in` — scroll-triggered fade-up
- `.btn-primary` / `.btn-ghost` — button styles
- `.field` — form input style
- `.badge-*` — color badge variants
- `.beam-line` — animated horizontal light beam

---

## Setup & Run

```bash
cd macbuild-website
npm install
npm run dev       # → http://localhost:3000
npm run build     # production build → dist/
```

### Environment variables (`.env`)
```env
VITE_API_URL=http://213.156.133.182:3001/api
VITE_DASHBOARD_URL=http://localhost:5173
```

For production:
```env
VITE_API_URL=https://api.macbuild.cloud/api
VITE_DASHBOARD_URL=https://app.macbuild.cloud
```

---

## Backend integration

### APIs consumed by this website

| Endpoint                 | Used by          | Description                        |
|--------------------------|------------------|------------------------------------|
| `POST /api/auth/login`   | Login page       | Authenticate, receive JWT          |
| `POST /api/auth/register`| Register page    | Create account with plan           |
| `GET  /api/auth/me`      | App startup      | Restore session                    |
| `GET  /api/public/plans` | Pricing section  | Live plan data (no auth required)  |
| `GET  /api/public/stats` | Hero stats       | Live build counts (no auth)        |

### After login / register
The JWT token is saved in `localStorage` as `mbc_token`.  
The user is redirected to `VITE_DASHBOARD_URL`.  
The dashboard's `App.jsx` picks up `mbc_token` on load and restores the session automatically.

---

## Nginx subdomain config (production)

```nginx
# www.macbuild.cloud → static website
server {
    listen 80;
    server_name macbuild.cloud www.macbuild.cloud;
    root /var/www/macbuild-website/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location ~* \.(js|css|woff2|png|svg)$ { expires 1y; add_header Cache-Control "public, immutable"; }
}

# app.macbuild.cloud → React dashboard
server {
    listen 80;
    server_name app.macbuild.cloud;
    root /var/www/macbuild-dashboard/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}

# api.macbuild.cloud → Node.js API
server {
    listen 80;
    server_name api.macbuild.cloud;
    location / { proxy_pass http://127.0.0.1:3001; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
}
```

---

## Key design decisions

1. **Terminal animation in hero** — the hero right column types a real iOS build pipeline in real time, making the product instantly understandable to developers
2. **Dynamic pricing from backend** — `GET /api/public/plans` feeds the pricing section; if an admin updates plan prices in the dashboard, the website reflects it live (with Socket.io broadcast if connected)
3. **Scroll-triggered reveals** — all sections animate in as you scroll using `IntersectionObserver`
4. **Exact design match** — the website uses the same `#090710` background, `DM Sans` body font, and `#06b6d4` cyan accent as the existing dashboard, so the transition feels seamless
5. **JWT persisted** — `mbc_token` is written to `localStorage` on both login and register; the dashboard's existing `api.js` reads from the same key
