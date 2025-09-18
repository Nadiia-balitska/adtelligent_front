import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { fetchNewsById } from "../../services/news";

export default function NewsFull() {
	const { id } = useParams();
	const nav = useNavigate();
	const { data } = useQuery({
		queryKey: ["news", id],
		queryFn: () => fetchNewsById(id!),
		enabled: !!id,
	});

	if (!data) return <p className="p-6">Новину не знайдено.</p>;

	return (
		<div className="mx-auto max-w-3xl space-y-4 p-6">
			<button
				type="button"
				onClick={() => nav(-1)}
				className="text-sm text-blue-600 hover:underline"
			>
				← Назад
			</button>
			<h1 className="text-2xl font-bold">{data.title}</h1>
			{data.image && (
				<img
					src={data.image}
					alt=""
					loading="lazy"
					className="w-full rounded-lg"
				/>
			)}
			<p className="leading-7">{data.content}</p>
		</div>
	);
}
