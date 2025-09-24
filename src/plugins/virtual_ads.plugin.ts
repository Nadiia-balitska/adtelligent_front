import type { Plugin } from 'vite';

 function adsVirtualPlugin(): Plugin {
  const enablePrebid = process.env.VITE_ENABLE_ADS === 'true';
  const enableGoogle = process.env.VITE_ENABLE_ADS_GOOGLE === "true";

  return {
    name: 'virtual-ads',
    async resolveId(id) {
      return id === 'virtual:ads' ? id : null;
    },
    async load(id) {
      if (id !== 'virtual:ads') return null;



    if (enablePrebid) {
        return `
          export { initAds } from "/src/ads/prebid/init-prebid.js";
          export { default as AdsLogsView } from "/src/ads/component/AdsView.jsx";
        `;
      }
      if (enableGoogle) {
        return `
          export { initAdsGoogle as initAds } from "/src/ads/google/init-gam.js";
          export const AdsView = null;
        `;
      }
      return `export const initAds = () => {}; export const AdsView = null;`;
    },
  };
}

export default adsVirtualPlugin;

