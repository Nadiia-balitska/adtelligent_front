import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "virtual:plugins"; //заімпортує мені всі файлм

import "./index.css";
import App from "./App.tsx";

const root = document.getElementById("root");
if (!root) throw new Error('Root element "#root" not found');

createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
