/** biome-ignore-all lint/complexity/useArrowFunction: <explanation> */
(function () {
  const API_BASE =
    (window?.ENV?.VITE_API_URL || "https://adtelligentback-production.up.railway.app").replace(/\/+$/, "");
  const ANALYTICS_URL = `${API_BASE}/stat/events`;

  const uid = (() => {
    try {
      const k = "stat_uid";
      const v = localStorage.getItem(k) || (crypto?.randomUUID?.() || String(Date.now()) + Math.random());
      localStorage.setItem(k, v);
      return v;
    } catch { return ""; }
  })();

  function nowTs() {
    return Date.now();
  }

  function buildEventData(event, extra) {
    return {
      event,                             
      timestamp: nowTs(),               
      page: location.href,
      referer: document.referrer || "",
      userAgent: navigator.userAgent,
      userId: uid,
      ...extra,
    };
  }

  function send(payloadObj) {
    const body = JSON.stringify(payloadObj);

    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(ANALYTICS_URL, blob);
        return;
      } catch {}
    }
    fetch(ANALYTICS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "omit",
      cache: "no-store",
    }).catch(() => {});
  }

  function sendEvent(name, extra) {
    send(buildEventData(name, extra));
  }

  if (document.readyState === "complete") {
    sendEvent("Load - страницы");
  } else {
    window.addEventListener("load", () => sendEvent("Load - страницы"), { once: true });
  }

  const pageHideHandler = () => sendEvent("pagehide", { reason: "close" });
  window.addEventListener("pagehide", pageHideHandler, { once: true });

  function onPrebidReady(cb) {
    window.pbjs = window.pbjs || {};
    window.pbjs.que = window.pbjs.que || [];
    if (typeof window.pbjs.onEvent === "function") {
      cb();
    } else {
      window.pbjs.que.push(cb);
    }
  }

  onPrebidReady(() => {
    sendEvent("Load - ad module", {
      module: "Prebid.js",
      version: (window.pbjs?.version) || undefined,
    });

    const EVENTS = ["auctionInit", "auctionEnd", "bidRequested", "bidResponse", "bidWon"];

    const get = (obj, pathArr) => pathArr.reduce((a, k) => (a && a[k] != null ? a[k] : undefined), obj);

    EVENTS.forEach((evt) => {
      try {
        window.pbjs.onEvent(evt, (args) => {
          const payload = {
            auctionId: get(args, ["auctionId"]) || get(args, ["auction", "auctionId"]) || undefined,
            adUnitCode: get(args, ["adUnitCode"]) || get(args, ["adUnit", "code"]) || undefined,
            bidder: get(args, ["bidder"]) || get(args, ["bidderCode"]) || undefined,
            creativeId:
              get(args, ["creativeId"]) || get(args, ["crid"]) || get(args, ["bid", "creativeId"]) || undefined,
            currency: get(args, ["currency"]) || get(args, ["cur"]) || undefined,
            cpm:
              typeof get(args, ["cpm"]) === "number"
                ? get(args, ["cpm"])
                : typeof get(args, ["price"]) === "number"
                ? get(args, ["price"])
                : undefined,
            size:
              get(args, ["size"]) ||
              [get(args, ["width"]), get(args, ["height"])].filter(Boolean).join("x") ||
              undefined,
          };

          sendEvent(evt, payload);
        });
      } catch (e) {
      }
    });
  });
})();
