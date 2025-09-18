import { create } from "zustand";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
	try {
		const saved = localStorage.getItem("theme") as Theme | null;
		if (saved === "light" || saved === "dark") return saved;
	} catch (err) {
		console.error("Failed to save theme to localStorage", err);
	}
	return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const useThemeStore = create<{
	theme: Theme;
	toggle: () => void;
	set: (t: Theme) => void;
}>((set) => ({
	theme: getInitialTheme(),
	toggle: () =>
		set((s) => {
			const next: Theme = s.theme === "dark" ? "light" : "dark";
			try {
				localStorage.setItem("theme", next);
			} catch (err) {
				console.error("Failed to save theme to localStorage", err);
			}
			return { theme: next };
		}),
	set: (t) => {
		try {
			localStorage.setItem("theme", t);
		} catch (err) {
			console.error("Failed to save theme to localStorage", err);
		}
		set({ theme: t });
	},
}));
