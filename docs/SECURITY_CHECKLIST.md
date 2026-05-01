# TribeConnect — Security Checklist

Run through this checklist before going live and after every major deployment.

---

## 🔐 Authentication & Accounts

- [ ] **Strong admin password** — minimum 20 chars, random, stored in password manager
- [ ] **Admin URL changed** — consider custom admin path via OSSN config
- [ ] **Email verification enabled** — require email confirm before login
- [ ] **Account enumeration prevented** — generic "email or password incorrect" messages
- [ ] **Login rate limiting** — max 5 attempts per 15 minutes per IP
- [ ] **Password policy enforced** — minimum 10 chars, complexity requirements
- [ ] **Session timeout configured** — idle sessions expire after 30 minutes
- [ ] **Secure session cookies set**:
  ```php
  session.cookie_httponly = On
  session.cookie_secure   = On
  session.cookie_samesite = Lax
  session.use_strict_mode = On
  ```
- [ ] **JWT secret rotated** from OSSN default (update in `configurations/ossn.php`)
- [ ] **Two-factor authentication** — enabled for admin accounts (plugin recommended)

---

## 🌐 Network & TLS

- [ ] **HTTPS enforced** — all HTTP redirected to HTTPS (301)
- [ ] **TLS 1.2+ only** — TLS 1.0/1.1 disabled
- [ ] **HSTS enabled** — `max-age=31536000; includeSubDomains; preload`
- [ ] **SSL rating A+** — verify at https://www.ssllabs.com/ssltest/
- [ ] **OCSP Stapling** — enabled in Nginx config
- [ ] **HTTP/2 enabled** — for performance

---

## 🛡️ HTTP Security Headers

Verify all present using https://securityheaders.com:

- [ ] `X-Frame-Options: SAMEORIGIN`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Content-Security-Policy` — configured (start restrictive, loosen as needed)
- [ ] `Permissions-Policy` — disable unused browser features
- [ ] `Strict-Transport-Security` — with preload

---

## 💾 Database

- [ ] **Strong DB password** — never `root` or `password`
- [ ] **MySQL user has minimal privileges** — only SELECT/INSERT/UPDATE/DELETE on `tribeconnect`
- [ ] **MySQL not exposed to internet** — bind to `127.0.0.1` only
- [ ] **Remote root login disabled** (`DISALLOW_ROOT_LOGIN`)
- [ ] **Anonymous users removed** (`DELETE FROM mysql.user WHERE User=''`)
- [ ] **Test databases removed** (`DROP DATABASE test`)
- [ ] **SQL queries use prepared statements** — all OSSN + custom queries parameterised
- [ ] **Database backups tested** — restore tested at least once
- [ ] **Backups stored off-server** — S3, Backblaze B2, etc.

---

## 📁 File System

- [ ] **Installation directory removed** — `rm -rf /var/www/tribeconnect/installation/`
- [ ] **`.env` and config files unreadable by web** — outside web root or denied by Nginx
- [ ] **File permissions correct**:
  - Directories: `755`
  - PHP files: `644`
  - Config: `600`
  - Data/uploads: `775` (www-data owned)
- [ ] **Upload type validation** — only allow safe MIME types (images, video)
- [ ] **Upload size limited** — `50M` max
- [ ] **Uploaded files not executable** — uploads served from `/data/`, no PHP execution there
- [ ] **Symlink following disabled** in Nginx (`disable_symlinks on` in MySQL, `no-follow` in nginx if needed)

---

## 🔒 Input Validation & XSS

- [ ] **All user input sanitised** before storage
- [ ] **All output HTML-encoded** — `htmlspecialchars()` used consistently
- [ ] **CSRF tokens** on all forms (OSSN provides this via `ossn_form_token()`)
- [ ] **SQL injection** — only parameterised queries (no string interpolation in SQL)
- [ ] **Open redirect prevention** — validate redirect URLs are same-origin
- [ ] **File path traversal prevention** — validate uploaded filenames

---

## 📧 Email

- [ ] **SPF record configured** for your domain
- [ ] **DKIM signing** enabled on outbound email
- [ ] **DMARC policy** set to `reject` after testing
- [ ] **Email unsubscribe** working (CAN-SPAM compliance)
- [ ] **Password reset links expire** — within 15 minutes

---

## 🔑 API & Tokens

- [ ] **API rate limiting** — implemented for all endpoints
- [ ] **JWT secret** is random, at least 64 chars
- [ ] **API keys hashed** in database (never stored plain)
- [ ] **Stripe webhook signature verified** — don't process unverified webhooks
- [ ] **Admin API** behind authentication middleware

---

## 🚨 Monitoring & Incident Response

- [ ] **Error logging enabled** — PHP errors go to log, not screen
- [ ] **Uptime monitoring** configured (alert within 1 minute)
- [ ] **Failed login alerts** — admin notified of brute-force attempts
- [ ] **Intrusion detection** — fail2ban configured for SSH and Nginx
- [ ] **Log retention** — access/error logs kept 90 days minimum
- [ ] **Incident response plan** documented and team knows the process
- [ ] **Vulnerability disclosure policy** published (`/security` page)

---

## 🔄 Updates & Maintenance

- [ ] **OSSN kept updated** — subscribe to https://github.com/opensource-socialnetwork/opensource-socialnetwork/releases
- [ ] **PHP kept updated** — patch releases applied within 2 weeks
- [ ] **Dependencies audited** — run `composer audit` (if using Composer)
- [ ] **SSL certificate auto-renews** — certbot timer enabled
- [ ] **Backup restoration tested** quarterly

---

## 📋 Legal & Compliance

- [ ] **Privacy Policy published** — covers data collection, GDPR, CCPA
- [ ] **Terms of Service published** — covers acceptable use, DMCA
- [ ] **Cookie consent** — banner if using analytics cookies
- [ ] **GDPR data export/delete** — users can request data export and deletion
- [ ] **COPPA compliance** — age gate if platform accessible to minors
- [ ] **DMCA process** — contact email published for takedown requests
- [ ] **Data Processing Agreement (DPA)** — signed with sub-processors (Stripe, AWS, etc.)

---

## Score Your Security

Run these tools against your live site:

| Tool | URL | Target |
|------|-----|--------|
| SSL Labs | https://ssllabs.com/ssltest/ | A+ |
| Security Headers | https://securityheaders.com | A |
| Mozilla Observatory | https://observatory.mozilla.org | A |
| Have I Been Pwned API | Integrate in registration | Block breached passwords |

---

*Last reviewed: <?php echo date('Y-m-d'); ?> — Review quarterly.*
