# Telegram Bot & Mini App Setup Guide

This guide walks you through creating and configuring the Telegram Bot for **អាធិរាជរឿង**.

---

## Table of Contents

1. [Create the Telegram Bot with @BotFather](#1-create-the-telegram-bot-with-botfather)
2. [Configure Bot Commands & Description](#2-configure-bot-commands--description)
3. [Set Up the Mini App (Web App)](#3-set-up-the-mini-app-web-app)
4. [Configure the Web App URL](#4-configure-the-web-app-url)
5. [Set Up a Payment Provider](#5-set-up-a-payment-provider)
6. [Testing Telegram Authentication](#6-testing-telegram-authentication)
7. [Webhook Configuration](#7-webhook-configuration)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Create the Telegram Bot with @BotFather

### Step 1 — Open BotFather

Open Telegram and search for **@BotFather** (blue verified checkmark), or click:
[https://t.me/BotFather](https://t.me/BotFather)

### Step 2 — Create a new bot

Send the command:
```
/newbot
```

### Step 3 — Choose a name

BotFather will ask: *"Alright, a new bot. How are we going to call it? Please choose a name for your bot."*

Enter a display name for the app:
```
អាធិរាជរឿង
```
or in English:
```
Athireach Roeung
```

### Step 4 — Choose a username

BotFather will ask: *"Good. Now let's choose a username for your bot."*

The username must:
- End in `bot` (case-insensitive)
- Be unique globally
- Contain only letters, numbers, and underscores

Example:
```
AthirachRoeungBot
```

### Step 5 — Save your Bot Token

BotFather will respond with your bot token in this format:
```
1234567890:AABBccDDeeFFggHHiiJJkkLLmmNNooPPqqRR
```

⚠️ **Keep this token SECRET.** Anyone with it can control your bot.

Copy it into your `.env` file:
```env
TELEGRAM_BOT_TOKEN=1234567890:AABBccDDeeFFggHHiiJJkkLLmmNNooPPqqRR
TELEGRAM_BOT_USERNAME=AthirachRoeungBot
```

---

## 2. Configure Bot Commands & Description

### Set bot description

```
/setdescription
```
Select your bot, then enter:
```
🎬 អាធិរាជរឿង — ទស្សនារឿងភាគ និងរឿងខ្មែរ។ ចូលមើលរឿងណាមួយ ត្រឹមមានគណនី Telegram។
```

### Set about text (short description)

```
/setabouttext
```
Enter:
```
ទស្សនារឿងភាគ និងរឿងខ្មែរ ម្នាក់ម្នាក់
```

### Set bot profile picture

```
/setuserpic
```
Upload a square image (512×512 px recommended) for the bot avatar.

### Set commands list (optional)

```
/setcommands
```
Enter:
```
start - បើក Mini App
help - ជំនួយ
```

---

## 3. Set Up the Mini App (Web App)

### Step 1 — Create the Mini App

Send to @BotFather:
```
/newapp
```

### Step 2 — Select your bot

Choose your bot from the list (e.g., `@AthirachRoeungBot`).

### Step 3 — Enter app title

```
អាធិរាជរឿង
```

### Step 4 — Enter app description

```
ទស្សនារឿងភាគ និងរឿងខ្មែរ ម្នាក់ម្នាក់
```

### Step 5 — Upload app photo

Upload a 640×360 px image representing the app.

### Step 6 — Enter Web App URL

```
https://yourdomain.com
```

Replace `yourdomain.com` with your actual domain.

### Step 7 — Choose short name (URL slug)

```
athireach
```

This creates the app URL: `https://t.me/AthirachRoeungBot/athireach`

---

## 4. Configure the Web App URL

### Update the URL after deployment

If you need to change the URL later:
```
/myapps
```
Select the app → **Edit Web App URL**

### Add a Menu Button (opens app from bot chat)

```
/setmenubutton
```
Select your bot → Enter the URL:
```
https://yourdomain.com
```

Set the button text:
```
🎬 មើលរឿង
```

### Enable Inline Mode (optional)

If you want users to share content inline:
```
/setinline
```
Set the inline placeholder:
```
ស្វែងរករឿង...
```

---

## 5. Set Up a Payment Provider

For in-app purchases via Telegram Payments:

### Step 1 — Connect a payment provider

Send to @BotFather:
```
/mybots
```
Select your bot → **Payments** → Choose a provider.

Available providers include:
- **Stripe** (test mode available)
- **PayU**, **Razorpay**, **YooMoney**, and others

### Step 2 — Stripe (recommended for testing)

1. Visit [https://stripe.com](https://stripe.com) and create an account
2. Get your **Test API keys** from Dashboard → Developers → API keys
3. In BotFather → Payments → Stripe (Test) → Enter your Stripe token
4. BotFather gives you a **Telegram Payments token** — save it:

```env
TELEGRAM_PAYMENT_TOKEN=<telegram-payments-token-from-botfather>
```

### Step 3 — Manual Bank Transfer (current implementation)

The current app uses **manual deposit verification** (admin approves deposits).
No Telegram payment token is needed for this flow.

To enable this:
- Users request a deposit → Admin approves → Balance credited
- Configure bank account details in Admin → Settings

---

## 6. Testing Telegram Authentication

### How Telegram authentication works

When a user opens the Mini App, Telegram injects `window.Telegram.WebApp.initData` — a URL-encoded string containing user info and an HMAC signature.

The backend verifies this signature using your `TELEGRAM_BOT_TOKEN`.

### Test in development

The app includes a development fallback in `hooks/useAuth.ts`. In development mode (non-Telegram browser), it uses a mock user.

### Test in Telegram

1. Open your bot: `https://t.me/AthirachRoeungBot`
2. Click the **Menu Button** (or send `/start`)
3. The Mini App opens
4. Open browser DevTools (in the Telegram Desktop → right-click → Inspect)
5. Check the Network tab for the `POST /api/v1/auth/telegram` request
6. A successful auth returns a JWT token

### Manual auth test (curl)

```bash
# This will fail HMAC validation (for structure testing only)
curl -X POST https://yourdomain.com/api/v1/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "initData": "user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%7D&auth_date=1234567890&hash=abc123"
  }'
```

### Verify the bot token is correct

```bash
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getMe"
```

Expected response:
```json
{
  "ok": true,
  "result": {
    "id": 1234567890,
    "is_bot": true,
    "first_name": "អាធិរាជរឿង",
    "username": "AthirachRoeungBot",
    "can_join_groups": true,
    "can_read_all_group_messages": false,
    "supports_inline_queries": false
  }
}
```

---

## 7. Webhook Configuration

The backend uses the Telegram Bot API to **send notifications** (deposit approved/rejected, purchase success). It does NOT require an incoming webhook unless you want to handle bot commands.

### Send a test message via bot

```bash
# Get your chat ID: message the bot first, then:
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates"

# Send a test message
curl "https://api.telegram.org/bot<YOUR_TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "<YOUR_CHAT_ID>",
    "text": "✅ Bot is configured correctly!",
    "parse_mode": "HTML"
  }'
```

### Set webhook (if needed for bot commands)

```bash
curl "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yourdomain.com/api/v1/telegram/webhook",
    "secret_token": "<random-secret>"
  }'
```

---

## 8. Troubleshooting

### "Bot token is invalid"
- Double-check the token in `.env` — no spaces, no line breaks
- Verify with: `curl https://api.telegram.org/bot<TOKEN>/getMe`

### "initData hash mismatch"
- The bot token in `.env` must match the bot that opened the Mini App
- Check `auth_date` — if more than 24 hours old, the backend rejects it (replay protection)
- In development, use the dev fallback mode

### Mini App shows blank page
- Check `VITE_API_URL` is set correctly in `.env`
- Confirm CORS is configured: `FRONTEND_URL` must match the Mini App origin
- Check browser console for network errors

### "Bot can't send messages to user"
- The user must have started the bot first (`/start`)
- Telegram restricts bots from sending messages to users who haven't interacted with them

### Mini App not loading in Telegram
- The URL must be HTTPS with a valid certificate
- Check if your domain is accessible from Telegram's servers
- Test: `curl -I https://yourdomain.com`

### Payment token not working
- Ensure you copied the **Telegram Payments token** from BotFather, not the Stripe API key
- For testing, use Stripe **test mode** token only

---

## Quick Reference

| Item | Value |
|---|---|
| BotFather | [@BotFather](https://t.me/BotFather) |
| Mini App URL | `https://t.me/<YourBotUsername>/<app-short-name>` |
| Bot API docs | https://core.telegram.org/bots/api |
| Mini App docs | https://core.telegram.org/bots/webapps |
| Payments docs | https://core.telegram.org/bots/payments |
| Auth validation | https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app |
