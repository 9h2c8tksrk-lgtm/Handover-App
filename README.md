# Handover-App

Shift handover app for the workshop crew. A single `index.html` — host it anywhere static (e.g. GitHub Pages).

## Cross-device sync

Sign-ons, PINs, handovers and planner tasks sync across devices through the
same Supabase project the app already uses for the Parts Tracker catalogue.

One-time setup: open the Supabase project's **SQL Editor**, paste the contents
of [`supabase-sync.sql`](./supabase-sync.sql), and run it. That creates the
`handover_sync` table with the row-level-security policies the app needs.

How it works:

- Every change (sign on/off, new PIN, handover, planner task) is queued
  locally and pushed to Supabase; devices pull changes every 20 seconds and
  whenever the page regains focus.
- The app stays fully usable offline — changes queue in `localStorage` and
  sync when the connection returns. The header shows the sync status
  (`☁ synced`, `⇡ n to sync`, or `⚠ sync offline`).
- Signing on from one device signs the person on everywhere; signing off
  brings the sign-on screen back on the other devices.
- A PIN set on one device works on every device. Deletes are synced as
  tombstones so they propagate too.

Note: the sync table is writable with the app's publishable key (no login),
which suits a small trusted crew on shared devices. Access control within the
app is the sign-on PIN.
