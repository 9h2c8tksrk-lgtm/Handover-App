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
- Several people can be signed on at the same time; each person signs
  themselves off with their own name and PIN. Sign-ons and sign-offs sync
  everywhere, and the sign-on screen comes back on all devices once nobody
  is left on shift.
- A PIN set on one device works on every device. Deletes are synced as
  tombstones so they propagate too.

Note: the sync table is writable with the app's publishable key (no login),
which suits a small trusted crew on shared devices. Access control within the
app is the sign-on PIN.

## Lightning warning

A small warning card appears when there's lightning activity near the Golden
Eagle mine site (Nullagine, WA):

- **Live strikes** stream from the free [Blitzortung.org](https://www.blitzortung.org)
  community detection network. Strikes within **20 km** in the last 30 minutes
  show an amber watch warning; within **5 km** a red danger warning, with
  strike count, nearest distance and time of last strike.
- **Forecast backup** from the free Open-Meteo API (checked every 15 min):
  if thunderstorms are forecast at the site in the next 12 hours, the card
  shows when they're expected — and notes if the live strike feed is offline.
- The card is hidden when there's nothing to warn about. Rings and site
  coordinates are set in the `LX` constant in `index.html`.
