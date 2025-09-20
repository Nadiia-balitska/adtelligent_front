import { useThemeStore } from "../../store/theme";

export default function ThemeToggle() {
	const { theme, toggle } = useThemeStore();
	return (
		<button
			type="button"
			onClick={toggle}
			className="rounded-md border px-3 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10"
		>
			{theme === "dark" ? "Light" : "Dark"}
		</button>
	);
}
