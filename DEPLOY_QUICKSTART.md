# Deploy Quickstart — Customer Demo

## Option A — Railway (recommended for demo: cheap, Postgres included)

1. **Create GitHub repo** (one-time):
   ```bash
   cd "C:\Users\User\Documents\Claude\Projects\Astro Talk"
   git init
   git add .
   git commit -m "Initial AstroTalk clone"
   gh repo create astrotalk-clone --private --source=. --push
   # OR manually: create repo on github.com, then:
   # git remote add origin https://github.com/<you>/astrotalk-clone.git
   # git push -u origin main
   ```

2. **Railway**:
   - Go to railway.app → New Project → Deploy from GitHub repo → select `astrotalk-clone`
   - Add a **PostgreSQL** plugin (Railway → New → Database → PostgreSQL)
   - Add environment variables (Settings → Variables):
     ```
     DATABASE_URL              = ${{Postgres.DATABASE_URL}}
     TENANT_DATABASE_URL_TEMPLATE = ${{Postgres.DATABASE_URL}}
     JWT_SECRET                = (generate: openssl rand -base64 32)
     NEXTAUTH_SECRET           = (same as above, different value)
     CASHFREE_ENV              = TEST
     CASHFREE_APP_ID           = <your test app id>
     CASHFREE_SECRET_KEY       = <your test secret>
     CASHFREE_WEBHOOK_SECRET   = <your webhook secret>
     GEMINI_API_KEY            = <your Gemini key>
     DEEPSEEK_API_KEY          = <your DeepSeek key>
     SUPER_ADMIN_EMAIL         = admin@yourdomain.com
     SUPER_ADMIN_PASSWORD      = (something strong)
     ```
   - Railway auto-builds from `nixpacks.toml`
   - Wait for green checkmark → Settings → Generate Domain → you get `*.up.railway.app` URL

3. **Run migrations + seed** (one-time, in Railway shell):
   ```
   railway run pnpm db:migrate:deploy
   railway run pnpm db:seed
   ```

4. **Visit your URL** — log in to admin at `<url>/admin` with the seeded super admin.

## Option B — Vercel + Neon (Postgres)

1. Push to GitHub (same as Option A step 1)
2. **Neon Postgres** (free tier):
   - Sign up at neon.tech, create a project → copy the connection string
3. **Vercel**:
   - Go to vercel.com → Import GitHub repo
   - Framework: Next.js · Root directory: `apps/web`
   - Build command: `cd ../.. && pnpm install && pnpm db:generate && pnpm --filter @astrotalk/web build`
   - Add the same env vars as Railway (use Neon's connection string for `DATABASE_URL`)
   - Deploy

4. Run migrations from your local machine pointed at the Neon DB:
   ```bash
   DATABASE_URL="<neon-url>" pnpm db:migrate:deploy
   DATABASE_URL="<neon-url>" pnpm db:seed
   ```

## Option C — Docker Compose (self-hosted)

```bash
cp .env.example .env
# fill in values
docker compose up -d
```

Caddy auto-handles TLS for all configured domains.

## Demo URL convention

For customer demos, use `demo.astrotalk-clone.com` (or any subdomain). The seed creates a tenant for `demo.localhost` and `localhost` — to make it work on your demo URL, add the domain in admin → Tenants → demo → Domains.

## Known limitations of this demo build

- Astrologer marketplace pages will be empty until you seed astrologers in admin
- Shop will be empty until products are added
- Pooja / yatra / sewa lists empty until admin uploads
- Real human chat needs Socket.IO server (only AI chat works out of the box)
- Swiss Ephemeris uses approximation; for sub-arcminute accuracy install `swisseph`
- AI features need real Gemini + DeepSeek API keys to work
- Cashfree recharge needs real Cashfree TEST credentials

For a customer demo, the best path is to seed 4-5 AI astrologers + 5-10 shop products via the admin panel **before** the demo so the screens look full.
