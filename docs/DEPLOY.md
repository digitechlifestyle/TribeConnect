# TribeConnect — Deployment & Scaling Guide

## Deployment Options

### Option A — Single VPS (Recommended Start)

Best for: 0–10,000 users

**Recommended specs:**
- 4 vCPUs, 8 GB RAM, 80 GB NVMe SSD
- Ubuntu 22.04 LTS
- Providers: DigitalOcean, Hetzner, Vultr, Linode

**Stack:**
```
Nginx + PHP 8.2-FPM + MySQL 8.0 + Redis (session/cache)
```

**One-command setup (Ubuntu 22.04):**
```bash
# Install stack
sudo apt update && sudo apt install -y \
  nginx php8.2-fpm php8.2-mysql php8.2-gd php8.2-curl \
  php8.2-mbstring php8.2-xml php8.2-zip php8.2-intl \
  php8.2-bcmath mysql-server redis-server certbot \
  python3-certbot-nginx

# Secure MySQL
sudo mysql_secure_installation

# Enable services
sudo systemctl enable --now nginx php8.2-fpm mysql redis-server
```

---

### Option B — Managed Cloud (10K–500K users)

**AWS stack:**
```
Route 53 (DNS)
→ CloudFront (CDN)
  → ALB (Load Balancer)
    → EC2 Auto Scaling Group (PHP-FPM)
      → RDS MySQL Multi-AZ
      → ElastiCache Redis
      → S3 (media storage)
```

**Terraform modules available at:** `docs/terraform/`

---

### Option C — Docker / Kubernetes

```yaml
# docker-compose.yml
version: '3.9'
services:

  web:
    image: tribeconnect-web
    build:
      context: .
      dockerfile: docker/Dockerfile
    volumes:
      - ./data:/var/www/html/data
    environment:
      - DB_HOST=db
      - DB_NAME=tribeconnect
      - DB_USER=tc_user
      - DB_PASS=${DB_PASSWORD}
      - REDIS_HOST=redis
    depends_on: [db, redis]
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./docker/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./certbot/conf:/etc/letsencrypt
    depends_on: [web]
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: tribeconnect
      MYSQL_USER: tc_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./installation/sql:/docker-entrypoint-initdb.d
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}

volumes:
  mysql_data:
```

Build and run:
```bash
cp .env.example .env
# Edit .env with your values
docker-compose up -d
```

---

## PHP-FPM Tuning

`/etc/php/8.2/fpm/pool.d/tribeconnect.conf`:
```ini
[tribeconnect]
user  = www-data
group = www-data
listen = /run/php/php8.2-fpm-tc.sock

pm                   = dynamic
pm.max_children      = 50
pm.start_servers     = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 20
pm.max_requests      = 500

php_admin_value[error_log]    = /var/log/php/tribeconnect.log
php_admin_flag[log_errors]    = on
php_admin_value[memory_limit] = 256M
php_admin_value[upload_max_filesize] = 50M
php_admin_value[post_max_size]       = 55M
php_admin_value[max_execution_time]  = 60
```

---

## Redis Session & Caching

`/etc/php/8.2/fpm/conf.d/redis-session.ini`:
```ini
session.save_handler = redis
session.save_path    = "tcp://127.0.0.1:6379?auth=YOUR_REDIS_PASS"
```

OSSN Redis config in `configurations/ossn.php`:
```php
define('OSSN_CACHE_DRIVER', 'redis');
define('OSSN_REDIS_HOST',   '127.0.0.1');
define('OSSN_REDIS_PORT',   6379);
define('OSSN_REDIS_AUTH',   'YOUR_REDIS_PASS');
```

---

## Media Storage (CDN / S3)

For production, offload media to S3 + CloudFront:

```php
// configurations/ossn.php
define('OSSN_STORAGE_DRIVER', 's3');
define('OSSN_S3_BUCKET',  'your-tribeconnect-media');
define('OSSN_S3_REGION',  'us-east-1');
define('OSSN_S3_KEY',     'your-aws-key');
define('OSSN_S3_SECRET',  'your-aws-secret');
define('OSSN_CDN_URL',    'https://cdn.yourdomain.com');
```

---

## Database Backups

```bash
# /usr/local/bin/tc-backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/tribeconnect"
DB="tribeconnect"
USER="tc_user"
PASS="your_password"

mkdir -p $BACKUP_DIR

# Database dump
mysqldump -u $USER -p$PASS $DB \
  --single-transaction --routines --triggers \
  | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Media files
tar -czf $BACKUP_DIR/data_$DATE.tar.gz /var/www/tribeconnect/data/

# Keep 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x /usr/local/bin/tc-backup.sh

# Cron: daily at 3am
echo "0 3 * * * root /usr/local/bin/tc-backup.sh >> /var/log/tc-backup.log 2>&1" \
  | sudo tee /etc/cron.d/tribeconnect-backup
```

---

## Zero-Downtime Deployments

```bash
# deploy.sh
#!/bin/bash
set -e

SITE=/var/www/tribeconnect
RELEASE=/var/www/releases/$(date +%Y%m%d%H%M%S)

echo "→ Creating release directory..."
mkdir -p $RELEASE

echo "→ Pulling latest code..."
git clone --depth=1 https://github.com/yourorg/tribeconnect.git $RELEASE

echo "→ Linking shared data directory..."
rm -rf $RELEASE/data
ln -s /var/www/shared/data $RELEASE/data

echo "→ Linking config..."
ln -s /var/www/shared/configurations/ossn.php $RELEASE/configurations/ossn.php

echo "→ Swapping symlink..."
ln -sfn $RELEASE $SITE

echo "→ Reloading PHP-FPM..."
sudo systemctl reload php8.2-fpm

echo "→ Purging old releases (keep 5)..."
ls -dt /var/www/releases/* | tail -n +6 | xargs rm -rf

echo "✓ Deploy complete."
```

---

## Monitoring

### Health check endpoint
Add to nginx:
```nginx
location /health {
    access_log off;
    return 200 "OK\n";
    add_header Content-Type text/plain;
}
```

### Recommended monitoring stack
- **Uptime**: Better Uptime / UptimeRobot
- **APM**: New Relic / Datadog
- **Logs**: Logtail / Papertrail
- **Alerts**: PagerDuty / OpsGenie

### Key metrics to monitor
- PHP-FPM queue length (alert > 10)
- MySQL slow query log (alert > 2s)
- Disk usage (alert > 80%)
- Redis memory (alert > 90%)
- Error rate (alert > 1%)
