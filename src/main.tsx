import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ThemeWatcher from "./components/Theme/ThemeWatcher.tsx";
import "./modules/ads/prebid/early-init.js"
import "./modules/analytics/analytics";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");
if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<BrowserRouter>
				<QueryClientProvider client={queryClient}>
					<ThemeWatcher />
					<App />
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
			</BrowserRouter>
		</StrictMode>,
	);
} else {
	console.error("Root element not found");
}
