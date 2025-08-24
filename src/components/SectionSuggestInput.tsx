"use client";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function SectionSuggestInput({
	value, onChange
}: { value: string; onChange: (v: string) => void }) {
	const { data: sections = [] } = useSWR<string[]>("/api/sections", fetcher);
	const [open, setOpen] = useState(false);
	const [q, setQ] = useState(value ?? "");

	const filtered = useMemo(() =>
		sections.filter(s => s.toLowerCase().includes(q.toLowerCase()) && s !== q).slice(0, 8),
		[sections, q]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<div>
					<Input
						placeholder="Ex: Expériences professionnelles"
						value={q}
						onChange={(e) => { setQ(e.target.value); onChange(e.target.value); }}
						onFocus={() => setOpen(true)}
					/>
				</div>
			</PopoverTrigger>
			<PopoverContent className="p-2 w-[var(--radix-popover-trigger-width)]">
				{filtered.length === 0 ? (
					<div className="text-sm text-muted-foreground px-1 py-2">Aucune suggestion</div>
				) : (
					<div className="flex flex-col gap-1">
						{filtered.map((s) => (
							<Button key={s} variant="ghost" className="justify-start"
								onClick={() => { onChange(s); setQ(s); setOpen(false); }}>
								{s}
							</Button>
						))}
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
