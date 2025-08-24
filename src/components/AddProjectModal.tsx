"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SectionSuggestInput from "./SectionSuggestInput";

export default function AddProjectModal() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [githubLinks, setGithubLinks] = useState<string[]>([]);
	const [newGithub, setNewGithub] = useState("");
	const [siteUrl, setSiteUrl] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [newTag, setNewTag] = useState("");
	const [screenshots, setScreenshots] = useState<string[]>([]);
	const [section, setSection] = useState("Expériences Professionnelles");   // ou "" si Add
	const [sortOrder, setSortOrder] = useState<number>(0);
	// prévisualisation + suppression
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
	function addGithubLink() {
		if (newGithub.trim()) {
			setGithubLinks([...githubLinks, newGithub.trim()]);
			setNewGithub("");
		}
	}
	function removeGithubLink(link: string) {
		setGithubLinks(githubLinks.filter((l) => l !== link));
	}
	function addTag() {
		if (newTag.trim()) {
			setTags([...tags, newTag.trim()]);
			setNewTag("");
		}
	}
	function removeTag(tag: string) {
		setTags(tags.filter((t) => t !== tag));
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		const res = await fetch("/api/projects", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title, description, imageUrl, githubLinks, siteUrl, tags, screenshots }),
		});
		if (res.ok) {
			setOpen(false);
			setTitle(""); setDescription(""); setImageUrl(""); setGithubLinks([]); setSiteUrl(""); setTags([]);
			mutate("/api/projects"); // met à jour la liste SWR
			router.refresh(); // re-render côté serveur si besoin
		} else {
			const j = await res.json().catch(() => ({}));
			alert("Erreur: " + (j?.error ? JSON.stringify(j.error) : res.status));
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="icon" aria-label="Ajouter un projet" className="rounded-sm w-10 h-10 p-0 text-xl cursor-pointer">+</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Ajouter un projet</DialogTitle>
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
					<Input placeholder="URL de l'image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

					<div>
						<div className="flex gap-2">
							<Input placeholder="Lien GitHub" value={newGithub} onChange={(e) => setNewGithub(e.target.value)} />
							<Button type="button" onClick={addGithubLink}>Ajouter</Button>
						</div>
						<div className="flex flex-wrap gap-2 mt-2">
							{githubLinks.map((link) => (
								<Badge key={link} onClick={() => removeGithubLink(link)} className="cursor-pointer">{link}</Badge>
							))}
						</div>
					</div>

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
							<Input placeholder="Tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
							<Button type="button" onClick={addTag}>Ajouter</Button>
						</div>
						<div className="flex flex-wrap gap-2 mt-2">
							{tags.map((tag) => (
								<Badge key={tag} onClick={() => removeTag(tag)} className="cursor-pointer">{tag}</Badge>
							))}
						</div>
					</div>

					<Button type="submit">Enregistrer</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}