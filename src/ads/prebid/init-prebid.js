import { AD_UNITS, SLOT_DEFS } from './ad-units';
import { loadGpt, defineSlots, displayAll, refreshAllGpt } from './google-gpt';

const PREBID_SRC = './public/prebid10.10.0.js';

function loadPrebid() {
  return new Promise((resolve) => {
    window.pbjs = window.pbjs || {};
    window.pbjs.que = window.pbjs.que || [];
    const s = document.createElement('script');
    s.async = true;
    s.src = PREBID_SRC;      
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

function wireEventsForLogs() {
  const events = [
    'auctionInit','bidRequested','bidResponse','bidAdjustment','auctionEnd',
    'bidWon','adRenderSucceeded','adRenderFailed','setTargeting','bidTimeout'
  ];
  window.pbjs.que.push(() => {
    // biome-ignore lint/suspicious/useIterableCallbackReturn: <explanation>
    events.forEach(ev => window.pbjs.onEvent(ev, (args) => {
      window.__prebidLogs = window.__prebidLogs || [];
      const rec = { ts: Date.now(), event: ev, args };
      window.__prebidLogs.push(rec);
      if (typeof window.__pushPrebidLog === 'function') window.__pushPrebidLog(rec);
    }));
  });

  
/! чому не рендерилось на bidWon: /
//     бо bidWon приходить раніше, а рендер вже викликано
//    (він автоматично через pbjs.renderAd робиться).
//    Якщо не зробити pbjs.setTargetingForGPTAsync() і потім display()/refresh(), то bidWon може не виконатись і банер не з’явиться.
  
}

function requestAuctionAndDisplay() {
  window.pbjs.que.push(() => {
    window.pbjs.addAdUnits(AD_UNITS);

    window.pbjs.requestBids({
      timeout: 1000,
      bidsBackHandler: () => {
        window.pbjs.setTargetingForGPTAsync();
        displayAll(SLOT_DEFS);
      }
    });
  });
}

function setupAutoRefresh(ms) {
  if (!ms) return;
  setInterval(() => {
    window.pbjs.que.push(() => {
      window.pbjs.requestBids({
        timeout: 1000,
        adUnitCodes: AD_UNITS.map(u => u.code),
        bidsBackHandler: () => {
          window.pbjs.setTargetingForGPTAsync();
          refreshAllGpt();
        }
      });
    });
  }, ms);
}

export async function initAds() {
  await Promise.all([loadPrebid(), loadGpt()]);

  defineSlots(SLOT_DEFS);

  wireEventsForLogs();

  requestAuctionAndDisplay();

  setupAutoRefresh(60_000);
}
