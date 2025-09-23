export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", 
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const AuthApi = {
  login: (email: string, password: string) =>
    request<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name?: string) =>
    request<{ token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, ...(name ? { name } : {}) }),
    }),

  logout: () => request<void>("/api/auth/logout", { method: "POST" }),

  me: () =>
    request<{ id: string; email: string; name?: string | null }>(
      "/api/auth/me"
    ),
};

export const queryKeys = {
  me: ["auth", "me"] as const,
};
