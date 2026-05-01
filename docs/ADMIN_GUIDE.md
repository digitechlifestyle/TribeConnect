# TribeConnect — Admin Guide

## Accessing the Admin Panel

URL: `https://yourdomain.com/administrator`

Use the admin credentials you set during OSSN installation.

---

## Dashboard Overview

The admin panel sidebar includes:

| Section | URL | Purpose |
|---------|-----|---------|
| Dashboard | `/administrator` | Site overview |
| Analytics | `/administrator/analytics` | User growth, post activity |
| Moderation | `/administrator/moderation` | User management, ban/suspend |
| Reports | `/administrator/reports` | User-reported content |
| Revenue | `/administrator/revenue` | Payments & subscriptions |
| Verification | `/administrator/verification` | Badge request queue |
| Ads Manager | `/administrator/ads` | All advertising campaigns |
| Premium | `/administrator/premium` | Membership overview |
| Themes | `/administrator/themes` | Activate/manage themes |
| Components | `/administrator/components` | Enable/disable components |
| Settings | `/administrator/settings` | Site configuration |
| Users | `/administrator/users` | User directory |

---

## User Moderation

### Ban a user
1. Go to **Moderation** → find the user
2. Click **Ban** → user is immediately locked out
3. OR direct URL: `/administrator/moderation/ban/{user_guid}`

### Unban a user
Direct URL: `/administrator/moderation/unban/{user_guid}`

### Delete content
1. Go to the post/comment on the live site
2. Admin controls appear (delete, hide buttons) when logged in as admin

---

## Reports Queue

1. Go to **Admin → Reports**
2. Each report shows: reporter, content type, reason, date
3. Actions:
   - **Dismiss** — mark as not a violation
   - **Remove Content** — delete reported post/comment
   - **Warn User** — send warning email
   - **Ban User** — ban the offending account

---

## Verification Queue

1. Go to **Admin → Verification**
2. Review each application:
   - Legal name submitted
   - Account type (individual/business/creator)
   - Supporting information provided
3. **Approve** — adds verified badge (✓) to profile
4. **Deny** — application rejected, user can reapply in 30 days

---

## Premium Membership Management

### View active subscribers
Go to **Admin → Premium** for a full table of memberships.

### Grant free premium
Via database (emergency/manual):
```sql
UPDATE ossn_users SET premium_plan = 'pro' WHERE guid = [USER_GUID];
INSERT INTO tc_premium_memberships (user_guid, plan, status, billing_cycle, price, started_at, renews_at)
VALUES ([GUID], 'pro', 'active', 'monthly', 0.00, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH));
```

### Stripe webhook setup
1. Log in to Stripe Dashboard
2. Go to Webhooks → Add endpoint
3. URL: `https://yourdomain.com/action/premium/webhook`
4. Events to listen: `invoice.payment_succeeded`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## Ads Manager

### Approve a campaign
1. Go to **Admin → Ads Manager**
2. Find campaigns with status **Pending Review**
3. Review ad creative, destination URL, targeting
4. Click **Approve** to make live, or **Reject** with reason

### Ad placement options
| Placement | Description | Best for |
|-----------|-------------|---------|
| `feed` | Appears every 5 posts in newsfeed | Awareness |
| `sidebar` | Right column widget | Direct response |
| `banner` | Top of pages | Brand awareness |
| `search` | In search results | Intent targeting |

---

## Analytics Dashboard

**Key metrics shown:**
- Total users & daily new registrations
- Total posts & daily post activity
- User growth chart (30 days)
- Revenue this month
- Active premium subscribers
- Pending reports
- Active ads

**Export data:**
Go to `/administrator/analytics?export=csv` for a CSV download.

---

## Site Settings

### Required settings (Admin → Settings)
- **Site name** — displayed in topbar and emails
- **Site URL** — must match your domain exactly (no trailing slash)
- **From email** — used in all outgoing emails
- **SMTP settings** — required for email delivery
- **Registration** — open/invite-only/closed

### Recommended settings
- **Profanity filter** — enable for community safety
- **Email verification** — require before first post
- **Post character limit** — set to 5000
- **Photo size limit** — 10MB per upload
- **Max photos per post** — 10

---

## Plugin/Theme Updates

1. Download updated `.zip` from official source
2. Extract to `/var/www/tribeconnect/themes/` or `/components/`
3. Clear OSSN cache: **Admin → Settings → Clear Cache**
4. Test in staging environment before production

---

## Emergency Procedures

### Site down — PHP error
```bash
sudo tail -100 /var/log/nginx/tribeconnect.error.log
sudo tail -100 /var/log/php/tribeconnect.log
```

### Site down — DB connection
```bash
sudo systemctl status mysql
sudo mysql -u root -p -e "SHOW PROCESSLIST;"
```

### Force admin password reset
```sql
UPDATE ossn_users
SET password = SHA1(CONCAT(salt, 'new_password_here'))
WHERE email = 'admin@yourdomain.com';
```
*(Use the OSSN password hashing method from `classes/OssnUser.php`)*

### Disable maintenance mode
```bash
# Create maintenance flag
touch /var/www/tribeconnect/maintenance.flag

# Remove maintenance flag
rm /var/www/tribeconnect/maintenance.flag
```
