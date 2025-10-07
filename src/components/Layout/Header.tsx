import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ThemeToggle from "../Theme/ThemeToggle";
import { AuthApi, queryKeys } from "../../services/auth";
import type { MeResponse } from "../../types/auth";

const Header = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: me, isLoading } = useQuery<MeResponse | null>({
    queryKey: queryKeys.me as unknown as string[],
    queryFn: async () => {
    try {
      return await AuthApi.me();
    } catch {
      return null; 
    }
  },
    retry: false,
  });

  const isAuthed = !!me;

  const onLogout = async () => {
    await AuthApi.logout();
    qc.setQueryData(queryKeys.me as unknown as string[], null);
    await qc.invalidateQueries({ queryKey: queryKeys.me as unknown as string[] });
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-900/70 dark:supports-[backdrop-filter]:bg-zinc-900/60 shadow-sm">
      <nav className="mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-1">
          <Link
            to="/dashboard"
            className="font-semibold tracking-tight rounded-lg px-2 py-1.5 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
          >
            || Dashboard
          </Link>

          {isAuthed ? (
            <>
              <Link
                to="/stats"
                className="rounded-lg px-3 py-2 text-sm font-medium opacity-80 transition hover:opacity-100 hover:bg-zinc-900/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
              >
                || Statistic table
              </Link>
              <Link
                to="/chart"
                className="rounded-lg px-3 py-2 text-sm font-medium opacity-80 transition hover:opacity-100 hover:bg-zinc-900/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
              >
                || Statistic chart ||
              </Link>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <span className="text-sm opacity-70">loading…</span>
          ) : isAuthed ? (
            <>
              <span className="text-sm opacity-80">{me?.name || me?.email}</span>
              <button type="button"
                onClick={onLogout}
                className="rounded-lg px-3 py-2 text-sm font-medium bg-red-500 text-white hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
              >
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium opacity-80 transition hover:opacity-100 hover:bg-zinc-900/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
              >
                || Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg px-3 py-2 text-sm font-medium opacity-80 transition hover:opacity-100 hover:bg-zinc-900/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
              >
                || Register
              </Link>
            </>
          )}

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Header;
