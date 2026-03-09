# Mac Build Cloud — Frontend

iOS CI/CD SaaS platform dashboard. Built with **React 18 + Vite + Tailwind CSS**.

## Stack

| Tool | Version | Role |
|---|---|---|
| React | 18 | UI framework |
| Vite | 5 | Dev server + bundler |
| Tailwind CSS | 3 | Utility-first styling |
| Pure SVG | — | Charts (no external lib) |

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build
```

## Demo credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@macbuild.cloud | password |
| Client | alex@company.io | password |

## Project structure

```
src/
├── App.jsx                     # Root component — layout + routing
├── main.jsx                    # React entry point
├── styles/
│   └── index.css               # Tailwind + global styles
│
├── data/
│   └── index.js                # All mock data (builds, users, plans, etc.)
│
├── components/
│   ├── ui/
│   │   ├── Icon.jsx            # SVG icon set (Lucide-style, self-contained)
│   │   └── SharedUI.jsx        # Badge, C (card), CH (card header), ErrRow,
│   │                           # Toast, Toggle, exportCSV
│   │
│   ├── charts/
│   │   └── index.jsx           # Spark, BarSVG, SvgBar, SvgGroupBar,
│   │                           # SvgArea, SvgPie, SvgCpuHistory
│   │
│   ├── shared/
│   │   ├── LogModal.jsx        # Animated build log viewer (used in Admin + Client)
│   │   ├── Login.jsx           # Login screen (role selector)
│   │   └── RoleBanner.jsx      # Admin ↔ Client role switcher banner
│   │
│   ├── admin/
│   │   ├── AdminSidebar.jsx    # Sidebar + AdminProfileWidget (Change PW, Security)
│   │   ├── AdminOverview.jsx   # KPI cards, build volume chart, node status
│   │   ├── AdminBuilds.jsx     # All builds table + log viewer
│   │   ├── AdminUsers.jsx      # User management + expand details
│   │   ├── AdminNodes.jsx      # Mac mini node grid + sparklines
│   │   ├── AdminNodeDetail.jsx # Single node deep-dive + CPU history
│   │   ├── AdminAlerts.jsx     # Alert management + ack
│   │   ├── AdminAudit.jsx      # Audit trail log
│   │   ├── AdminBroadcast.jsx  # Send broadcast messages to all users
│   │   ├── AdminPlans.jsx      # Plan editor + distribution pie chart
│   │   ├── AdminBackups.jsx    # Backup history + trigger
│   │   └── AdminAnalytics.jsx  # Revenue/profit charts + build stats
│   │
│   └── client/
│       ├── ClientSidebar.jsx   # Sidebar + plan usage bar + ClientProfileWidget
│       ├── ClientDashboard.jsx # KPI cards, recent builds, notifications preview
│       ├── ClientBuilds.jsx    # My builds table + log viewer
│       ├── ClientNewBuild.jsx  # Submit new build form
│       ├── ClientCerts.jsx     # Certificate management
│       ├── ClientProfiles.jsx  # Provisioning profile management
│       ├── ClientWebhooks.jsx  # Webhook configuration
│       ├── ClientTokens.jsx    # API token management
│       ├── ClientTeam.jsx      # Team members + invite
│       ├── ClientBilling.jsx   # Invoices + payment method
│       ├── ClientSettings.jsx  # Profile, 2FA, notification prefs, danger zone
│       └── ClientChatbot.jsx   # Floating support chatbot with knowledge base
```

## Key features

- **Admin panel** (rose theme) — full platform management: builds, users, Mac nodes, alerts, plans, backups, analytics
- **Client panel** (violet theme) — build submission, certificate/profile management, webhooks, API tokens, team, billing, support
- **Notification bell** — real-time dropdown with mark-as-read
- **Profile dropdowns** — Change Password modal, Security modal (2FA + session management)
- **Build log viewer** — animated streaming terminal with download IPA
- **Charts** — all pure SVG, no dependencies (SvgBar, SvgGroupBar, SvgArea, SvgPie, Spark)
- **Support chatbot** — keyword-based knowledge base with 14 topics
- **Mobile** — responsive with slide-in sidebar overlay

## Connect to backend

```bash
# Copy the integration helpers from the backend package
cp ../macbuild-server/frontend-integration/api.js src/lib/api.js
cp ../macbuild-server/frontend-integration/useSocket.js src/hooks/useSocket.js

# Set API URL in .env
VITE_API_URL=http://localhost:3001/api
```
