# Mac Build Cloud — Backend

iOS Cloud Build Platform API. Powers the React dashboard with REST endpoints,
WebSocket live updates, a build queue, and a simulated Mac mini build worker.

---

## Architecture

```
React Dashboard
      │
      │  REST  (HTTPS)
      ▼
  Nginx (reverse proxy + SSL)
      │
      ▼
Express.js API  :3001
  ├── /api/auth          JWT auth
  ├── /api/build(s)      Build CRUD
  ├── /api/logs/:id      Log retrieval
  ├── /api/download/:id  Mock IPA
  ├── /api/queue         Queue state
  ├── /api/webhooks      Webhook config
  ├── /api/tokens        API tokens
  └── /api/admin/*       Admin panel
      │
      ├── Socket.io ─── Live log streaming
      │                 buildUpdate events
      │                 queueUpdate events
      │
      ├── BuildQueue ── FIFO queue (1 worker)
      │
      └── MockMacMiniWorker
              │
              │  (future: replace with RealMacMiniAgent)
              ▼
         Simulated build steps
         → pending → queued → running → compiling → packaging → success/failed
```

---

## Project Structure

```
macbuild-server/
├── server.js                    # Entry point
├── package.json
├── .env.example                 # Copy to .env
│
├── auth/
│   └── authService.js           # JWT + bcrypt
│
├── buildEngine/
│   ├── MockMacMiniWorker.js     # Simulated build machine
│   └── buildScripts.js          # Log lines per step
│
├── controllers/
│   ├── authController.js
│   ├── buildController.js
│   ├── adminController.js
│   ├── webhookController.js
│   ├── tokenController.js
│   └── userController.js
│
├── middleware/
│   ├── authMiddleware.js        # requireAuth / requireAdmin
│   └── errorHandler.js
│
├── queue/
│   └── BuildQueue.js            # FIFO queue manager
│
├── routes/
│   └── index.js                 # All routes
│
├── services/
│   └── webhookService.js        # Fires HTTP webhooks
│
├── storage/
│   └── database.js              # SQLite setup + migrations
│
├── utils/
│   └── logger.js                # Winston logger
│
├── websocket/
│   └── socketManager.js         # Socket.io init + emitters
│
├── frontend-integration/
│   ├── api.js                   # Drop-in API client for React
│   └── useSocket.js             # React hooks for Socket.io
│
├── scripts/
│   ├── seed.js                  # Populate demo data
│   └── test-api.sh              # Smoke test all endpoints
│
└── deploy/
    ├── macbuild.service         # systemd unit
    └── nginx.conf               # Nginx reverse proxy
```

---

## Local Development

### 1. Install dependencies

```bash
cd macbuild-server
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set JWT_SECRET to a long random string
```

### 3. Start the server

```bash
npm run dev        # nodemon — auto-restart on changes
# or
npm start          # plain node
```

### 4. Seed demo data (optional)

```bash
node scripts/seed.js
```

### 5. Run smoke tests

```bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

Server starts on **http://localhost:3001**

Default accounts after seeding:
| Email | Password | Role |
|---|---|---|
| admin@macbuild.cloud | Admin1234! | admin |
| alex@company.io | Demo1234! | user |
| sara@startup.io | Demo1234! | user |

---

## Connect the React Dashboard

### 1. Install socket.io-client

```bash
cd your-react-project
npm install socket.io-client
```

### 2. Copy integration files

```bash
cp macbuild-server/frontend-integration/api.js      src/lib/api.js
cp macbuild-server/frontend-integration/useSocket.js src/hooks/useSocket.js
```

### 3. Set environment variable

In your React project's `.env`:
```
VITE_API_URL=http://localhost:3001/api
```

### 4. Use in components

```jsx
import api from '@/lib/api';
import { useBuildUpdates } from '@/hooks/useSocket';

// Login
const { user, token } = await api.auth.login('alex@company.io', 'Demo1234!');

// Submit a build
const { id } = await api.builds.submit({
  project:       'MyApp iOS',
  repo_url:      'https://github.com/example/myapp.git',
  branch:        'main',
  xcode_version: '15.3',
  region:        'EU-West',
});

// Live updates in a component
function BuildDetail({ buildId }) {
  const [build, setBuild] = useState(null);
  const [logs,  setLogs]  = useState([]);

  useBuildUpdates(
    buildId,
    (update) => setBuild(update),         // status changes
    (logLine) => setLogs(l => [...l, logLine]) // streaming logs
  );
  // ...
}
```

---

## REST API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/me` | ✅ | Current user profile |

### Builds
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/build` | ✅ | Submit a new build |
| GET | `/api/builds` | ✅ | List builds (own / all for admin) |
| GET | `/api/build/:id` | ✅ | Build details |
| DELETE | `/api/build/:id` | ✅ | Cancel queued build |
| GET | `/api/logs/:id` | ✅ | All log lines for a build |
| GET | `/api/download/:id` | ✅ | Download mock IPA |
| GET | `/api/queue` | ✅ | Current queue state |

### User
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PATCH | `/api/user/profile` | ✅ | Update name |
| POST | `/api/user/change-password` | ✅ | Change password |
| GET | `/api/user/stats` | ✅ | Build stats |

### Webhooks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/webhooks` | ✅ | List webhooks |
| POST | `/api/webhooks` | ✅ | Create webhook |
| DELETE | `/api/webhooks/:id` | ✅ | Delete webhook |
| POST | `/api/webhooks/:id/test` | ✅ | Fire test event |

### API Tokens
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tokens` | ✅ | List tokens |
| POST | `/api/tokens` | ✅ | Create token |
| DELETE | `/api/tokens/:id` | ✅ | Revoke token |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | 🔑 admin | Platform stats |
| GET | `/api/admin/users` | 🔑 admin | All users |
| PATCH | `/api/admin/users/:id` | 🔑 admin | Update user (plan/status/role) |
| GET | `/api/admin/builds` | 🔑 admin | All builds |

---

## WebSocket Events

Connect to: `ws://localhost:3001`

### Emit (client → server)
```js
socket.emit('subscribeBuild', buildId)    // subscribe to one build
socket.emit('unsubscribeBuild', buildId)
socket.emit('subscribeAdmin')             // admin: all builds
socket.emit('subscribeUser', userId)      // user: own builds
```

### Listen (server → client)
```js
// Build status changed
socket.on('buildUpdate', ({
  id, status, project, queuePosition,
  startedAt, finishedAt, durationMs,
  errorReason, errorCode, log
}) => { ... });

// Single log line streamed during build
socket.on('logLine', ({
  buildId, ts, kind, message
}) => { ... });

// Queue changed (new build or build finished)
socket.on('queueUpdate', ({
  workerBusy, currentBuild, queueLength, queue
}) => { ... });
```

### Build status flow
```
pending → queued → running → compiling → packaging → success
                                                    ↘ failed
```

---

## Deploy to Linux VPS

### 1. Provision the server (Ubuntu 22.04)

```bash
# As root
apt update && apt upgrade -y
apt install -y nginx certbot python3-certbot-nginx

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Create app user
useradd -m -s /bin/bash macbuild
```

### 2. Deploy the app

```bash
# On your machine
scp -r macbuild-server/ root@your-vps:/opt/macbuild-server/

# On the VPS
chown -R macbuild:macbuild /opt/macbuild-server
cd /opt/macbuild-server
npm ci --omit=dev

# Create production .env
cp .env.example .env
nano .env
# Set: JWT_SECRET, ALLOWED_ORIGINS, NODE_ENV=production
```

### 3. Configure systemd

```bash
cp deploy/macbuild.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable macbuild
systemctl start macbuild
systemctl status macbuild

# View logs
journalctl -u macbuild -f
```

### 4. Configure Nginx + SSL

```bash
# Set your domain in deploy/nginx.conf first
cp deploy/nginx.conf /etc/nginx/sites-available/macbuild
ln -s /etc/nginx/sites-available/macbuild /etc/nginx/sites-enabled/

# Get SSL certificate
certbot --nginx -d api.yourdomain.com

# Test and reload
nginx -t && systemctl reload nginx
```

### 5. Update React .env for production

```
VITE_API_URL=https://api.yourdomain.com/api
```

### 6. Seed initial data

```bash
cd /opt/macbuild-server
node scripts/seed.js
```

---

## Replacing the Mock Worker with a Real Mac mini

The `MockMacMiniWorker` is designed to be swapped. The `BuildQueue` only calls:

```js
worker.run(build)      // start build
worker.isAvailable     // check if free
worker.on('free', cb)  // notified when done
```

To add a real Mac mini agent:

1. Create `buildEngine/RealMacMiniAgent.js` implementing the same interface
2. The real agent connects to the Mac mini via SSH or an HTTP polling agent
3. Replace the one line in `BuildQueue.js`:

```js
// Before (mock):
this.worker = new MockMacMiniWorker('mac-01');

// After (real):
const RealMacMiniAgent = require('../buildEngine/RealMacMiniAgent');
this.worker = new RealMacMiniAgent('mac-01', { host: 'mac-mini-ip', port: 8080 });
```

Everything else (queue, WebSocket, logging, dashboard) stays exactly the same.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | HTTP server port |
| `NODE_ENV` | `development` | `production` disables stack traces |
| `JWT_SECRET` | `dev_secret_...` | **Must change in production!** |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `DB_PATH` | `./storage/macbuild.db` | SQLite database path |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS origins (comma-separated) |
| `BUILD_SPEED_MULTIPLIER` | `1` | `0.1` = 10× faster for testing |
| `FAILURE_RATE` | `0.15` | Probability of simulated build failure (0–1) |
| `RATE_LIMIT_MAX` | `100` | Requests per window per IP |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |

## Note Node.js version
This project uses Node's built-in `node:sqlite` module (introduced in Node 22.5+).
- **Node 22**: uses `--experimental-sqlite` flag (already included in npm scripts)
- **Node 23+/24+**: works natively, no flag needed

No native compilation required — works on Windows, Linux, Mac without build tools.
