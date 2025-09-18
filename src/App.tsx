import { lazy, Suspense } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";

import "./App.css";

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const NewsFeed = lazy(() => import("./pages/news/NewsFeed"));
const NewsFull = lazy(() => import("./pages/news/NewsFull"));
function App() {
	return (
		<div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
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

			<Suspense fallback={<p className="p-6">Завантаження…</p>}>
				<Routes>
					<Route path="/" element={<NewsFeed />} />
					<Route path="/news/:id" element={<NewsFull />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Suspense>
		</div>
	);
}

export default App;
