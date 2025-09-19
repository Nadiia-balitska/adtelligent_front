import { Link } from "react-router-dom";
import ThemeToggle from "./Theme/ThemeToggle";

const Header = () => {
	return (
		<header className="sticky top-0 z-10 border-b bg-white/70 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
			<nav className="mx-auto flex max-w-5xl items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<Link to="/" className="font-semibold">
						News
					</Link>
					<Link to="/login" className="opacity-80 hover:opacity-100">
						Login
					</Link>
					<Link to="/register" className="opacity-80 hover:opacity-100">
						Register
					</Link>
				</div>
				<ThemeToggle />
			</nav>
		</header>
	);
};

export default Header;
