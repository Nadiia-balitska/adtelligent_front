import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchNews } from "../../services/news";

export default function NewsFeed() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["news"],
    queryFn: fetchNews, 
  });

  if (isLoading) return <p className="p-6">Завантаження…</p>;
  if (error) return <p className="p-6 text-red-600">Помилка: {(error as Error).message}</p>;
  if (!data?.length) return <p className="p-6">Новин немає.</p>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid max-w-4xl gap-4 p-6 sm:grid-cols-2">
     {data?.map((n) => (
  <article key={n.id} className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
    {/* {n.image && (
      <img src={n.image} alt="" loading="lazy" className="h-20 w-full object-cover" />
    )} */}
    <div className="space-y-2 p-4">
      <h3 className="text-lg font-semibold">{n.title}</h3>
      {n.summary && <p className="text-sm opacity-80 line-clamp-4">{n.summary}</p>}
    <Link to={`news/${encodeURIComponent(n.id)}`} 
	 state={{ item: n }} 
	className="text-blue-600 hover:underline dark:text-blue-400">
  Читати
</Link>
    </div>
  </article>
       ))}
      </div>
    </div>
  );
}
