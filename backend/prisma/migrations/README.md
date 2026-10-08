# Prisma Migrations — អាធិរាជរឿង

This directory contains the auto-generated Prisma migration history.  
**Do not manually edit files inside this folder.**

---

## First-time Setup

### 1. Copy environment file and fill in your database URL

```bash
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL connection string
# Example:
#   DATABASE_URL="postgresql://user:password@localhost:5432/athirachroeng_db?schema=public"
```

### 2. Create the database (if it doesn't exist yet)

```sql
CREATE DATABASE athirachroeng_db;
```

### 3. Run the initial migration

```bash
# From the backend/ directory:
npx prisma migrate dev --name init
```

This will:
- Create all tables defined in `schema.prisma`
- Generate the Prisma Client
- Apply any pending migrations

---

## Common Commands

| Task | Command |
|------|---------|
| Create a new migration | `npx prisma migrate dev --name <description>` |
| Apply migrations in production | `npx prisma migrate deploy` |
| Reset database (dev only!) | `npx prisma migrate reset` |
| Open Prisma Studio | `npx prisma studio` |
| Regenerate Prisma Client | `npx prisma generate` |
| Run seed | `npx prisma db seed` |
| Check migration status | `npx prisma migrate status` |

---

## Production Deployment

For production, always use `migrate deploy` (never `migrate dev`):

```bash
# In your CI/CD pipeline or deployment script:
npx prisma migrate deploy
npx prisma db seed  # Optional: only on first deploy
```

---

## Schema Overview

| Model | Description |
|-------|-------------|
| `User` | Telegram mini-app users |
| `Admin` | Backend CMS administrators |
| `Category` | Movie/drama categories (Khmer) |
| `Movie` | Movies and drama series |
| `Episode` | Individual episodes per movie |
| `VideoAsset` | Video files per episode (multi-quality) |
| `Subtitle` | Subtitle files per episode |
| `Tag` / `MovieTag` | Tagging system |
| `Wallet` | Per-user wallet balance |
| `WalletTransaction` | Wallet credit/debit history |
| `PaymentMethod` | Configured deposit methods |
| `Deposit` | Top-up requests |
| `Purchase` | Movie/episode purchase records |
| `PurchaseItem` | Per-episode purchase line items |
| `WatchProgress` | Resume watching position |
| `WatchHistory` | User viewing history |
| `Favorite` | User saved/bookmarked movies |
| `Promotion` | Promotional campaigns |
| `Coupon` / `CouponUsage` | Discount coupons |
| `Notification` | In-app notifications |
| `AuditLog` | Admin action audit trail |
| `Setting` | Key-value application settings |

---

> Generated for **អាធិរាជរឿង** — Khmer Streaming Platform
