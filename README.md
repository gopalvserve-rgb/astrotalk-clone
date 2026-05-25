# AstroTalk Clone — White-label Astrology Platform

A production-ready clone of astrotalk.com that can be deployed to **any number of domains** with **separate databases per tenant** and **per-tenant module toggles**.

## Quick start

```bash
# Install dependencies
pnpm install

# Set up your env
cp .env.example .env
# Edit .env — DATABASE_URL, CASHFREE_*, GEMINI_API_KEY, DEEPSEEK_API_KEY

# Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate

# Seed a demo tenant + admin user
pnpm db:seed

# Start dev (web + admin in parallel)
pnpm dev
```

Open:
- Web: http://localhost:3000  (the customer-facing AstroTalk clone)
- Admin: http://localhost:3001  (toggles modules, manages astrologers, products, etc.)

## What's in this repo

| Path | Purpose |
|---|---|
| `apps/web` | Customer-facing Next.js app (3 dashboards: Astrology / Numerology / Vastu) |
| `apps/admin` | Admin panel — tenant manager, module toggles, astrologers, products, settings |
| `apps/mobile` | React Native (Expo) app — shares API with web |
| `packages/db` | Prisma schema + migrations |
| `packages/ai` | Gemini + DeepSeek router |
| `packages/astrology` | Kundali, panchang, dasha engines |
| `packages/numerology` | Numerology engines |
| `packages/payments` | Cashfree integration |
| `docs/` | Architecture, phases, deployment, prompt library |

## White-label — adding a new tenant (a new client domain)

1. Run `pnpm tenant:create --domain=client1.com --name="Client One Astrology"`
2. Point client1.com DNS A-record at your server IP
3. Log into admin → toggle modules for that tenant
4. Done — client1.com renders with their branding, their astrologers, their wallet

Same codebase, separate DB, per-tenant configuration.

## Modules (all toggleable per tenant)

Chat / Call / Video, AI Kundali, AI Numerology, AI Vastu, AI Business Name, Face Reading, Palm Reading, Tarot, Meditation & Mantra, Book a Pooja, Live Darshan, Live Shop, Sewa, Yatra Booking, Panchang, Free Kundli, Matching, Compatibility, Calculators (15+), Horoscope, Wallet, Session History, Blog, Pandit Management.

Toggle any of them off and they vanish from the app, the API, and the user's UI.

## Documentation

- `docs/ARCHITECTURE.md` — full system architecture
- `docs/PHASES.md` — phase 1–9 build plan
- `docs/DEPLOYMENT.md` — how to deploy to multiple servers/domains
- `docs/WHITE_LABEL.md` — onboarding a new client
- `docs/AI_PROMPTS.md` — prompt library
- `docs/MODULES.md` — every module's schema, API, UI

## License

Proprietary — for internal / client use only.

<!-- deployed: 2026-05-25T11:53:19Z -->
