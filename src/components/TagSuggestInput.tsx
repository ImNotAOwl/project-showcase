"use client";
import useSWR from "swr";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TagSuggestInput({ value, onChange, placeholder = "Ajouter un tag puis Entrée" }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; }) {
	const { data: allTags } = useSWR<string[]>("/api/tags", fetcher);
	const [draft, setDraft] = useState("");

	function add(tag: string) {
		const t = tag.trim();
		if (!t) return;
		if (!value.includes(t)) onChange([...value, t]);
		setDraft("");
	}
	function remove(tag: string) {
		onChange(value.filter((x) => x !== tag));
	}

	const suggestions = useMemo(() => {
		const q = draft.toLowerCase();
		const pool = (allTags ?? []).filter((t) => !value.includes(t));
		if (!q) return pool.slice(0, 10);
		return pool.filter((t) => t.toLowerCase().includes(q)).slice(0, 10);
	}, [allTags, draft, value]);

	return (
		<div className="space-y-2">
			{/* tags sélectionnés */}
			<div className="flex flex-wrap gap-2">
				{value.map((t) => (
					<Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => remove(t)}>
						{t} ✕
					</Badge>
				))}
			</div>

			{/* saisie */}
			<Input
				placeholder={placeholder}
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(draft); } }}
			/>

			{/* suggestions issues de la DB */}
			{suggestions.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{suggestions.map((s) => (
						<Button key={s} type="button" variant="secondary" size="sm" onClick={() => add(s)}>
							{s}
						</Button>
					))}
				</div>
			)}
		</div>
	);
}