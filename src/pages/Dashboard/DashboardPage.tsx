import { useQuery } from "@tanstack/react-query";
import { AuthApi, queryKeys } from "../../services/auth";
import type { MeResponse } from "../../types/auth";
import NewsFeed from "../../components/News/NewsFeed";
import { Outlet } from "react-router-dom";

const DashboardPage = () => {
  const { data: me, isLoading } = useQuery<MeResponse | null>({
    queryKey: queryKeys.me as unknown as string[],
    queryFn: AuthApi.me,
    retry: false,
  });

  if (isLoading) return null;

  if (me) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <NewsFeed />
        <Outlet />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <NewsFeed />
      <Outlet />

    </div>
  );
};

export default DashboardPage;
