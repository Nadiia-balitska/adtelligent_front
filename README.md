# Ads Module (Lecture 4)

## Как запустить
- `cp .env.example .env` и выставить:
  - `VITE_ENABLE_ADS=true` — Prebid-модуль
  - `VITE_ENABLE_ADS=false` — реклама выключена
  - `VITE_ENABLE_ADS_GOOGLE=true` — *второй модуль через Google* (без Prebid)
- `npm run dev` / `build`

## Архитектура
- Виртуальный импорт `virtual:ads` (Vite plugin) подменяет экспорт в зависимости от env.
- Prebid-модуль: `src/ads/prebid/*` (2 ad units, Adtelligent + Bidmatic).
- GPT-интеграция: `google-gpt.ts` (disableInitialLoad → setTargetingForGPTAsync → display/refresh).
- Страница логов: `AdsLogsView.tsx` (подписка на `pbjs.onEvent` + дамп `pbjs.getEvents()`).

## Ивенты и логи
- Подписки: `auctionInit`, `bidRequested`, `bidResponse`, `auctionEnd`, `bidWon`, `adRender*`, `setTargeting`, `bidTimeout`.
- Почему рендер «на bidWon» не сработал:
  - `bidWon` приходит *когда рендер уже вызван* (обычно GPT-креатив вызывает `pbjs.renderAd`).
  - Без корректных prebid-креативов в GAM и без `setTargetingForGPTAsync()`/`display()` событие не придет и показ не состоится. :contentReference[oaicite:5]{index=5}

## pbjs.getHighestCpmBids vs onEvent('bidResponse')
- `onEvent('bidResponse')` — поток для логов и аналитики в реальном времени.
- `getHighestCpmBids` — снимок победителей после аукциона; в 3.x не возвращает уже отрендеренные биды. Используем после `requestBids`. :contentReference[oaicite:6]{index=6}

## Рефреш
- Prebid: повторный `requestBids` → `setTargetingForGPTAsync()` → `googletag.pubads().refresh()`.
- Google-модуль: периодический `googletag.pubads().refresh()`.

## Ссылки
- Publisher API + Events: Prebid.org :contentReference[oaicite:7]{index=7}  
- Adapters: Adtelligent, Bidmatic :contentReference[oaicite:8]{index=8}  
- GPT guide: Google Developers :contentReference[oaicite:9]{index=9}

