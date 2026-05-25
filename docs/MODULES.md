# Modules — Full Reference

Every feature lives in a module. Modules are toggleable per tenant.
The registry lives in `packages/shared/src/modules.ts`.

## Module status & ownership

| Key | Phase | Default | Owns these routes | API namespace |
|---|---|---|---|---|
| `chat_with_astrologer` | 4 | on | `/chat-with-astrologer/*` | `/api/chat/*` |
| `call_with_astrologer` | 4 | on | `/talk-to-astrologer/*` | `/api/call/*` |
| `video_call` | 4 | off | `/video-call/*` | `/api/video/*` |
| `ai_kundali_reading` | 3 | on | `/ai/kundali` | `/api/ai` (task=kundali_reading) |
| `ai_astrology` | 3 | on | `/ai/astrology` | `/api/ai` (task=chat_fallback) |
| `ai_numerology` | 3 | on | `/ai/numerology` | `/api/ai` (task=numerology_report) |
| `ai_vastu` | 3 | on | `/ai/vastu` | `/api/ai` (task=vastu_consult) |
| `ai_business_name` | 3 | on | `/ai/name-generator` | `/api/ai` (task=business_name/baby_name) |
| `face_reading` | 3 | on | `/face-reading` | `/api/ai` (task=face_reading) |
| `palm_reading` | 3 | on | `/palm-reading` | `/api/ai` (task=palm_reading) |
| `tarot_reading` | 3 | on | `/tarot` | `/api/ai` (task=tarot_reading) |
| `meditation_mantra` | 6 | on | `/meditation`, `/mantras` | `/api/media/*` |
| `book_pooja` | 5 | on | `/pooja` | `/api/pooja/*` |
| `live_darshan` | 6 | on | `/darshan` | `/api/darshan/*` |
| `live_shop` | 5 | on | `/shop` | `/api/shop/*` |
| `sewa` | 5 | on | `/sewa` | `/api/sewa/*` |
| `yatra_booking` | 5 | on | `/yatra` | `/api/yatra/*` |
| `panchang` | 2 | on | `/panchang` | `/api/astrology/panchang` |
| `free_kundli` | 2 | on | `/free-kundli` | `/api/astrology/kundali` |
| `kundli_matching` | 2 | on | `/matchmaking` | `/api/astrology/match` |
| `compatibility` | 2 | on | `/compatibility` | `/api/astrology/compat` |
| `calculators` | 2 | on | `/calculators/*` | `/api/calc/*` |
| `horoscope` | 2 | on | `/horoscope/*` | `/api/horoscope/*` |
| `wallet` | 1 ✓ | on | `/wallet` | `/api/wallet/*` |
| `session_history` | 1 ✓ | on | `/history` | `/api/history` |
| `blog` | 6 | on | `/blog/*` | `/api/blog/*` |
| `pandit_management` | 1 ✓ admin | on | (admin) | (admin) |

## Adding a new module

1. Add the key to the `ModuleKey` union and `MODULES` registry (`packages/shared/src/modules.ts`).
2. Wire the route(s) in `apps/web/src/app/...`.
3. Use `isModuleEnabled(tenant, "your_key")` at top of every page + API route.
4. Add a seed row in `packages/db/prisma/seed.ts`.
5. Document here.

## Pricing per module (AI tasks)

See `AI_TASK_PRICES` in `apps/web/src/app/api/ai/route.ts` —
update there or move to `tenant_settings` for per-tenant overrides.
