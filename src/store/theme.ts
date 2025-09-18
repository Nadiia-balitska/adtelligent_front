import { create } from "zustand";

type Theme = "light" | "dark";
type State = { theme: Theme; toggle: () => void; set: (t: Theme) => void };

export const useThemeStore = create<State>((set, get) => ({
	theme: "light",
	toggle: () => set({ theme: get().theme === "light" ? "dark" : "light" }),
	set: (t) => set({ theme: t }),
}));
