export type FeedItem = {
  id: string;
  title: string;
  link: string;
  content?: string | null;  
  image?: string | null;
  pubDate?: string | null;
};
export type FeedResponse = {
  url: string;
  title: string | null;
  fetchedAt: string;
  items: FeedItem[];
};

export type News = {
  id: string;
  title: string;
  summary: string;        
  image?: string;
  content: string;        
  link?: string;
};

const API = (import.meta as any).env.VITE_BACKEND?.replace(/\/$/, "") ?? "";

function strip(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

async function fetchFeed(force = false): Promise<FeedResponse> {
  const url = `${API}/feed${force ? "?force=1" : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchNews(): Promise<News[]> {
  const feed = await fetchFeed(true);
  return feed.items.map(i => ({
    id: i.id,
    title: i.title,
    summary: i.content ? strip(i.content).slice(0, 200) : "",
    image: i.image ?? undefined,
    content: i.content ?? "",
    link: i.link,
  }));
}



export async function fetchNewsById(id: string): Promise<News | undefined> {
  const feed = await fetchFeed(false);
  const i = feed.items.find(x => String(x.id) === String(id));
  if (!i) return undefined;
  return {
    id: i.id,
    title: i.title,
    summary: i.content ? strip(i.content).slice(0, 260) + "…" : "",
    image: i.image ?? undefined,
    content: i.content ?? "",
    link: i.link,
  };
}
