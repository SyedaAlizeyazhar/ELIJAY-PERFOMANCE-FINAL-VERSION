# Elijah Performance Partners — Rebuild

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion rebuild of
the Elijah Performance Partners site, with a Google Sheets lead pipeline and a
hidden admin portal backed by Vercel KV.

> **Design note:** the color palette (dark navy/black background, blue→cyan
> gradient accent, gold for payouts) was recreated to match the "premium dark
> pay-per-call network" feel described for the original site. I wasn't able to
> pull the exact CSS/hex values or fonts from the live URL, so if you have the
> original stylesheet, screenshots, or brand guide, send them over and the
> tokens in `tailwind.config.ts` / `app/globals.css` can be tuned to match
> exactly.

## 1. Install

```bash
npm install
cp .env.example .env.local
```

## 2. Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SHEET_WEBHOOK_URL` | Yes | Endpoint (e.g. a Google Apps Script Web App URL) that all 4 lead forms POST to. |
| `NEXT_PUBLIC_GOOGLE_SHEET_URL` | No | If set, shows an "Open Sheet" button on the admin Leads tab. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Yes | From a Vercel KV (Upstash Redis) store — used only for Offers/Verticals. |
| `ADMIN_PASSWORD` | Yes | Password for `/admin-elite-elijah-2024`. |
| `ADMIN_SESSION_SECRET` | Yes | Long random string used to sign the admin session cookie. |

### Setting up the Google Sheet webhook

The simplest option is a Google Apps Script bound to your Sheet:

1. In your Sheet, go to **Extensions → Apps Script**.
2. Paste a script that reads `e.postData.contents` as JSON, and appends a row
   to the tab named by `sheetName` (creating the tab if it doesn't exist),
   writing `timestamp` plus the rest of the fields.
3. Deploy it as a **Web App** (execute as you, accessible to "Anyone"), and
   copy the `/exec` URL into `NEXT_PUBLIC_SHEET_WEBHOOK_URL`.

The four tabs the app writes to: `Offer_Applications`, `Publishers_Data`,
`Buyers_Data`, `Contact_Queries`.

### Publisher logins (offers are private)

`/offers`, `/offers/[id]`, `/api/offers` and the home-page offers preview are
only visible to approved publishers who are logged in at `/publisher-login`.

1. A publisher applies; their row lands in `Publishers_Data` with
   **Status = Pending**.
2. A team member sets Status to **Approved**. The Apps Script writes a
   username (from the company name, e.g. "Hay Solution" → `haysolution`) and
   an 8-character password into the row and calls `/api/publishers/sync`,
   which stores the account in KV (password hashed with PBKDF2).
3. The team sends the username/password to the publisher.
4. Setting Status to **Rejected** or **Pending** turns the login off
   immediately. To reset a password, clear the Password cell and set Status
   to Approved again.

Requires `PUBLISHER_SYNC_SECRET` on Vercel, and the same value as
`SYNC_SECRET` (plus `SITE_URL`) in the Apps Script's Script Properties. Run
the script's `setup` function once to add the Status dropdown and the
approval trigger.

### Setting up Vercel KV

1. In your Vercel project → **Storage** → **Create Database** → **KV**.
2. Connect it to this project — Vercel injects `KV_REST_API_URL` and
   `KV_REST_API_TOKEN` automatically for you (also copy them into
   `.env.local` for local dev).

## 3. Run locally

```bash
npm run dev
```

## 4. Admin portal

- URL: `/admin-elite-elijah-2024` (not linked anywhere in the UI)
- Auth: single shared password (`ADMIN_PASSWORD`), session stored in a signed,
  httpOnly cookie (8-hour expiry)
- Inside the dashboard:
  - **Offers** — add/edit/delete campaigns, toggle Active/Paused. Only
    `status: "active"` offers show on the public `/offers` page.
  - **Verticals** — add/delete verticals; these populate every dropdown and
    multi-select across the public forms.
  - **Leads** — the 4 lead forms write straight to your Google Sheet, so this
    tab is a pointer/link to that sheet rather than a duplicate data store.

## 5. Project structure

```
app/
  page.tsx                          Home
  offers/page.tsx                   Live offers, filterable by vertical
  offers/[id]/page.tsx              Offer detail + apply form
  apply-as-publisher/page.tsx
  for-buyers/page.tsx
  contact/page.tsx
  admin-elite-elijah-2024/page.tsx  Hidden admin login
  admin-elite-elijah-2024/dashboard/page.tsx
  api/leads/route.ts                Forwards any form to the Sheet webhook
  api/offers/route.ts               Public: active offers (KV)
  api/verticals/route.ts            Public: verticals list (KV)
  api/admin/**                      Password-gated CRUD for offers/verticals
components/
  ui/                               Hand-built shadcn-style primitives
  site/                             Navbar, footer, motion helpers, offers grid
  forms/                            The 4 lead-capture forms
  admin/                            Dashboard shell + managers
lib/
  kv.ts                             Vercel KV read/write helpers
  sheet.ts                          Google Sheet webhook sender
  admin-auth.ts                     Signed-cookie session (Edge + Node safe)
  types.ts
middleware.ts                       Protects /admin-elite-elijah-2024/dashboard
```

## 6. Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Add all the environment variables above in **Project Settings → Environment
   Variables**.
3. Attach a Vercel KV store to the project (see above).
4. Deploy. The admin portal and public site are on the same deployment; the
   admin route is simply not linked from the nav.

## Known follow-ups

- This was built without the ability to `npm install` or run a build in the
  authoring environment (no network access there), so dependency versions
  are pinned to recent, compatible releases but the project hasn't been
  build-verified end-to-end. Run `npm install && npm run build` after
  downloading to catch anything environment-specific.
- Toast notifications use `sonner`. Swap in shadcn's own `toast` if you'd
  rather match a shadcn CLI install 1:1.
