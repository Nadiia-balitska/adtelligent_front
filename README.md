# Advertisement

- Prebid.js (custom build) with **Adtelligent** + **Bidmatic**
- Google Publisher Tag (GPT/GAM) rendering
- Virtual import with ENV toggles (enable/disable; switch to Google-only)
- Auction event logs page
- Auto-refresh for both modes
- Research notes (events, `bidWon`, `getHighestCpmBids` vs `onEvent('bidResponse')`, etc.)

## How to start
- `cp .env.example .env` and set:
  - `VITE_ENABLE_ADS=true` — enable the Prebid module
  - `VITE_ENABLE_ADS=false` — disable ads
  - `VITE_ENABLE_ADS_GOOGLE=true` — enable the second module via Google (without Prebid)
- Run: `npm run dev` or `npm run build`

## Architecture
- Virtual import `virtual:ads` (Vite plugin) swaps the export based on env.
- Prebid module: `src/ads/prebid/*` (two ad units, Adtelligent + Bidmatic).
- GPT integration: `google-gpt.ts` (flow: `disableInitialLoad` → `setTargetingForGPTAsync` → `display/refresh`).
- Logs page: `AdsLogsView.tsx` (subscribes to `pbjs.onEvent` + dumps `pbjs.getEvents()`).

## Events & logs
- Subscribed events: `auctionInit`, `bidRequested`, `bidResponse`, `auctionEnd`, `bidWon`, `adRender*`, `setTargeting`, `bidTimeout`.
- Why rendering didn’t happen “on `bidWon`”:
   because bidWon arrives earlier, and the render has already been invoked
  (it’s done automatically via pbjs.renderAd).
   If you don’t call pbjs.setTargetingForGPTAsync() and then display()/refresh(),
   bidWon may not fire and the banner will not appear.

## `pbjs.getHighestCpmBids` vs `onEvent('bidResponse')`
- `onEvent('bidResponse')` — real-time stream for logs and analytics.
- `getHighestCpmBids` — snapshot of winners after the auction; in 3.x it does not return already rendered bids. Use after `requestBids`.

## Refresh
- Prebid: run a new `requestBids` → `setTargetingForGPTAsync()` → `googletag.pubads().refresh()`.
- Google-only: periodic `googletag.pubads().refresh()`.

## Links
- Publisher API & Events — Prebid.org  
- Adapters — Adtelligent, Bidmatic  
- GPT guide — Google Developers
