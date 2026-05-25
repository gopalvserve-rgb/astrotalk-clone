# Deployment — Multi-domain / Multi-server White-label

Three deployment patterns are supported.

## Pattern A — Shared host, many tenants (cheapest)

One Hetzner / DigitalOcean droplet, one Next.js process per app (web + admin),
one PostgreSQL instance with **many databases** (one per tenant).

```
ServerA (Hetzner CCX23, 4 vCPU / 16 GB)
├── nginx / Caddy (TLS + SNI for all tenant domains)
├── astrotalk_web   (Next.js)   :3000
├── astrotalk_admin (Next.js)   :3001
├── postgres 16 (managed or local)
│     ├── astrotalk_master            ← tenants registry
│     ├── astrotalk_tenant_client1
│     ├── astrotalk_tenant_client2
│     └── …
├── redis 7
└── workers (BullMQ)
```

**To add a new client (white-label tenant):**

1. Point `client3.com` A-record → server IP.
2. Run `pnpm tenant:create --slug=client3 --name="Client Three" --domain=client3.com`.
3. Reload Caddy/nginx — TLS provisioned automatically via Let's Encrypt.
4. Done.

## Pattern B — Dedicated server per client

For clients who want isolation (compliance, scale).

```
ServerA → client1.com only
ServerB → client2.com only
```

Same codebase deployed to each server, `tenants` table has exactly one row.
Cashfree, Gemini, DeepSeek keys can be unique per server via `.env`.

## Pattern C — Container fleet (Phase 9)

Docker images for web + admin + workers, orchestrated on Hetzner / Kubernetes /
Fly.io. Each tenant DB still separate; tenants table lives in a managed PG.

---

## nginx example (Pattern A)

```nginx
server {
  listen 443 ssl http2;
  server_name client1.com client2.com client3.com;  # all tenants
  ssl_certificate     /etc/letsencrypt/live/astrotalk/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/astrotalk/privkey.pem;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;        # ← tenant resolution uses this
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}

server {
  listen 443 ssl http2;
  server_name admin.your-platform.com;
  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
  }
}
```

## Caddy alternative (zero-config TLS)

```Caddyfile
client1.com, client2.com, client3.com {
  reverse_proxy 127.0.0.1:3000
}
admin.your-platform.com {
  reverse_proxy 127.0.0.1:3001
}
```

---

## Database backup

```bash
# Daily — all tenants
crontab -e
0 2 * * * for db in $(psql -t -c "SELECT datname FROM pg_database WHERE datname LIKE 'astrotalk_%'"); do \
  pg_dump $db | gzip > /backups/$db-$(date +%F).sql.gz; \
done
```

## CI/CD (sketch)

- GitHub Actions → build → deploy via SSH `pnpm build && pm2 reload all`
- Migrations run automatically against master, then each tenant DB in turn
