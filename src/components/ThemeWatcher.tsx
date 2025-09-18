import { useEffect } from "react";
import { useThemeStore } from "../store/theme";

export default function ThemeWatcher() {
	const theme = useThemeStore((s) => s.theme);
	useEffect(() => {
		const root = document.documentElement;
		root.classList.toggle("dark", theme === "dark");
	}, [theme]);
	return null;
}
