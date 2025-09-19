import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ThemeWatcher from "./components/Theme/ThemeWatcher.tsx";

// import "virtual:plugins"; //заімпортує мені всі файлм

import "./index.css";
import App from "./App.tsx";

const rootElement = document.getElementById("root");
if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<BrowserRouter>
				<ThemeWatcher />
				<App />
			</BrowserRouter>
		</StrictMode>,
	);
} else {
	console.error("Root element not found");
}
