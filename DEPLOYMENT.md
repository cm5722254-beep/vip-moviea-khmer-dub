# អាធិរាជរឿង — Production Deployment Guide

This guide covers deploying **អាធិរាជរឿង** to a Linux VPS using Docker Compose.

---

## Table of Contents

1. [Server Requirements](#1-server-requirements)
2. [Domain & SSL Setup](#2-domain--ssl-setup)
3. [Telegram Bot Creation](#3-telegram-bot-creation)
4. [Environment Variable Configuration](#4-environment-variable-configuration)
5. [Docker Deployment Steps](#5-docker-deployment-steps)
6. [Database Migration](#6-database-migration)
7. [First Admin Setup](#7-first-admin-setup)
8. [S3 / R2 Storage Setup](#8-s3--r2-storage-setup)
9. [Nginx Reverse Proxy (SSL Termination)](#9-nginx-reverse-proxy-ssl-termination)
10. [Health Check Endpoints](#10-health-check-endpoints)
11. [Monitoring Recommendations](#11-monitoring-recommendations)
12. [Backup Procedures](#12-backup-procedures)

---

## 1. Server Requirements

### Minimum (Development / Small)
| Resource | Requirement |
|---|---|
| CPU | 2 vCPUs |
| RAM | 4 GB |
| Disk | 40 GB SSD |
| OS | Ubuntu 22.04 LTS / Debian 12 |
| Network | 100 Mbps |

### Recommended (Production)
| Resource | Requirement |
|---|---|
| CPU | 4 vCPUs |
| RAM | 8 GB |
| Disk | 80 GB SSD (+ separate volume for uploads/DB) |
| OS | Ubuntu 22.04 LTS |
| Network | 1 Gbps |

### Required Software
```bash
# Docker Engine 24+
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Docker Compose v2 (included with Docker Engine 24+)
docker compose version

# Nginx (for reverse proxy / SSL termination on the host)
sudo apt install -y nginx

# Certbot (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx

# Git
sudo apt install -y git
```

---

## 2. Domain & SSL Setup

### 2.1 DNS Configuration

Point your domain to your server's IP address:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `yourdomain.com` | `YOUR_SERVER_IP` | 300 |
| A | `www.yourdomain.com` | `YOUR_SERVER_IP` | 300 |
| A | `api.yourdomain.com` | `YOUR_SERVER_IP` | 300 |

Wait for DNS propagation (up to 24 hours, usually 5–15 minutes).

Verify:
```bash
dig yourdomain.com +short
nslookup yourdomain.com
```

### 2.2 Obtain SSL Certificate

```bash
# Stop nginx temporarily if port 80 is in use
sudo systemctl stop nginx

# Obtain certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d api.yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos \
  --non-interactive

# Certificates will be at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# Auto-renewal (already set up by certbot, verify):
sudo systemctl status certbot.timer
```

---

## 3. Telegram Bot Creation

See [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md) for the complete step-by-step guide.

**Quick summary:**
1. Message `@BotFather` on Telegram
2. Run `/newbot` and follow prompts
3. Copy the bot token → `TELEGRAM_BOT_TOKEN` in `.env`
4. Run `/newapp` to create the Mini App
5. Set the Mini App URL to `https://yourdomain.com`

---

## 4. Environment Variable Configuration

### 4.1 Copy the example file
```bash
cd /srv/athireach-roeung
cp .env.docker.example .env
```

### 4.2 Generate secure secrets
```bash
# Generate JWT secrets (run twice — one for users, one for admin)
openssl rand -base64 64

# Example output (use your own):
# kXj2mP9nQ...
```

### 4.3 Edit `.env`
```bash
nano .env
```

Fill in every `CHANGE_ME_` value:

```env
# PostgreSQL
POSTGRES_USER=athireach
POSTGRES_PASSWORD=<strong-random-password>
DATABASE_URL=postgresql://athireach:<password>@postgres:5432/athireach_roeung

# Redis — uses Docker service name
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=<64-char-random>
JWT_ADMIN_SECRET=<64-char-random-different>

# Telegram
TELEGRAM_BOT_TOKEN=<from BotFather>
TELEGRAM_BOT_USERNAME=<your bot username without @>

# URLs
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api

# S3 / R2
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=<r2-access-key>
S3_SECRET_ACCESS_KEY=<r2-secret-key>
S3_BUCKET_NAME=athireach-roeung

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong-admin-password>
ADMIN_EMAIL=admin@yourdomain.com
```

### 4.4 Secure the file
```bash
chmod 600 .env
```

---

## 5. Docker Deployment Steps

### 5.1 Clone and prepare

```bash
# Clone repository
git clone https://github.com/your-org/athireach-roeung.git /srv/athireach-roeung
cd /srv/athireach-roeung

# Copy and edit environment
cp .env.docker.example .env
nano .env   # fill in all values
```

### 5.2 Build images

```bash
docker compose build --no-cache
```

### 5.3 Start services

```bash
# Start all services in detached mode
docker compose up -d

# Watch logs during startup
docker compose logs -f
```

### 5.4 Verify containers are running

```bash
docker compose ps
```

Expected output:
```
NAME                    STATUS          PORTS
athireach-postgres-1    Up (healthy)    0.0.0.0:5432->5432/tcp
athireach-redis-1       Up (healthy)    0.0.0.0:6379->6379/tcp
athireach-backend-1     Up              0.0.0.0:3000->3000/tcp
athireach-frontend-1    Up              0.0.0.0:80->80/tcp
```

### 5.5 Update deployment

```bash
git pull origin main
docker compose build --no-cache
docker compose up -d --remove-orphans
docker image prune -f
```

---

## 6. Database Migration

Migrations run automatically on container startup via:
```
npx prisma migrate deploy && node dist/main
```

To run migrations manually:
```bash
# Execute inside the backend container
docker compose exec backend npx prisma migrate deploy

# Check migration status
docker compose exec backend npx prisma migrate status
```

To reset the database (DESTRUCTIVE — development only):
```bash
docker compose exec backend npx prisma migrate reset
```

---

## 7. First Admin Setup

After the containers are running, seed the first admin account:

```bash
# Option A: Use the setup script
bash scripts/setup.sh --seed-admin

# Option B: Run directly inside the container
docker compose exec backend node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await prisma.admin.upsert({
    where: { username: process.env.ADMIN_USERNAME },
    update: {},
    create: {
      username: process.env.ADMIN_USERNAME,
      password,
      email: process.env.ADMIN_EMAIL,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Admin created:', process.env.ADMIN_USERNAME);
}
main().finally(() => prisma.\$disconnect());
"
```

Then log in at `https://yourdomain.com/admin`.

---

## 8. S3 / R2 Storage Setup

### Option A: Cloudflare R2 (Recommended — free egress)

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **R2 Object Storage** → **Create bucket**
3. Name: `athireach-roeung`
4. Go to **Manage R2 API Tokens** → **Create API Token**
   - Permissions: Object Read & Write
   - Scope: specific bucket → `athireach-roeung`
5. Copy Access Key ID and Secret Access Key into `.env`
6. Set `S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
7. Set `S3_REGION=auto`

### Option B: AWS S3

1. Create an S3 bucket in your preferred region
2. Create an IAM user with `AmazonS3FullAccess` policy (or a scoped custom policy)
3. Generate access keys
4. Set `S3_ENDPOINT=` (empty — SDK uses AWS default)
5. Set `S3_REGION=ap-southeast-1` (or your region)

### Option C: Self-hosted MinIO

```bash
docker run -d \
  --name minio \
  -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=password123 \
  -v minio_data:/data \
  quay.io/minio/minio server /data --console-address ":9001"
```

Set in `.env`:
```
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
```

### CORS Configuration (required for video playback)

For R2/S3, add a CORS rule to the bucket:
```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 9. Nginx Reverse Proxy (SSL Termination)

This Nginx config runs on the **host** machine and proxies to Docker containers.

```bash
sudo nano /etc/nginx/sites-available/athireach-roeung
```

```nginx
# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://yourdomain.com$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Modern SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy /api to backend (port 3000)
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        client_max_body_size 500m;
    }

    # Proxy everything else to frontend (port 80 inside Docker, mapped to 8080 on host)
    # Adjust port if frontend is on a different host port
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **Note:** If you expose Docker frontend on port 80 directly, you'll need to change the host Nginx port or use port 8080 for the frontend Docker mapping. Update `docker-compose.yml` frontend ports to `'8080:80'` if running Nginx on the host.

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/athireach-roeung /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 10. Health Check Endpoints

### Application Health
```
GET https://yourdomain.com/api/v1/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-10-06T04:18:31.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "database": "ok",
    "memory": {
      "heapUsed": "128 MB",
      "heapTotal": "256 MB",
      "rss": "180 MB"
    }
  }
}
```

### Docker Container Health
```bash
# Check all services
docker compose ps

# Detailed health of a specific service
docker inspect athireach-roeung-postgres-1 | grep -A 10 '"Health"'
```

### Manual curl checks
```bash
# Backend API health
curl -s https://yourdomain.com/api/v1/health | jq .

# Frontend (should return 200)
curl -I https://yourdomain.com

# PostgreSQL direct
docker compose exec postgres pg_isready -U athireach

# Redis direct
docker compose exec redis redis-cli ping
```

---

## 11. Monitoring Recommendations

### Uptime Monitoring (Free)
- **UptimeRobot** (https://uptimerobot.com) — monitor `/api/v1/health` every 5 minutes, alert via Telegram

### Logging
```bash
# View logs in real time
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend

# Send Docker logs to a file
docker compose logs backend > /var/log/athireach/backend.log 2>&1
```

For structured logging, consider adding Loki + Grafana or a cloud log aggregator (Datadog, Better Stack Logs).

### Metrics (Optional)
```bash
# Quick resource usage
docker stats

# Add Prometheus + Grafana stack (docker-compose.monitoring.yml):
# - Node Exporter for host metrics
# - cAdvisor for container metrics
# - Grafana dashboard
```

### Alerts
Set up UptimeRobot to notify your **Telegram channel** (the bot you created) when the health endpoint goes down.

---

## 12. Backup Procedures

### Automated PostgreSQL Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-athireach.sh
```

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/var/backups/athireach"
DATE=$(date +%Y%m%d_%H%M%S)
COMPOSE_DIR="/srv/athireach-roeung"

mkdir -p "$BACKUP_DIR"

# Dump PostgreSQL
docker compose -f "$COMPOSE_DIR/docker-compose.yml" exec -T postgres \
  pg_dump -U athireach athireach_roeung \
  | gzip > "$BACKUP_DIR/postgres_$DATE.sql.gz"

# Keep last 7 daily backups
find "$BACKUP_DIR" -name "postgres_*.sql.gz" -mtime +7 -delete

echo "Backup completed: postgres_$DATE.sql.gz"
```

```bash
chmod +x /usr/local/bin/backup-athireach.sh

# Schedule daily at 02:00
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-athireach.sh >> /var/log/athireach-backup.log 2>&1") | crontab -
```

### Backup Uploads Volume

```bash
# Add to backup script
docker run --rm \
  -v athireach-roeung_uploads:/data \
  -v /var/backups/athireach:/backup \
  alpine tar czf /backup/uploads_$DATE.tar.gz -C /data .
```

### Restore PostgreSQL

```bash
# Stop backend first to prevent writes
docker compose stop backend

# Restore from backup
gunzip -c /var/backups/athireach/postgres_20261006_020000.sql.gz | \
  docker compose exec -T postgres psql -U athireach athireach_roeung

# Restart backend
docker compose start backend
```

### Offsite Backup (Cloudflare R2 / S3)

```bash
# Install rclone
curl https://rclone.org/install.sh | bash

# Configure rclone for R2 (run once)
rclone config

# Sync backups to R2
rclone sync /var/backups/athireach r2:athireach-roeung-backups/db \
  --transfers=4 \
  --log-file=/var/log/rclone-backup.log
```

---

## Quick Reference Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Rebuild and restart
docker compose up -d --build

# View logs
docker compose logs -f [service]

# Shell into backend
docker compose exec backend sh

# Shell into postgres
docker compose exec postgres psql -U athireach athireach_roeung

# Run Prisma migration
docker compose exec backend npx prisma migrate deploy

# Check health
curl -s http://localhost:3000/api/v1/health | jq .
```
