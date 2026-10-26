# Kavya Labs · Week 3: Admin dashboard

Week 3 of the Kavya Labs build (Finlatics ANDP Virtual Startup simulator). It adds an **admin dashboard with user management and analytics** on top of the Week 1 landing page and the Week 2 Google sign-in.

> Week 3 brief from the founder, Rohan Mehta: *Admin dashboard: user management + analytics.*

## How to test it (no sign-in needed)

1. Open **`/admin/demo`**. It's linked from the navbar ("Admin demo"), the footer and the login page. This is the **real admin dashboard**, filled with 48 generated sample users (all `@example.com`). Changes there are local and not saved.
2. **Analytics tab:** KPI cards, daily sign-up and sign-in charts for the last 30 days, role and status breakdowns, most active users.
3. **Users tab:** search, filter by role or status, sort, paginate, **Make admin / Remove admin**, **Suspend / Reactivate**, **Delete** and **Export CSV**.
4. **`/admin`** is the live dashboard. Signed-out visitors are redirected to `/login?callbackUrl=%2Fadmin`; signed-in non-admins see an "Admins only" page.
5. **`/api/admin/users/:id`** returns `401` without a session and `403` for non-admins.

## Features

### User management
| Feature | Details | File |
|---|---|---|
| **User list** | Avatar, name, email, role, status, sign-in count, join date, last active | `components/admin/UsersTable.jsx` |
| **Search, filter, sort, paginate** | Search name/email; filter role and status; sort by newest, oldest, recently active, most sign-ins, name; 10 per page | `components/admin/UsersTable.jsx` |
| **Change role** | Promote to admin or demote to member | `pages/api/admin/users/[id].js` |
| **Suspend / reactivate** | Suspended users are blocked at sign-in with a clear message | `pages/api/admin/users/[id].js`, `lib/auth.js` |
| **Delete user** | With a confirmation prompt; their sign-in history is deleted too | `pages/api/admin/users/[id].js` |
| **Export CSV** | Downloads the current filtered list | `components/admin/UsersTable.jsx` |
| **Guard rails** | Admins can't change their own account, and owner admins (`ADMIN_EMAILS`) can't be changed from the UI | `pages/api/admin/users/[id].js` |

### Analytics
| Metric | Details |
|---|---|
| **Total users** | With admin and suspended counts |
| **New users (7 days)** | With % change vs the previous 7 days |
| **Active users (7 days)** | Unique users who signed in, with % change |
| **Sign-ins (30 days)** | Every Google sign-in is logged in a `LoginEvent` table |
| **Daily charts** | New sign-ups per day and sign-ins per day, last 30 days (India time) |
| **Breakdowns** | Members vs admins, active vs suspended |
| **Most active users** | Top 5 by sign-ins in 30 days |

All metrics come from one pure function, `lib/analytics.js`, used by both the live dashboard and the demo. Charts are lightweight SVG with no chart library.

### Security
- **Role-based access control:** `/admin` and the admin API check the role **in the database on every request**, not just the session cookie, so a demoted or suspended admin loses access immediately.
- **NextAuth middleware** protects `/dashboard` and `/admin`.
- **Owner admins** come from `ADMIN_EMAILS`; others are promoted from the dashboard.

## Data model (Prisma)

```prisma
model User {
  id, email (unique), name, image,
  role        "user" | "admin"
  status      "active" | "suspended"
  loginCount, createdAt, lastLoginAt
  logins      LoginEvent[]
}

model LoginEvent {
  id, userId → User (cascade delete), createdAt
}
```

## Everything so far

- **Week 1:** landing page (hero, features, how it works, pricing, FAQ, footer)
- **Week 2:** NextAuth + Google OAuth, protected `/dashboard`, users saved with Prisma
- **Week 3:** admin dashboard, user management, analytics, role-based access, public demo

## Tech stack

Next.js 14 (Pages Router) · NextAuth.js v4 · Google OAuth 2.0 · Prisma · Supabase Postgres · Tailwind CSS · Vercel

## Setup

Same as Week 2. See `.env.example`: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS`, `DATABASE_URL`, `DIRECT_URL`.
Add `<your-site>/api/auth/callback/google` as an authorized redirect URI on the Google OAuth client.

Tables are created automatically on each build (`scripts/db-push.js`) in a separate `kavya_week3` Postgres schema, so the database can be shared with other projects and with the Week 2 deployment safely.
