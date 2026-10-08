# អាធិរាជរឿង — Manual Setup Checklist

Both backend and frontend build cleanly. The items below require external services
or manual configuration before the app can actually run.

---

## 1. PostgreSQL Database  ⚠️ REQUIRED

The backend will fail to start without a running PostgreSQL instance.

**Option A — Docker (fastest for local dev)**
```bash
# Start only the database from docker-compose
docker compose up postgres -d
```

**Option B — Install PostgreSQL locally**
- Download from https://www.postgresql.org/download/windows/
- Create a database named `athireach_roeung`
- Update `DATABASE_URL` in `.env` if your username/password differs from `postgres/postgres`

**After the database is running, run migrations and seed:**
```bash
# From D:\Reiung khmer\backend
npx prisma migrate deploy        # applies migrations
npx prisma db seed               # seeds categories, admins, payment methods, settings
```

Default admin after seed:
- Username: `superadmin`  Password: `SuperAdmin@2025!`
- Username: `admin`       Password: `Admin@2025!`
- **Change these immediately in production.**

---

## 2. Redis Cache  ⚠️ REQUIRED

The backend uses Redis for session caching (`cache-manager-ioredis-yet`).
It will throw a connection error at startup without Redis.

**Option A — Docker**
```bash
docker compose up redis -d
```

**Option B — Windows native**
- Download Memurai (Redis-compatible for Windows): https://www.memurai.com/
- Or run Redis via WSL2

`.env` key: `REDIS_URL=redis://localhost:6379` (already set)

---

## 3. Telegram Bot  ⚠️ REQUIRED for user auth & notifications

Without a bot token:
- Users cannot authenticate (the app calls `/api/v1/auth/telegram` with Telegram initData)
- Deposit/purchase notifications won't be sent

**Steps:**
1. Open Telegram, search for `@BotFather`
2. Send `/newbot` and follow the prompts
3. Copy the token into `.env`:
   ```
   TELEGRAM_BOT_TOKEN=123456789:ABCdef...
   TELEGRAM_BOT_USERNAME=your_bot_username
   ```
4. To use as a Mini App: in BotFather, use `/newapp` or `/setmenubutton` on your bot
5. See `TELEGRAM_SETUP.md` in the project root for detailed Telegram Mini App configuration

---

## 4. Object Storage (S3 / Cloudflare R2 / MinIO)  ⚠️ REQUIRED for video uploads

Without storage credentials, video/image uploads will fail (500 error from `StorageService`).
The app is still usable in read-only mode (browsing movies) without it, but admins can't
upload content.

**Fill in `.env`:**
```
STORAGE_ENDPOINT=https://s3.amazonaws.com          # or your R2/MinIO endpoint
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY=<your access key>
STORAGE_SECRET_KEY=<your secret key>
STORAGE_BUCKET=athireach-roeung-videos
STORAGE_CDN_URL=https://cdn.yourdomain.com         # optional, for public asset URLs
```

**Cheapest options:**
- **Cloudflare R2** — free tier 10 GB storage, no egress fees, S3-compatible
- **AWS S3** — standard option, has egress costs
- **MinIO** (self-hosted) — free, run via Docker locally for dev

---

## 5. Production Secrets  ⚠️ REQUIRED before going live

The `.env` values below are placeholder dev values. Replace them before deployment:

| Key | Current (dev) | Action |
|-----|--------------|--------|
| `JWT_SECRET` | `dev-jwt-secret-...` | Generate with `openssl rand -base64 48` |
| `JWT_ADMIN_SECRET` | `dev-admin-jwt-secret-...` | Generate with `openssl rand -base64 48` |
| `PAYMENT_WEBHOOK_SECRET` | `dev-webhook-secret-changeme` | Set a strong random value |
| `SUPER_ADMIN_PASSWORD` | `SuperAdmin@2025!` | Change after first seed |
| `ADMIN_PASSWORD` | `Admin@2025!` | Change after first seed |

---

## Quick Start (local dev with Docker for DB + Redis)

```powershell
# 1. Start PostgreSQL + Redis
docker compose up postgres redis -d

# 2. Wait ~5s for DB to be ready, then migrate + seed
cd backend
npx prisma migrate deploy
npx prisma db seed

# 3. Start the backend (dev mode with hot-reload)
cd ..
npm run dev:backend

# 4. In another terminal, start the frontend
npm run dev:frontend
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3000/api/v1  
Admin panel: http://localhost:5173/admin  
