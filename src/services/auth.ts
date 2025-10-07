const RAW_BASE = import.meta.env.VITE_BACKEND as string;
if (!RAW_BASE) {
  throw new Error("VITE_BACKEND is not set");
}
export const API_BASE = RAW_BASE.replace(/\/+$/, ""); 

type JsonValue = Record<string, unknown> | undefined;

async function request<T>(path: string, init?: RequestInit & { json?: JsonValue }): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string> | undefined) };

  let body: BodyInit | undefined;
  if (init?.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  } else {
    body = init?.body ?? undefined;
  }

  const res = await fetch(url, {
    mode: "cors",
    credentials: "include",
    ...init,
    headers,
    body,
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    console.error("No content");
    
  }

  if (!res.ok) {
    const message = (data as { message?: string } | null)?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export const AuthApi = {
  login: (email: string, password: string) =>
    request<{ token: string }>("/auth/login", { method: "POST", json: { email, password } }),

  register: (email: string, password: string, name?: string) =>
    request<{ token: string }>("/auth/register", {
      method: "POST",
      json: { email, password, ...(name ? { name } : {}) },
    }),

  logout: () => request<void>("/auth/logout", { method: "POST" }),

  me: () => request<{ id: string; email: string; name?: string | null }>("/auth/me"),
};

export const queryKeys = {
  me: ["auth", "me"] as const,
};
