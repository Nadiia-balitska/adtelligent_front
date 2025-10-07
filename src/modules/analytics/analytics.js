const API_BASE = (window?.ENV?.VITE_API_URL || "https://adtelligentback-production.up.railway.app").replace(/\/+$/, "");
const ANALYTICS_URL = `${API_BASE}/stat/events`;

function buildEventData(eventData) {
  return {
    ...eventData,
    timestamp: Date.now(),
    page: window.location.href,
    userAgent: navigator.userAgent,
  };
}

function sendStatistics(eventData) {
  const payload = JSON.stringify(buildEventData(eventData));

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon(ANALYTICS_URL, blob);
  } else {
    fetch(ANALYTICS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch((err) => console.error("Failed to send analytics:", err));
  }
}

window.addEventListener("load", () => {
  sendStatistics({ event: "load-page" });
});

sendStatistics({ event: "load-ad-module", module: "Prebid.js", version: "1.0.0" });

window.pbjs = window.pbjs || {};
window.pbjs.que = window.pbjs.que || [];

window.pbjs.que.push(() => {
  const prebidEvents = [
    "auctionInit",
    "auctionEnd",
    "bidRequested",
    "bidResponse",
    "bidWon",
  ];

  prebidEvents.forEach((eventName) => {
    window.pbjs.onEvent(eventName, (eventArgs) => {
      const eventPayload = {
        event: eventName,
        auctionId: eventArgs?.auctionId || eventArgs?.auction?.auctionId || null,
        adUnitCode: eventArgs?.adUnitCode || eventArgs?.adUnit?.code || null,
        bidder: eventArgs?.bidder || eventArgs?.bidderCode || null,
        cpm: typeof eventArgs?.cpm === "number" ? eventArgs.cpm : eventArgs?.price || null,
        creativeId: eventArgs?.creativeId || eventArgs?.crid || eventArgs?.bid?.creativeId || null,
        size: eventArgs?.size || [eventArgs?.width, eventArgs?.height].filter(Boolean).join("x") || null,
        currency: eventArgs?.currency || eventArgs?.cur || null,
      };

      sendStatistics(eventPayload);
    });
  });
});
