import { lazy, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { initAds } from "virtual:ads";
import "./App.css";
import Layout from "./components/Layout/Layout";
import "virtual:plugins"; 
import StatsPage from "./pages/StatsPage/StatsPage";
import { PrivateRoute, PublicOnlyRoute } from "./components/routes/Guards";
import ChartsPage from "./pages/ChartPage/ChartsPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import NewsFull from "./components/News/NewsFull";
import NewsFeed from "./components/News/NewsFeed";
import Dashboard from "./pages/Dashboard/Dashboard";
import AdminPage from "./components/AdminPage/AdminPage";



const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));


function App() {
	useEffect(() => { initAds();

	 }, []);
	return (
			    
	<Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>


        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardPage />} />
          <Route path="news" element={<NewsFeed />} />
          <Route path="news/:id" element={<NewsFull />} />
        </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/admin-line-items" element={<AdminPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/chart" element={<ChartsPage />} />
          </Route>

           <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

      </Routes>
	
);
	
}

export default App;
