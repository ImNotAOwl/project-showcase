"use client";
import useSWR from "swr";
import ProjectItem from "./ProjectItem";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProjectList({ isAdmin = false }: { isAdmin?: boolean }) {
	const { data = [], mutate } = useSWR("/api/projects", fetcher);

	// Regroupe par section (ordre alphabétique), les projets sont déjà triés par API
	const grouped: Record<string, any[]> = {};
	for (const p of data) {
		const key = p.section || "Autres";
		(grouped[key] ||= []).push(p);
	}
	const sections = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

	return (
		<div className="space-y-8">
			{sections.map((sec) => (
				<section key={sec} className="space-y-3">
					<h2 className="text-lg font-semibold">{sec}</h2>
					<div className="grid gap-4">
						{grouped[sec].map((p) => (
							<ProjectItem key={p.id} p={p} onChanged={() => mutate()} isAdmin={isAdmin} />
						))}
					</div>
				</section>
			))}
		</div>
	);
}
