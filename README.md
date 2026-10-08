# អាធិរាជរឿង (Athireach Roeung)

> **The King of Stories** — A premium Khmer cinematic streaming Telegram Mini App

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-red.svg)](https://nestjs.com)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🇬🇧 English

### Overview

**អាធិរាជរឿង** (Athireach Roeung — "The King of Stories") is a full-featured Khmer cinematic streaming platform delivered as a Telegram Mini App. Users can browse, watch, and unlock premium Khmer films and series directly inside Telegram with a dark gold cinematic UI.

### Features

- 🎬 **Video Streaming** — Adaptive HLS video playback via CDN
- 💎 **Subscription Tiers** — Free, Premium, and VIP access levels
- 🔐 **Telegram Auth** — Seamless login via Telegram WebApp `initData`
- 💳 **Payments** — Integrated payment gateway with webhook support
- 🌙 **Dark Cinematic Theme** — Deep black + gold UI inspired by Khmer royal aesthetics
- 📱 **Mobile-First** — Optimized for Telegram iOS and Android clients
- 🚀 **CDN Delivery** — S3-compatible storage with presigned URLs
- 🛡️ **Admin Panel** — Full content management, user management, analytics
- 🔄 **Real-time** — Redis-backed caching for fast load times
- 🌐 **Khmer + English** — Bilingual content support

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, TypeScript 5, Tailwind CSS 3 |
| Backend | NestJS 10, Express, Prisma 5, PostgreSQL |
| Auth | JWT (RS256), Telegram WebApp validation |
| Storage | AWS S3 / S3-compatible (MinIO, Cloudflare R2) |
| Cache | Redis 7, ioredis |
| Queue | Bull (Redis-backed) |

### Project Structure

```
athireach-roeung/
├── frontend/               # React + Vite Telegram Mini App
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Zustand global state
│   │   ├── api/            # Axios API client
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Helper utilities
│   ├── public/             # Static assets
│   └── index.html
├── backend/                # NestJS REST API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # Users module
│   │   ├── movies/         # Movies/content module
│   │   ├── payments/       # Payment processing
│   │   ├── storage/        # S3 file management
│   │   ├── admin/          # Admin endpoints
│   │   └── common/         # Shared guards, pipes, interceptors
│   └── prisma/             # Database schema & migrations
├── .env.example            # Environment variable template
├── .gitignore
└── package.json            # Workspace root
```

### Getting Started

#### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 7
- npm >= 9

#### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/athireach-roeung.git
cd athireach-roeung

# 2. Install all dependencies (workspaces)
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# 4. Set up the database
cd backend
npx prisma migrate dev
npx prisma generate

# 5. Start development servers
cd ..
npm run dev
```

#### Development

```bash
# Run frontend only (http://localhost:5173)
npm run dev:frontend

# Run backend only (http://localhost:3000)
npm run dev:backend

# Run both concurrently
npm run dev
```

#### Production Build

```bash
npm run build
```

### Environment Variables

See `.env.example` for all required variables with descriptions.

### API Documentation

When the backend is running, visit:
- Swagger UI: `http://localhost:3000/api/docs`
- Health check: `http://localhost:3000/health`

### Deployment

The app is designed for deployment on:
- **Backend**: Any Node.js host (Railway, Render, EC2, etc.)
- **Frontend**: Vercel, Netlify, Cloudflare Pages, or served from backend
- **Database**: Supabase, Railway Postgres, or self-hosted
- **Redis**: Upstash Redis or self-hosted

---

## 🇰🇭 ភាសាខ្មែរ

### សេចក្តីផ្តើម

**អាធិរាជរឿង** គឺជាវេទិការស្ទ្រីមរឿងខ្មែរ ដែលដំណើរការជា Telegram Mini App ។ អ្នកប្រើប្រាស់អាចមើលរឿង ខ្មែរកំសាន្ត ស៊េរីទូទៅ និងខ្លឹមសារពិសេស ដោយផ្ទាល់នៅក្នុង Telegram ជាមួយនឹងអ៊ីនធ័រហ្វេសសស្រស់ស្អាតស្ទាបអារម្មណ៍រឿងរ៉ាវ។

### មុខងារសំខាន់ៗ

- 🎬 **ស្ទ្រីមវីដេអូ** — មើលវីដេអូ HLS ដោយប្រើ CDN
- 💎 **កម្រិតការជាវ** — ឥតគិតថ្លៃ, Premium, និង VIP
- 🔐 **ការចូលតាម Telegram** — ចូលប្រើដោយស្វ័យប្រវត្តិតាម Telegram
- 💳 **ការទូទាត់** — ប្រព័ន្ធទូទាត់ដែលមានសុវត្ថិភាព
- 🌙 **ម៉ូតស្រស់ស្អាត** — ខ្មៅងងឹត + មាសរូបពណ៌ស្ទាបអារម្មណ៍ខ្មែរ
- 📱 **ស័រទូរស័ព្ទ** — បង្កើនប្រសិទ្ធភាពសម្រាប់ Telegram iOS និង Android

### ការដំឡើង

```bash
# ១. Clone project
git clone https://github.com/your-org/athireach-roeung.git
cd athireach-roeung

# ២. ដំឡើងកញ្ចប់កម្មវិធី
npm install

# ៣. រៀបចំ environment variables
cp .env.example .env
# កែប្រែ .env ជាមួយតម្លៃពិតប្រាកដ

# ៤. បង្កើតមូលដ្ឋានទិន្នន័យ
cd backend
npx prisma migrate dev

# ៥. ចាប់ផ្តើម server
cd ..
npm run dev
```

### ការបរិច្ចាគ

- Fork repository
- បង្កើត feature branch (`git checkout -b feature/my-feature`)
- Commit ការផ្លាស់ប្តូររបស់អ្នក (`git commit -m 'Add: my feature'`)
- Push ទៅ branch (`git push origin feature/my-feature`)
- បើក Pull Request

---

## License

MIT © 2026 អាធិរាជរឿង Team
