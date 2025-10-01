const ANALYTICS_URL = "https://adtelligentback-production.up.railway.app/stat/events";


function sendStat(eventData) {
  const payload = JSON.stringify({
    ...eventData,
    timestamp: Date.now(),
    page: window.location.href,
    userAgent: navigator.userAgent,
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon(ANALYTICS_URL, blob);
  } else {
    fetch(ANALYTICS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  }
}


window.addEventListener("load", () => {
  sendStat({ event: "load-page" });
});


sendStat({ event: "load-ad-module", module: "Prebid.js", version: "1.0.0" });


window.pbjs = window.pbjs || {};
window.pbjs.que = window.pbjs.que || [];
window.pbjs.que.push(() => {
  const events = [
    "auctionInit",
    "auctionEnd",
    "bidRequested",
    "bidResponse",
    "bidWon",
  ];

  events.forEach((ev) => {
    window.pbjs.onEvent(ev, (args) => {
      sendStat({
        event: ev,
        auctionId: args?.auctionId,
        adUnitCode: args?.adUnitCode,
        bidder: args?.bidder,
        cpm: args?.cpm,
        creativeId: args?.creativeId,
        size: args?.size,
        currency: args?.currency,
      });
    });
  });
});
