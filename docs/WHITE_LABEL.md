# White-label — Onboarding a New Tenant

A "tenant" is a single white-labelled deployment — one brand, one domain, one
database. Multiple tenants can run on the same codebase.

## Onboarding flow (10 minutes)

1. **Client tells you their domain** (e.g. `astro.client.com`).
2. **Provision tenant DB + master row**:
   ```bash
   pnpm tenant:create \
     --slug=astro-client \
     --name="Astro Client" \
     --domain=astro.client.com
   ```
3. **Point DNS** — client's DNS A-record → your server's IP (or CNAME if behind CDN).
4. **Customise theme** — log into admin → Tenants → Astro Client → Settings →
   upload logo, set brand colours, brand name.
5. **Enable / disable modules** — Tenants → Astro Client → Modules → toggle.
6. **Seed astrologers / products / poojas** — admin panel.
7. **Connect Cashfree** — Settings → enter client's own Cashfree App ID + Secret
   (or use platform-default).
8. **Set AI keys** — leave blank to use platform defaults, or override.
9. **Done** — visit https://astro.client.com — the brand-themed site is live.

## Per-tenant config knobs

| Setting | Stored in | Default | Override |
|---|---|---|---|
| Brand name | `TenantTheme.brandName` | Tenant.name | Admin → Settings |
| Logo | `TenantTheme.logoUrl` | — | upload via Settings |
| Primary colour | `TenantTheme.primaryColor` | `#F26B1D` | Settings |
| Cashfree keys | encrypted in `TenantSetting` | platform default | Settings |
| Gemini key | `TenantSetting` | platform default | Settings |
| DeepSeek key | `TenantSetting` | platform default | Settings |
| Module toggles | `TenantModule.enabled` | per module's `defaultOn` | Modules tab |
| Default AI provider per task | `TenantSetting.ai_provider_<task>` | router default | Settings |
| Min recharge | `TenantSetting.min_recharge` | ₹50 | Settings |
| Currency | `TenantSetting.currency` | INR | Settings |

## When NOT to white-label

If a client wants:
- A different feature set than module toggles can express → fork
- A completely different language stack → not appropriate
- Massive customisation of UI → use Pattern B (dedicated server) + Tailwind overrides
