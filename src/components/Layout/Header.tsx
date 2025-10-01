import { Link } from "react-router-dom";
import ThemeToggle from "../Theme/ThemeToggle";

const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-900/70 dark:supports-[backdrop-filter]:bg-zinc-900/60 shadow-sm">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-12 px-4">
        <div className="flex items-center gap-12">
          <Link
            to="/"
            className="font-semibold tracking-tight rounded-lg px-2 py-1.5 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
          >
            News
          </Link>

          <span className="h-5 w-px bg-zinc-300/60 dark:bg-zinc-700/60" />

          <div className="flex items-center gap-1">
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium opacity-80 transition hover:opacity-100 hover:bg-zinc-900/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg px-3 py-2 text-sm font-medium opacity-80 transition hover:opacity-100 hover:bg-zinc-900/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
            >
              Register
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Header;
