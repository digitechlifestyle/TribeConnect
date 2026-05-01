# TribeConnect — Installation Guide

> Built on Open Source Social Network (OSSN) v9.x

## Prerequisites

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| PHP         | 8.1     | 8.2+        |
| MySQL       | 8.0     | 8.0+        |
| Web server  | Apache/Nginx | Nginx  |
| RAM         | 1 GB    | 4 GB+       |
| Storage     | 10 GB   | 50 GB+ SSD  |

### Required PHP Extensions
```
pdo pdo_mysql gd mbstring curl openssl intl xml zip bcmath
```

---

## Step 1 — Web Server Setup

### Nginx (recommended)

Create `/etc/nginx/sites-available/tribeconnect`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP → HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/tribeconnect;
    index index.php;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_session_cache shared:SSL:10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # OSSN URL rewriting
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Deny access to sensitive files
    location ~ /\.(ht|git|env) { deny all; }
    location ~* \.(sql|log|bak)$ { deny all; }

    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Upload size
    client_max_body_size 50M;

    access_log /var/log/nginx/tribeconnect.access.log;
    error_log  /var/log/nginx/tribeconnect.error.log;
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/tribeconnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Apache (.htaccess — already provided by OSSN)
The `.htaccess` in the project root handles URL rewriting. Ensure `AllowOverride All` is set.

---

## Step 2 — SSL Certificate

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Auto-renewal:
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Step 3 — Database Setup

```bash
# Log in to MySQL as root
sudo mysql -u root -p

# Create database and user
CREATE DATABASE tribeconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tc_user'@'localhost' IDENTIFIED BY 'CHANGE_THIS_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON tribeconnect.* TO 'tc_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Step 4 — Deploy Files

```bash
# Move files to web root
sudo mv /path/to/TribeConnect /var/www/tribeconnect

# Set ownership
sudo chown -R www-data:www-data /var/www/tribeconnect

# Set permissions
sudo find /var/www/tribeconnect -type d -exec chmod 755 {} \;
sudo find /var/www/tribeconnect -type f -exec chmod 644 {} \;

# OSSN data directory (writable)
sudo mkdir -p /var/www/tribeconnect/data
sudo chmod 775 /var/www/tribeconnect/data
sudo chown -R www-data:www-data /var/www/tribeconnect/data
```

---

## Step 5 — OSSN Web Installer

1. Open `https://yourdomain.com` in your browser
2. The OSSN installer will start automatically
3. Fill in:
   - **Database host**: `localhost`
   - **Database name**: `tribeconnect`
   - **Database user**: `tc_user`
   - **Database password**: (your password from Step 3)
   - **Site name**: `TribeConnect`
   - **Admin email / password**: (choose strong credentials)
4. Complete installation

---

## Step 6 — TribeConnect Custom Tables

After OSSN installation completes, import the custom schema:

```bash
mysql -u tc_user -p tribeconnect < /var/www/tribeconnect/installation/sql/tribeconnect.sql
```

---

## Step 7 — Activate Theme & Components

1. Log in to Admin: `https://yourdomain.com/administrator`
2. Go to **Appearance → Themes** → Activate **TribeConnect**
3. Go to **Components** and enable:
   - TribeConnect Premium
   - TribeConnect Ads Manager
   - TribeConnect Analytics
   - TribeConnect Verification
   - TribeConnect Creator Subscriptions
4. Also enable default OSSN components:
   - OssnWall, OssnComments, OssnLikes, OssnPhotos, OssnMessages
   - OssnNotifications, OssnGroups, OssnSearch, OssnProfile, OssnFriends

---

## Step 8 — Email Configuration

Go to **Admin → Settings → Email**:

```
SMTP Host:     smtp.your-provider.com
SMTP Port:     587
SMTP Auth:     Yes
Username:      noreply@yourdomain.com
Password:      (your SMTP password)
From Name:     TribeConnect
From Email:    noreply@yourdomain.com
```

For transactional email, recommended services: **Postmark**, **SendGrid**, **Mailgun**.

---

## Step 9 — Cron Jobs

```bash
sudo crontab -e -u www-data
```

Add:
```cron
# OSSN notifications & maintenance (every 5 minutes)
*/5 * * * * php /var/www/tribeconnect/cron.php > /dev/null 2>&1

# Premium renewal checks (daily at 2am)
0 2 * * * php /var/www/tribeconnect/cron_premium.php > /dev/null 2>&1

# Ad budget reset (daily at midnight)
0 0 * * * php /var/www/tribeconnect/cron_ads.php > /dev/null 2>&1
```

---

## Step 10 — Post-Install Hardening

```bash
# Remove installer (important!)
sudo rm -rf /var/www/tribeconnect/installation/

# Secure configurations directory
sudo chmod 600 /var/www/tribeconnect/configurations/ossn.php

# Create robots.txt if not present
cat > /var/www/tribeconnect/robots.txt << 'EOF'
User-agent: *
Disallow: /administrator/
Disallow: /configurations/
Disallow: /data/
Disallow: /action/
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
EOF
```

---

## Quick-Start Checklist

- [ ] PHP 8.1+ with required extensions
- [ ] MySQL database created
- [ ] Nginx/Apache configured with SSL
- [ ] Files deployed with correct permissions
- [ ] OSSN web installer completed
- [ ] Custom SQL schema imported
- [ ] TribeConnect theme activated
- [ ] All components enabled
- [ ] SMTP email configured
- [ ] Cron jobs set up
- [ ] Installation directory removed
- [ ] Admin password changed from default
