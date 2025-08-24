"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import {
	Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import {
	Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
import TagSuggestInput from "./TagSuggestInput";
import SectionSuggestInput from "./SectionSuggestInput";

export type Project = {
	id: string;
	title: string;
	description?: string;
	imageUrl?: string;
	githubLinks?: string[];
	siteUrl?: string;
	tags?: string[];
	screenshots?: string[];
	section?: string;
	sortOrder?: number;
};

export default function EditProjectModal({
	p, onUpdated, asIcon = false
}: { p: Project; onUpdated?: () => void | Promise<void>; asIcon?: boolean }) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState(p.title);
	const [description, setDescription] = useState(p.description ?? "");
	const [imageUrl, setImageUrl] = useState(p.imageUrl ?? "");
	const [siteUrl, setSiteUrl] = useState(p.siteUrl ?? "");
	const [githubLinks, setGithubLinks] = useState<string[]>(p.githubLinks ?? []);
	const [newGithub, setNewGithub] = useState("");
	const [tags, setTags] = useState<string[]>(p.tags ?? []);
	const [screenshots, setScreenshots] = useState<string[]>(p.screenshots ?? []);
	const [section, setSection] = useState(p.section ?? "Expériences Professionnelles");
	const [sortOrder, setSortOrder] = useState<number>(p.sortOrder ?? 0);

	function addGithub() {
		const v = newGithub.trim();
		if (!v) return;
		if (!githubLinks.includes(v)) setGithubLinks([...githubLinks, v]);
		setNewGithub("");
	}
	function removeGithub(link: string) {
		setGithubLinks(githubLinks.filter((l) => l !== link));
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		const payload = {
			title,
			description,
			imageUrl: imageUrl || undefined,
			siteUrl: siteUrl || undefined,
			githubLinks,
			tags,
			screenshots,
			section,
			sortOrder,
		};
		const res = await fetch(`/api/projects/${p.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		});
		if (res.ok) {
			setOpen(false);
			mutate("/api/projects");
			router.refresh();
			await onUpdated?.();
		} else {
			const j = await res.json().catch(() => ({}));
			alert("Erreur: " + (j?.error ? JSON.stringify(j.error) : res.status));
		}
	}

	function removeShot(url: string) {
		setScreenshots((arr) => arr.filter(u => u !== url));
	}

	async function handleScreenshotsSelect(files: FileList | null) {
		if (!files || files.length === 0) return;
		const fd = new FormData();
		// clé "files" multiple
		Array.from(files).forEach(f => fd.append("files", f));
		const res = await fetch("/api/upload", { method: "POST", body: fd });
		if (!res.ok) return alert("Upload screenshots échoué");
		const j = await res.json();
		setScreenshots((arr) => [...arr, ...(j.urls ?? [])]);
	}

	const TriggerButton = asIcon ? (
		<Button size="icon" variant="ghost" aria-label="Modifier">
			<Pencil className="h-4 w-4" />
		</Button>
	) : (
		<Button variant="outline">Modifier</Button>
	);

	return (
		<TooltipProvider>
			<Dialog open={open} onOpenChange={setOpen}>
				<Tooltip>
					<TooltipTrigger asChild>
						<DialogTrigger asChild>
							{TriggerButton}
						</DialogTrigger>
					</TooltipTrigger>
					<TooltipContent>Modifier</TooltipContent>
				</Tooltip>

				<DialogContent className="max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Modifier le projet</DialogTitle>
					</DialogHeader>

					<form onSubmit={submit} className="space-y-4">
						<Input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<label className="text-sm font-medium">Section</label>
								<SectionSuggestInput value={section} onChange={setSection} />
							</div>
							<div>
								<label className="text-sm font-medium">Ordre</label>
								<Input type="number" value={sortOrder}
									onChange={(e) => setSortOrder(Number(e.target.value))}
								/>
							</div>
						</div>
						<Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
						<Input placeholder="URL image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
						<Input placeholder="Lien du site" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} />

						<div className="space-y-2">
							<label className="text-sm font-medium">Screenshots (optionnel)</label>
							<Input type="file" accept="image/*" multiple onChange={(e) => handleScreenshotsSelect(e.target.files)} />
							{screenshots.length > 0 && (
								<div className="grid grid-cols-3 gap-2">
									{screenshots.map((u) => (
										<div key={u} className="relative">
											<img src={u} alt="screenshot" className="w-full h-24 object-cover rounded border" />
											<Button type="button" size="sm" variant="secondary" className="absolute right-1 top-1"
												onClick={() => removeShot(u)}>
												Retirer
											</Button>
										</div>
									))}
								</div>
							)}
						</div>

						<div>
							<div className="flex gap-2">
								<Input placeholder="Lien GitHub" value={newGithub} onChange={(e) => setNewGithub(e.target.value)} />
								<Button type="button" onClick={addGithub}>Ajouter</Button>
							</div>
							<div className="flex flex-wrap gap-2 mt-2">
								{githubLinks.map((link) => (
									<Badge key={link} onClick={() => removeGithub(link)} className="cursor-pointer">
										{link}
									</Badge>
								))}
							</div>
						</div>

						<TagSuggestInput value={tags} onChange={setTags} />

						<Button type="submit">Enregistrer</Button>
					</form>
				</DialogContent>
			</Dialog>
		</TooltipProvider>
	);
}
