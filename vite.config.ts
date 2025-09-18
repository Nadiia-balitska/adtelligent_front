import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import compression from "vite-plugin-compression";
import inspect from "vite-plugin-inspect";
import svgr from "vite-plugin-svgr";
import virtualModules from "./src/plugins/virtual_modules.plugin.js";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		svgr(),
		checker({ typescript: true }),
		inspect(),
		compression(),
		visualizer({ open: true }),
		virtualModules(),
	],
});
