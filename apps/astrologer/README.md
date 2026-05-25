# Astrologer App (sub-domain)

Runs on `astrologer.your-domain.com` — separate Next.js app on port 3002.

## Pages (Phase 4 build)

- `/login` — Phone OTP login (only verified astrologers)
- `/onboarding/kyc` — Upload Aadhaar + PAN, IFSC + bank, profile photo
- `/dashboard` — Online/Offline toggle, live queue, today's earnings
- `/sessions/[id]` — Live chat/call UI with the user
- `/payouts` — Earnings ledger, Cashfree payout status

## Payouts

`packages/payments/src/cashfree-payouts.ts` (Phase 4) — auto-trigger T+2.
