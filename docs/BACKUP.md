# Backups & Disaster Recovery

## Daily PG dumps (Pattern A — many tenants on one host)

```bash
# /etc/cron.d/astrotalk-backup
0 2 * * * postgres /usr/local/bin/astrotalk-backup.sh
```

`astrotalk-backup.sh`:
```bash
#!/usr/bin/env bash
set -e
STAMP=$(date +%F)
TARGET=/var/backups/astrotalk
mkdir -p "$TARGET/$STAMP"

for db in $(psql -lqt | cut -d \| -f 1 | grep '^[[:space:]]*astrotalk_' | xargs); do
  pg_dump -Fc "$db" | gzip > "$TARGET/$STAMP/$db.dump.gz"
done

# Upload to S3
aws s3 sync "$TARGET/$STAMP" "s3://astrotalk-backups/$STAMP/" --storage-class STANDARD_IA

# Keep 30 days locally, forever on S3 (lifecycle policy moves to Glacier after 90d)
find "$TARGET" -type d -mtime +30 -exec rm -rf {} +
```

## Restore a single tenant

```bash
gunzip -c astrotalk_tenant_client1.dump.gz | pg_restore -d astrotalk_tenant_client1 -Fc --clean --if-exists
```

## Disaster recovery RTO/RPO targets

| Tier | RTO | RPO |
|---|---|---|
| Master DB | 30 min | 24 h |
| Tenant DB | 1 h    | 24 h |
| Object storage (S3) | n/a (multi-AZ) | n/a |
| Redis (sessions) | 5 min — ok to lose, users will re-login | 1 h |
