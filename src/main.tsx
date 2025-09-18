import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ThemeWatcher from "./components/ThemeWatcher.tsx";

import "virtual:plugins"; //заімпортує мені всі файлм modules

import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient();

const root = document.getElementById("root");
if (!root) throw new Error('Root element "#root" not found');

createRoot(root).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<ThemeWatcher />
				<App />
			</BrowserRouter>
		</QueryClientProvider>
	</StrictMode>,
);
