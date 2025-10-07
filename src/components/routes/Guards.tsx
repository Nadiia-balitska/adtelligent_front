import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet } from "react-router-dom";
import { AuthApi, queryKeys } from "../../services/auth";
import type { MeResponse } from "../../types/auth";

export const PublicOnlyRoute = () => {
  const { data: me, isLoading } = useQuery<MeResponse | null>({
    queryKey: queryKeys.me as unknown as string[],
    queryFn: AuthApi.me,
    retry: false,
  });
  if (isLoading) return null;
  return me ? <Navigate to="/" replace /> : <Outlet />;
};

export const PrivateRoute = () => {
  const { data: me, isLoading } = useQuery<MeResponse | null>({
    queryKey: queryKeys.me as unknown as string[],
    queryFn: AuthApi.me,
    retry: false,
  });
  if (isLoading) return null;
  return me ? <Outlet /> : <Navigate to="/login" replace />;
};
