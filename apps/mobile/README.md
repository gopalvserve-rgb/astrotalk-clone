# Astrotalk Clone — Mobile App (Expo / React Native)

Phase 7. Skeleton to be scaffolded as:

```bash
npx create-expo-app astrotalk-mobile --template
```

Inside `apps/mobile/` link the workspaces:
- `@astrotalk/shared` — shared types, module registry, zodiac, constants
- `@astrotalk/ai`     — same AI router used by web

API base URL points to the tenant's domain.

## Screens (matching the web)

```
src/screens/
├── auth/         (phone OTP signin/signup)
├── dashboard/
│   ├── AstrologyTab.tsx
│   ├── NumerologyTab.tsx
│   └── VastuTab.tsx
├── consult/
│   ├── AstrologerList.tsx
│   ├── ChatRoom.tsx
│   ├── CallRoom.tsx       (Agora React Native SDK)
│   └── VideoRoom.tsx
├── ai/
│   ├── KundaliReading.tsx
│   ├── Numerology.tsx
│   ├── Vastu.tsx
│   ├── NameGenerator.tsx
│   ├── FaceReading.tsx
│   ├── PalmReading.tsx
│   └── Tarot.tsx
├── shop/
├── pooja/
├── yatra/
├── sewa/
├── darshan/
├── meditation/
├── wallet/        (Cashfree React Native SDK)
└── settings/
```

## Build & release

- EAS Build for both Android and iOS
- App Store + Play Store under each tenant's own developer account (white-label)
- Deep linking: `astrotalk://` (or per-tenant scheme)
- FCM push notifications

## What about per-tenant branding in a single app?

Two strategies:
1. **Per-tenant builds** — one APK per client (recommended for white-label).
2. **Single app, tenant picker** — the app asks "Which brand?" on first launch.
   The brand-name comes from `mobile.brandcode.com/api/branding` and the app
   re-themes.
