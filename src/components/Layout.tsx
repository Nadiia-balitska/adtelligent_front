import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
	return (
		<div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
			<Header />
			<main className="mx-auto max-w-5xl p-4">
				<Outlet />
			</main>
		</div>
	);
};

export default Layout;
