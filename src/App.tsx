import { lazy, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { initAds } from "virtual:ads";

import "./App.css";
import Layout from "./components/Layout";
import "virtual:plugins"; //заімпортує мені всі файлм

const ADS_ENABLED = import.meta.env.VITE_ENABLE_ADS === "true";


const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const NewsFeed = lazy(() => import("./pages/news/NewsFeed"));
const NewsFull = lazy(() => import("./pages/news/NewsFull"));

const AdsView = ADS_ENABLED
  ? lazy(() =>
      import("virtual:ads").then(m => ({
        default: m.AdsLogsView ?? (() => <Navigate to="/" replace />),
      }))
    )
  : null;
function App() {
	useEffect(() => { initAds();

	 }, []);
	return (
		<Routes>
			<Route path="/" element={<Layout />}>
			 {ADS_ENABLED && AdsView && (
          <Route path="/ads-logs" element={<AdsView />} />
        )}
		<Route path="/" element={<NewsFeed />} />
				<Route path="/news/:id" element={<NewsFull />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Route>
		</Routes>
	);
}

export default App;
