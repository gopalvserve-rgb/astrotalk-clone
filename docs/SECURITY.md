# Security & Compliance

## OWASP Top 10 — controls

| Risk | Control | Where |
|---|---|---|
| Injection | Prisma + Zod validation everywhere | `apps/web/src/app/api/**` |
| Broken auth | JWT (HS256) + HttpOnly + Secure + SameSite=Lax cookies | `apps/web/src/lib/auth.ts` |
| Sensitive data exposure | DPDP-compliant; PII encrypted at rest (`pgcrypto`) | DB |
| XXE | n/a (no XML parsing) | — |
| Broken access | Every route asserts `getCurrentUser` + module check | `isModuleEnabled` |
| Misconfig | `.env` never committed, secrets in vault | repo + CI |
| XSS | React auto-escape; no `dangerouslySetInnerHTML` for user content | `app/**` |
| Insecure deser. | JSON only; no `eval` | — |
| Vulnerable deps | `pnpm audit` on CI | `.github/workflows/ci.yml` |
| Insufficient logging | Audit log in `audit_logs` table | DB |

## Headers (set in `middleware.ts`)

- HSTS, X-CTO, X-Frame-Options=DENY, Referrer-Policy, Permissions-Policy

## Rate limiting

In-memory sliding window in `middleware.ts` (Phase 9.x → Redis).

## DPDP Act 2023 (India) compliance

- Consent capture at signup
- Right to access / port / erase: `/dashboard/privacy/export`, `/dashboard/privacy/delete`
- Astrologer KYC stored encrypted; Aadhaar masked

## Cashfree PCI

- We never see card data — Cashfree tokenises.
- Webhook signed with HMAC-SHA256, verified in `cashfree-webhook` route.

## AI safety

- Per-user daily USD cap (`AI_DAILY_USD_CAP_PER_USER`).
- All AI outputs logged to `ai_reports`.
- Prompts include "no death/disease predictions; be kind".
