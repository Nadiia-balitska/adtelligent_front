import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import "./App.css";
import Layout from "./components/Layout";

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const NewsFeed = lazy(() => import("./pages/news/NewsFeed"));
const NewsFull = lazy(() => import("./pages/news/NewsFull"));
function App() {
	return (
		<Routes>
			<Route path="/" element={<Layout />}>
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
