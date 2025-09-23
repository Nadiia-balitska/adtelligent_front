const API = import.meta.env.VITE_API_URL  ?? "http://localhost:3000" ;
export async function register(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include", 
  });
  if (!res.ok) throw new Error("Register failed");
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function getArticle(url: string) {
  const res = await fetch(`${API}/api/article?url=${encodeURIComponent(url)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Not authorized or parse error");
  return res.json();
}
