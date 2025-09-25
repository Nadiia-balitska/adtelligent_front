import { SLOT_DEFS } from "../prebid/ad-units";
import { loadGpt, defineSlots, displayAll, refreshAllGpt } from "../prebid/google-gpt";

function setupAutoRefresh(ms) {
  if (!ms) return;
  setInterval(() => {
    refreshAllGpt(); 
  }, ms);
}

export async function initAdsGoogle() {
  await loadGpt();
  defineSlots(SLOT_DEFS);
  displayAll(SLOT_DEFS);
  setupAutoRefresh(60_000); 
}
