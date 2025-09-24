export function loadGpt() {
  return new Promise((resolve) => {
    window.googletag = window.googletag || { cmd: [] };
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

export function defineSlots(slotDefs) {
  const g = window.googletag;
  g.cmd.push(() => {
    slotDefs.forEach(def => {
      g.defineSlot(def.adUnitPath, def.sizes, def.elementId).addService(g.pubads());
    });
    g.pubads().disableInitialLoad();
    g.enableServices();
  });
}

export function displayAll(slotDefs) {
  const g = window.googletag;
  g.cmd.push(() => {
    // biome-ignore lint/suspicious/useIterableCallbackReturn: <explanation>
    slotDefs.forEach(def => g.display(def.elementId));
  });
}

export function refreshAllGpt() {
  const g = window.googletag;
  g.cmd.push(() => g.pubads().refresh());
}
