# Phase 1 — DONE ✓

Everything below is in place and working as a scaffold. Run:

```bash
pnpm install
cp .env.example .env       # fill in DATABASE_URL, JWT_SECRET, CASHFREE_*, GEMINI_API_KEY, DEEPSEEK_API_KEY
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Then:
- Customer site → http://localhost:3000
- Admin panel  → http://localhost:3001 (login with the email/password printed by the seed script)

## What was built

### Architecture
- **Monorepo** (pnpm workspaces + Turborepo)
- **Multi-tenant**, separate DB per tenant — resolved by Host header
- **Module toggle** system — admin enables/disables features per tenant
- **AI router** — Gemini for vision/latency, DeepSeek for reasoning
- **Cashfree wallet** — recharge + webhook + ledger
- **Theme system** — primary/secondary/accent colors per tenant (CSS variables)

### Packages
| Package | Purpose |
|---|---|
| `@astrotalk/db` | Prisma schema (29 models), client cache, master+tenant DB routing |
| `@astrotalk/shared` | Module registry (27 modules), types, constants |
| `@astrotalk/ai` | Gemini + DeepSeek router with 12 task prompts |
| `@astrotalk/astrology` | Kundali, Panchang, Dasha, Matching (stubs for Phase 2 ephemeris) |
| `@astrotalk/numerology` | Pythagorean + Chaldean engines (full implementation) |
| `@astrotalk/payments` | Cashfree PG wrapper (create order, get order, refund, webhook verify) |

### Web app pages
- `/` — Hero + zodiac marquee + dashboard tabs + free tools + CTA + footer
- `/signin` — Phone OTP login
- `/dashboard` (Astrology | Numerology | Vastu) — gated by auth + filtered by enabled modules
- `/wallet` — Balance + recharge form + Cashfree checkout + transaction history
- `/free-kundli` — Form + API + result
- `/ai/kundali` — Form + AI API call + result
- `/face-reading` — Image upload + Gemini Vision
- `/palm-reading` — Image upload + Gemini Vision
- `/panchang` — Today's panchang (stub)
- `/shop`, `/pooja`, `/sewa`, `/yatra`, `/darshan` — list + empty-state + module-disabled handling
- `/chat-with-astrologer` — Astrologer marketplace list

### Web API routes
- `POST /api/auth/send-otp`, `POST /api/auth/verify-otp`, `POST /api/auth/signout`
- `POST /api/astrology/kundali`
- `POST /api/ai` (unified — kundali/numerology/vastu/face/palm/tarot/business-name/etc.)
- `POST /api/wallet/recharge`, `POST /api/wallet/cashfree-webhook`

### Admin app
- `/login` — Super admin sign-in
- `/tenants` — list of all tenants
- `/tenants/[id]` — Detail + Domains + Module toggle grid (server action)
- `/modules`, `/astrologers`, `/products`, `/settings` — pages w/ Phase-2 placeholders

### Provisioner
- `tools/tenant-provisioner/index.js` — CLI: `pnpm tenant:create --slug=… --name=… --domain=…`

### Documentation
- `ARCHITECTURE.md`, `README.md`, `docs/PHASES.md`, `docs/DEPLOYMENT.md`, `docs/WHITE_LABEL.md`, `docs/MODULES.md`, `docs/AI_PROMPTS.md`, `apps/mobile/README.md`

## What's not yet wired (Phase 2+)

- Real Swiss Ephemeris kundali / panchang (currently stubs)
- Live chat + voice + video (Phase 4)
- Shop checkout flow + order tracking (Phase 5)
- Pooja booking, Yatra, Sewa donation flows end-to-end (Phase 5)
- Live darshan stream uploader (Phase 6)
- Mobile app (Phase 7)
- Tenant signup wizard in admin (Phase 8)

All of these are specified in `docs/PHASES.md` with files-to-create and acceptance criteria.

## File count

```
apps/web/src/*       21 source files
apps/admin/src/*     11 source files
packages/db/*         3 source files (incl. 29-model Prisma schema)
packages/shared/*     4 source files
packages/ai/*         5 source files
packages/astrology/*  6 source files
packages/numerology/* 2 source files
packages/payments/*   2 source files
docs/*                5 markdown files
tools/*               1 CLI
```
