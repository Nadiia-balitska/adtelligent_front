/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: Prebid queues run later */
/** biome-ignore-all lint/correctness/noUnusedFunctionParameters: <explanation> */
/** biome-ignore-all lint/complexity/useArrowFunction: <explanation> */

import { AD_UNITS, SLOT_DEFS } from "./ad-units";
import { loadGpt, defineSlots, displayAll, refreshAllGpt } from "./google-gpt";
import "../../analytics/analytics";

const PREBID_SRC = "/prebid.js";

function loadPrebid() {
  return new Promise((resolve, reject) => {
    if (window.pbjs?.requestBids) return resolve();

    window.pbjs = window.pbjs || {};
    window.pbjs.que = window.pbjs.que || [];

    const s = document.createElement("script");
    s.async = true;
    s.src = PREBID_SRC;
    s.onload = resolve;
    s.onerror = () => {
      console.error("Prebid failed to load:", PREBID_SRC);
      reject(new Error("prebid load error"));
    };
    document.head.appendChild(s);
  });
}

function applyPrebidConfigForDev() {
  window.pbjs.que.push(() => {
    window.pbjs.setConfig({
      debug: true,
      bidderTimeout: 1000,
      
    });
  });
}

function wireEventsForLogs() {
  const events = [
    "auctionInit",
    "bidRequested",
    "bidResponse",
    "bidAdjustment",
    "auctionEnd",
    "bidWon",
    "adRenderSucceeded",
    "adRenderFailed",
    "setTargeting",
    "bidTimeout",
  ];

  window.pbjs.que.push(() => {
    events.forEach((ev) =>
      window.pbjs.onEvent(ev, (args) => {
        window.__prebidLogs = window.__prebidLogs || [];
        const rec = { ts: Date.now(), event: ev, args };
        window.__prebidLogs.push(rec);
        if (typeof window.__pushPrebidLog === "function") window.__pushPrebidLog(rec);
      })
    );
  });

// ? чому не рендерилось на bidWon: 
// бо bidWon приходить раніше, а рендер вже викликано 
// (він автоматично через pbjs.renderAd робиться).
// Якщо не зробити pbjs.setTargetingForGPTAsync() і потім display()/refresh(), то bidWon може не виконатись і банер не з’явиться.
}

// function auction() {
//   window.pbjs = window.pbjs || {};
//   window.pbjs.que = window.pbjs.que || [];

//   AD_UNITS.forEach((adUnit) => {
//     pbjs.addAdUnits([adUnit]);

//     pbjs.requestBids({
//       timeout: 1000,
//       bidsBackHandler: function (bidResponses) {
//         const winningAd = pbjs.getHighestCpmBids(adUnit.code)[0];

//         const iframe = document.getElementById(adUnit.code);
// // debugger
//         if (!(iframe instanceof HTMLIFrameElement)) {
//           const iframe = document.createElement("iframe");
// iframe.id = adUnit.code;
// iframe.width = adUnit.mediaTypes.banner.sizes[0][0];
// iframe.height = adUnit.mediaTypes.banner.sizes[0][1];
// iframe.frameBorder = "0";
// document.body.appendChild(iframe);

//         }
//        const iframeDoc =
//           (iframe.contentDocument || iframe.contentWindow?.document);
//         if (!iframeDoc) return;

//         iframeDoc.open();
//         iframeDoc.close();
//         pbjs.renderAd(iframeDoc, winningAd.adId || winningAd.ad || winningAd.adm || winningAd.requestId);

//       }
//     });
//   });
// }
function auction() {
  window.pbjs = window.pbjs || {};
  window.pbjs.que = window.pbjs.que || [];

  AD_UNITS.forEach((adUnit) => {
    pbjs.addAdUnits([adUnit]);

    pbjs.requestBids({
      timeout: 1500,
      adUnitCodes: [adUnit.code], 
      bidsBackHandler: function () {
        const bid = pbjs.getHighestCpmBids(adUnit.code)[0];
        console.log("[prebid] winning bid for", adUnit.code, bid);

        if (!bid) {
          console.warn("[prebid] no bid for", adUnit.code);
          return;
        }

        let iframe = document.getElementById(adUnit.code);
        if (!(iframe instanceof HTMLIFrameElement)) {
          iframe = document.createElement("iframe");
          iframe.id = adUnit.code;
          const [w, h] = (adUnit.mediaTypes?.banner?.sizes?.[0] || [300, 250]);
          iframe.width = w;
          iframe.height = h;
          iframe.frameBorder = "0";
          iframe.style.display = "block";
          iframe.style.border = "0";
          document.body.appendChild(iframe);
        }

        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) {
          console.error("[prebid] no iframe document");
          return;
        }

        try {
          const idForRender =
            bid.adId || bid.requestId || bid.bidId || bid.request_id;
          console.log("[prebid] renderAd with id:", idForRender);
          pbjs.renderAd(doc, idForRender);
        } catch (e) {
          console.warn("[prebid] renderAd failed, fallback to raw HTML:", e);

          const html = bid.ad || bid.adm;
          if (html) {
            doc.open();
            doc.write(html);
            doc.close();
          } else {
            console.error("[prebid] no ad/ad m html found in bid");
          }
        }
      },
    });
  });
}



function setupAutoRefresh(ms) {
  if (!ms) return;

  setInterval(() => {
  
    window.pbjs.que.push(() => {
      window.pbjs.requestBids({
        timeout: 1000,
        adUnitCodes: AD_UNITS.map((u) => u.code),
        bidsBackHandler: () => {
          window.pbjs.setTargetingForGPTAsync();
          refreshAllGpt();
        },
      });
    });
  }, ms);
}

export async function initAds() {
  await Promise.all([loadPrebid(), loadGpt()]);

  defineSlots(SLOT_DEFS);

  applyPrebidConfigForDev();
  wireEventsForLogs();

  auction();

  setupAutoRefresh(60_000);
}
