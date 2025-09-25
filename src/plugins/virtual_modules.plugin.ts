import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

export default function virtualModules(): Plugin {
  const enablePrebid = process.env.VITE_ENABLE_ADS === "true";
  const enableGoogle = process.env.VITE_ENABLE_ADS_GOOGLE === "true";

  const ID_PLUGINS = "\0virtual:plugins";
  const ID_ADS = "\0virtual:ads";

  return {
    name: "virtual-modules",

    resolveId(id) {
      if (id === "virtual:plugins") return ID_PLUGINS;
      if (id === "virtual:ads") return ID_ADS;
      return null;
    },

    load(id) {
      if (id === ID_PLUGINS) {
        const modulesDir = path.resolve(process.cwd(), "src/modules");
        let files: string[] = [];
        try {
          files = fs.readdirSync(modulesDir);
        } catch {
        }

        const imports = files
          .filter((f) => /\.(t|j)sx?$/i.test(f)) 
          .map((f) => `import "../modules/${f}";`);

        return imports.join("\n") || "export {};";
      }

      if (id === ID_ADS) {
        if (enablePrebid) {
          return `
            export { initAds } from "/src/ads/prebid/init-prebid.js";
            export { default as AdsView } from "/src/ads/component/AdsView.jsx";
          `;
        }
        if (enableGoogle) {
          return `
            export { initAdsGoogle as initAds } from "/src/ads/google/init-gam.js";
            export const AdsView = null;
          `;
        }
        return `export const initAds = () => {}; export const AdsView = null;`;
      }

      return null;
    },
  };
}
