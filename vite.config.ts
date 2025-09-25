import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import compression from "vite-plugin-compression";
import inspect from "vite-plugin-inspect";
import svgr from "vite-plugin-svgr";
import virtualModules from "./src/plugins/virtual_modules.plugin.ts";

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
	build: {
		target: "es2019",
		sourcemap: false,
		minify: "terser",
		terserOptions: { compress: { drop_console: true, drop_debugger: true } },
		cssCodeSplit: true,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ["react", "react-dom", "react-router-dom"],
				},
			},
		},
	},
});
