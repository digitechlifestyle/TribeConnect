# TribeConnect

> A premium community social media platform built on [OSSN](https://www.opensource-socialnetwork.org/) (Open Source Social Network).

---

## What's Included

### 🎨 TribeConnect Theme (`themes/tribeconnect/`)
A ground-up modern theme replacing the default GoBlue theme.

| Feature | Details |
|---------|---------|
| **Mobile-first responsive** | Fluid grid, mobile bottom nav bar, hamburger sidebar |
| **Dark / Light mode** | One-click toggle, persisted in `localStorage`, no flash |
| **Design system** | CSS custom properties, consistent spacing, typography, shadows |
| **Verification badges** | Purple ✓ badge inline on names across all views |
| **Notification dropdown** | Topbar bell icon (OSSN native) |
| **Post composer** | Quick-post bar with photo/feeling/location triggers |
| **Topbar search** | Persistent desktop search, slide-down drawer on mobile |
| **Premium sidebar card** | Upsell for free users, gold badge for subscribers |
| **Admin panel skin** | Full custom admin sidebar + stats card layout |
| **Toast system** | Animated dismissible notifications (success/error/info) |

### 💎 TribeConnect Premium (`components/TribeConnectPremium/`)

**3-tier pricing:**

| Tier | Price | Highlights |
|------|-------|-----------|
| Free | $0 | Basic social features |
| Pro | $9.99/mo | Ad-free, Pro badge, priority support, custom themes |
| Creator | $24.99/mo | Everything in Pro + monetisation, subscriber mgmt, analytics, affiliate section |

- Stripe-ready subscription logic
- Premium badge on profiles and topbar
- Ad-free experience for Pro/Creator users
- Creator tools gated to Creator plan

### 📢 TribeConnect Ads Manager (`components/TribeConnectAds/`)
- Self-serve campaign creation
- Placements: **feed**, **sidebar**, **banner**, **search**
- Billing models: **CPM** and **CPC**
- Daily + total budget caps
- Impression & click tracking
- Sponsored post injection (every 5 posts, skipped for premium users)
- Admin approve/reject workflow
- Full campaign analytics

### 📊 TribeConnect Analytics (`components/TribeConnectAnalytics/`)
- **Admin dashboard**: users, posts, revenue, reports, active ads
- **User growth chart** (30-day)
- **Moderation panel**: ban/unban users, view all accounts
- **Reports queue**: review, dismiss, or action reported content
- **Revenue panel**: all payments with status

### ✅ TribeConnect Verification (`components/TribeConnectVerification/`)
- Users apply at `/verification/apply`
- Admin reviews queue at `/administrator/verification`
- Approve → purple ✓ badge appears on profile + topbar
- Deny with reason → user notified

### 🎬 TribeConnect Creator Subscriptions (`components/TribeConnectCreatorSubs/`)
- Creators define subscription tiers (name, price, perks)
- Subscribers pay monthly per tier
- Creator dashboard: subscribers, revenue, tier management
- **Affiliate product showcase** on creator profiles
- Exclusive content gating hooks

---

## File Structure

```
TribeConnect/
├── themes/
│   └── tribeconnect/
│       ├── ossn_theme.xml          # Theme manifest
│       ├── ossn_theme.php          # Theme bootstrap
│       ├── locale/ossn.en.php      # English strings
│       └── plugins/default/
│           ├── css/core/default.php     # Full design system CSS
│           ├── js/tribeconnect.php      # Theme JS (theme, sidebar, toasts)
│           └── theme/page/
│               ├── page.php                    # Main HTML shell
│               └── elements/
│                   ├── topbar.php              # Top navigation
│                   ├── sidebar.php             # Left sidebar
│                   ├── footer.php              # Footer + mobile nav
│                   └── system_messages.php     # Toast messages
│               └── layout/
│                   ├── newsfeed.php            # Feed + widgets layout
│                   ├── startup.php             # Login/register layout
│                   └── administrator/
│                       └── administrator.php   # Admin panel layout
│
├── components/
│   ├── TribeConnectPremium/        # 3-tier membership
│   ├── TribeConnectAds/            # Self-serve ads manager
│   ├── TribeConnectAnalytics/      # Admin analytics & moderation
│   ├── TribeConnectVerification/   # Badge verification system
│   └── TribeConnectCreatorSubs/    # Creator monetisation
│
├── installation/
│   └── sql/
│       └── tribeconnect.sql        # Custom tables schema
│
└── docs/
    ├── INSTALL.md                  # Step-by-step install guide
    ├── DEPLOY.md                   # VPS/Docker/AWS deployment
    ├── SECURITY_CHECKLIST.md       # Pre-launch security audit
    └── ADMIN_GUIDE.md              # Admin panel usage
```

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/yourorg/tribeconnect.git

# 2. Deploy to server (see docs/INSTALL.md)
rsync -avz --exclude='.git' . user@yourserver:/var/www/tribeconnect/

# 3. Run OSSN web installer
open https://yourdomain.com

# 4. Import custom tables
mysql -u tc_user -p tribeconnect < installation/sql/tribeconnect.sql

# 5. Activate theme + components in Admin panel

# 6. Remove installer
rm -rf /var/www/tribeconnect/installation/
```

---

## Documentation

| Doc | Description |
|-----|-------------|
| [INSTALL.md](docs/INSTALL.md) | Full installation guide (Nginx, MySQL, SSL, cron) |
| [DEPLOY.md](docs/DEPLOY.md) | VPS, Docker, AWS deployment + zero-downtime deploy script |
| [SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md) | Pre-launch security audit (60+ checks) |
| [ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) | Admin panel usage, moderation, Stripe setup |

---

## Tech Stack

- **Backend**: PHP 8.2, OSSN Framework
- **Database**: MySQL 8.0
- **Cache**: Redis (sessions + object cache)
- **Frontend**: Vanilla JS, CSS custom properties (no framework needed)
- **Icons**: Font Awesome 6
- **Fonts**: Inter (Google Fonts)
- **Payments**: Stripe (webhook-based)
- **Media CDN**: S3 + CloudFront (optional)

---

## License

The TribeConnect theme and components are MIT licensed.
OSSN core is licensed under the [OSSN License](https://www.opensource-socialnetwork.org/licence).
