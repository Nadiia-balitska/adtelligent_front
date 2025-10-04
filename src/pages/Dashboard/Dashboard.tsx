import { Outlet } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Outlet />
    </div>
  );
}
