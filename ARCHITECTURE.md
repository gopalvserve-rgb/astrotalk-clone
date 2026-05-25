# AstroTalk Clone — Architecture & Phase Plan

White-label Astrology / Numerology / Vastu platform — Website + Admin + React Native app.

## 1. Tech Stack (locked)

| Layer | Choice |
|---|---|
| Web frontend | **Next.js 14 (App Router)** + TypeScript + Tailwind CSS |
| Backend API | **Next.js Route Handlers** + Node 20 (same monorepo) |
| Database | **PostgreSQL 16** via **Prisma ORM** |
| Auth | **NextAuth.js** (credentials + OTP) with JWT sessions |
| Mobile app | **React Native (Expo)** — shares API + types |
| Real-time | **Socket.IO** (chat) + WebRTC for voice/video |
| Payments | **Cashfree** (PG + Payouts) — wallet recharge |
| AI | **Gemini 2.0** (multimodal — face/palm reading), **DeepSeek** (long-form astrology text + numerology reasoning) |
| Hosting | Multi-server / multi-domain — see white-label model below |
| Storage | S3-compatible (Cloudflare R2 recommended) for images, audio, video |
| Cache / Queue | Redis (sessions, OTP, rate limit, background jobs via BullMQ) |
| Live streaming | YouTube embed (Phase 1) → WebRTC + HLS via LiveKit (Phase 4) |

## 2. White-Label Model — "Single codebase, separate DB per tenant"

```
ONE deployment of the app
    │
    ├── tenant resolution by Host header → maps to tenants registry DB
    │       (master DB stores: { domain → tenantId → db connection string })
    │
    ├── per-tenant DB connection pool (Prisma multi-schema or db-per-tenant)
    │       astrotalk_clone_tenant_1, astrotalk_clone_tenant_2, …
    │
    └── tenant-aware middleware injects ctx.tenant on every request

Each domain (yoursite1.com, yoursite2.com, partner.com) can:
    • Have its own DB
    • Have its own theme/branding (logo, colors, name)
    • Have its own modules enabled
    • Have its own astrologers + content
    • Be hosted on the same server OR a different server (just point DNS + add DB row)
```

**Two deployment modes supported**:
1. **Shared infra** — many tenants on one Next.js deployment, each with own DB. Cheapest.
2. **Dedicated** — clone the whole repo per client onto their own server. Same code, just one tenant in `master`.

## 3. Module System (admin enable/disable)

Every feature lives behind a module flag stored in the tenant's `modules` table. Admin panel shows toggles per tenant. Disabled modules:
- Hide their UI in nav + dashboard
- Return 404 / 403 from their API routes
- Don't deduct wallet
- Don't appear in app

**Module registry** (`packages/shared/src/modules.ts`):
| Module key | Default | Description |
|---|---|---|
| `chat_with_astrologer` | on | Per-min chat with real or AI astrologers |
| `call_with_astrologer` | on | Voice call (Twilio/Agora) |
| `video_call` | off | Video session |
| `ai_kundali_reading` | on | AI-generated kundali report |
| `ai_astrology` | on | AI chat fallback |
| `ai_numerology` | on | Numerology reports |
| `ai_vastu` | on | Vastu consultation |
| `ai_business_name` | on | AI business/baby name generator |
| `face_reading` | on | Upload selfie → AI face reading (Gemini Vision) |
| `palm_reading` | on | Upload palm photo → AI palm reading |
| `tarot_reading` | on | Card draw + AI interpretation |
| `meditation_mantra` | on | Curated audio + guided meditations |
| `book_pooja` | on | Pooja booking with pandit assignment |
| `live_darshan` | on | YouTube embeds + uploaded streams |
| `live_shop` | on | Gemstones, yantras, rudraksha shop |
| `sewa` | on | Ann daan, pashu sewa, mandir, vastra |
| `yatra_booking` | on | Pilgrim yatra bookings |
| `panchang` | on | Daily panchang + shubh muhurat |
| `free_kundli` | on | Free kundli generator |
| `kundli_matching` | on | 36 guna matching |
| `compatibility` | on | Zodiac compatibility |
| `calculators` | on | All 15+ calculators |
| `horoscope` | on | Daily/weekly/monthly/yearly |
| `wallet` | on | Cashfree recharge + deduction |
| `session_history` | on | User's past sessions |
| `blog` | on | Articles + horoscope CMS |
| `pandit_management` | on | Admin can add real/AI pandits |

## 4. Dashboard Layout (three tabs)

```
┌── Astrology ── Numerology ── Vastu ──┐
│                                      │
│  [Top: Wallet balance + Recharge]    │
│                                      │
│  Featured astrologers/numerologists/ │
│  vastu consultants (per tab)         │
│                                      │
│  Quick services for this tab         │
│   (Astrology: Kundali, Matching…)    │
│   (Numerology: Name, Number, Lucky…) │
│   (Vastu: Home, Office, Plot…)       │
│                                      │
│  Daily card (horoscope / number /    │
│   vastu tip per tab)                 │
│                                      │
│  Articles / Tips for this tab        │
└──────────────────────────────────────┘
```

## 5. AI Provider Routing — which AI for which job

I evaluated Gemini vs DeepSeek for astrology workloads. Recommendation:

| Task | Best provider | Why |
|---|---|---|
| **Face reading** | **Gemini 2.0 Flash (vision)** | Multimodal — accepts image, returns text |
| **Palm reading** | **Gemini 2.0 Flash (vision)** | Same — image in, structured analysis out |
| **Kundali / Vedic chart interpretation** | **DeepSeek v3** | Stronger long-form reasoning + cheaper for big prompts |
| **Numerology reports** | **DeepSeek v3** | Mathematical reasoning + cultural context |
| **Vastu consultation** | **DeepSeek v3** | Long-form rule-based reasoning |
| **Business / baby name** | **Gemini 2.0 Flash** | Creative + faster latency |
| **Tarot interpretation** | **DeepSeek v3** | Better narrative storytelling |
| **Chat fallback (when astrologer offline)** | **Gemini 2.0 Flash** | Lower latency, faster TTFT |
| **Voice call (AI pandit)** | **Gemini Live API** | Real-time bidirectional audio |
| **OCR / horoscope-from-newspaper** | **Gemini Vision** | Multimodal |

Implemented as a thin `aiRouter` in `packages/ai/src/router.ts` — single function call: `ai.complete({ task: "kundali_reading", input })`. Switching providers is a one-line config change per tenant.

## 6. Phase-by-Phase Build Plan

| Phase | What | Status |
|---|---|---|
| **1 — Foundation** | Monorepo, DB schema, multi-tenant routing, auth, admin panel skeleton, module toggle, wallet (Cashfree), homepage + dashboard tabs, theme | **Building now** |
| **2 — Astrology Core** | Kundali engine, Panchang, all 15+ calculators, horoscopes CMS, matching, compatibility | Next |
| **3 — AI Layer** | AI router (Gemini + DeepSeek), AI Kundali, Numerology, Vastu, Tarot, Face & Palm reading | Next |
| **4 — Consultation** | Real-time chat, voice call (Agora SDK), video, astrologer + pandit profiles, per-minute wallet deduction, session history, reviews | Next |
| **5 — Commerce** | Shop (gemstones, yantras, rudraksha), Cart, Checkout, Order tracking, Pooja booking, Yatra booking, Sewa donations | Next |
| **6 — Live & Community** | Live darshan (YouTube embed + WebRTC uploads), meditation library, mantra player, blog/articles | Next |
| **7 — Mobile App** | React Native (Expo) app sharing API. Push notifications via FCM. Deep linking. | Next |
| **8 — White-label tooling** | Tenant signup flow, theme builder, DNS verification, automated DB provisioning, billing for tenants | Next |
| **9 — Polish & Scale** | SEO, analytics, GA4, performance, security audit, load tests | Final |

## 7. Repository Layout

```
astrotalk-clone/
├── apps/
│   ├── web/                # Next.js — public site + user dashboard
│   ├── admin/              # Next.js — admin panel (separate app on /admin or admin.domain)
│   └── mobile/             # React Native (Expo)
├── packages/
│   ├── db/                 # Prisma schema, migrations, seed
│   ├── ai/                 # AI router (Gemini + DeepSeek)
│   ├── astrology/          # Kundali calculator, panchang, dasha (Swiss Ephemeris)
│   ├── numerology/         # Pythagorean + Chaldean engines
│   ├── vastu/              # Vastu rule engine
│   ├── payments/           # Cashfree wrapper (PG, Payouts, Refunds)
│   ├── shared/             # Types, modules registry, constants, utils
│   └── ui/                 # Shared React components (cards, buttons, forms)
├── tools/
│   ├── tenant-provisioner/ # CLI to spin up new tenant DBs
│   └── seed/               # Seed data (sample astrologers, products)
├── docs/
│   ├── ARCHITECTURE.md (this file)
│   ├── PHASES.md           # Detailed phase 2–9 spec
│   ├── DEPLOYMENT.md       # Multi-domain hosting guide
│   ├── WHITE_LABEL.md      # How to onboard a new tenant
│   ├── AI_PROMPTS.md       # Prompt library for each AI feature
│   └── MODULES.md          # All modules + their schemas
├── .env.example
├── package.json            # npm/pnpm workspaces root
├── turbo.json              # Turborepo
└── README.md
```

## 8. Security & Compliance

- Per-tenant data isolation (DB-level, not just row-level)
- OWASP top 10 checks in Phase 9
- PCI: never store card data — Cashfree handles tokenization
- DPDP Act 2023 (India) — user data export + delete endpoints
- Astrologer KYC stored encrypted (Aadhaar masked)
- Wallet ledger uses double-entry bookkeeping for audit

## 9. Cost / Operations Notes

- AI cost capped per user per day (env: `AI_DAILY_USD_CAP`)
- Cashfree settlement: T+2 to bank
- Estimated infra for 10K MAU per tenant: ₹8–12K/month (Hetzner CCX23 + managed PG + Redis)
