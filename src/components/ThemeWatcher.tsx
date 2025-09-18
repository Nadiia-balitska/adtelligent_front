import { useEffect } from "react";
import { useThemeStore } from "../store/theme";

export default function ThemeWatcher() {
	const theme = useThemeStore((s) => s.theme);
	useEffect(() => {
		const root = document.documentElement;
		const title = document.querySelector("h1");

		if (theme === "dark" && title) {
			root.classList.add("dark");
			root.style.colorScheme = "light";
		} else if (theme === "light" && title) {
			root.classList.remove("dark");
			root.style.colorScheme = "dark";
		}

		if (title instanceof HTMLElement) {
			title.style.color = theme === "dark" ? "#0a0a0a" : "#ffffff";
		}
	}, [theme]);

	return null;
}
