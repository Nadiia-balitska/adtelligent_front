(function earlyLoadPrebidAndGpt() {
  (function loadGptEarly() {
    if (window.googletag?.apiReady) return;
    window.googletag = window.googletag || { cmd: [] };
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
    document.head.appendChild(s);
  })();

  (function loadPrebidEarly() {
    if (window.pbjs?.requestBids) return; 
    window.pbjs = window.pbjs || {};
    window.pbjs.que = window.pbjs.que || [];
    const s = document.createElement('script');
    s.async = true;
    s.src = '/prebid.js';
    document.head.appendChild(s);
  })();
})();
