import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BackButton from "../../components/Buttons/BackButton";
import { fetchNews, type News } from "../../services/news";

export default function NewsFull() {
  const nav = useNavigate();
  const { id: raw } = useParams();
  const id = raw ? decodeURIComponent(raw) : undefined;

  const location = useLocation() as { state?: { item?: News } };
  const fromState = location.state?.item;

  const qc = useQueryClient();
  const fromCache = useMemo(() => {
    const list = qc.getQueryData<News[]>(["news"]);
    return list?.find(n => n.id === id) ?? null;
  }, [qc, id]);

  const { data: fetchedList, isLoading, error } = useQuery({
    queryKey: ["news"],
    queryFn: fetchNews,           
    enabled: !fromState && !fromCache && !!id,
    staleTime: 5 * 60 * 1000,
  });

  const item = useMemo(() => {
    if (fromState) return fromState;
    if (fromCache) return fromCache;
    return fetchedList?.find(n => n.id === id) ?? null;
  }, [fromState, fromCache, fetchedList, id]);

  if (isLoading) return <p className="p-6">Завантаження…</p>;
  if (error) return <p className="p-6 text-red-600">Помилка: {(error as Error).message}</p>;
  if (!item) return <p className="p-6">Новину не знайдено.</p>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <BackButton onClick={() => nav(-1)}>Назад</BackButton>

        <h1 className="text-2xl font-bold">{item.title}</h1>

        {item.image && (
          <img src={item.image} alt="" loading="lazy" className="w-full rounded-lg" />
        )}

        {item.summary && (
          <p className="leading-7 opacity-90 whitespace-pre-wrap">{item.summary}</p>
        )}

        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-blue-600 hover:underline dark:text-blue-400"
          >
            Відкрити оригінал
          </a>
        )}
      </div>
    </div>
  );
}
