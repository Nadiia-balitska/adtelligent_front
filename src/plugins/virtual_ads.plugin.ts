import type { Plugin } from 'vite';

export default function adsVirtualPlugin(): Plugin {
  const enable = process.env.VITE_ENABLE_ADS === 'true';
  return {
    name: 'virtual-ads',
    async resolveId(id) {
      return id === 'virtual:ads' ? id : null;
    },
    async load(id) {
      if (id !== 'virtual:ads') return null;
      if (!enable) {
        return `export const initAds = () => {}; export const AdsLogsView = null;`;
      }
      return `
        export { initAds } from '/src/ads/prebid/init-prebid';
        export { default as AdsLogsView } from '/src/ads/logs/AdsLogsView';
      `;
    },
  };
}

