export const API_ORIGIN = (import.meta as any).env.VITE_BACKEND as string;

export async function apiPost<T>(path: string, body: unknown): Promise<T | null> {
  const res = await fetch(`${API_ORIGIN}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return (await res.json()) as T;
}
