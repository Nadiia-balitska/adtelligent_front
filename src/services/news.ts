import data from "../data/news.json";
import "virtual:plugins";

export type News = {
	id: string;
	title: string;
	summary: string;
	image?: string;
	content: string;
};

export async function fetchNews(): Promise<News[]> {
	return data as News[];
}

export async function fetchNewsById(id: string): Promise<News | undefined> {
	return (data as News[]).find((n) => n.id === id);
}
