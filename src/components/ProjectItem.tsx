"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EditProjectModal, { Project as P } from "@/components/EditProjectModal";
import DeleteProjectAlert from "@/components/DeleteProjectAlert";
import ScreenshotGalleryModal from "./ScreenshotGalleryModal";
import { Github } from "lucide-react";

/** Extrait "owner/repo" ou "repo" depuis une URL GitHub */
function repoLabel(raw: string): string {
	try {
		const u = new URL(raw);
		if (!u.hostname.includes("github")) return raw;
		// /owner/repo[/...]
		const parts = u.pathname.split("/").filter(Boolean);
		if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
		if (parts.length === 1) return parts[0];
		return raw;
	} catch {
		return raw;
	}
}

export default function ProjectItem({ p, onChanged, isAdmin = false }: { p: P; onChanged?: () => void | Promise<void>; isAdmin?: boolean }) {
	return (
		<Card className="relative group">
			{/* Espace à droite pour éviter que les icônes mordent le texte */}
			<CardHeader className="flex gap-4 pr-16">
				{/* Icônes en haut à droite : visibles au survol/focus uniquement */}
				{isAdmin && (
					<div className="absolute right-4 top-4 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
						<EditProjectModal p={p} onUpdated={onChanged} asIcon />
						<DeleteProjectAlert id={p.id} onDeleted={onChanged} />
					</div>
				)}

				{p.imageUrl && (
					<img
						src={p.imageUrl}
						alt="cover"
						className="h-16 w-16 rounded object-cover border shrink-0"
					/>
				)}

				<div className="min-w-0">
					<CardTitle className="truncate">{p.title}</CardTitle>
					{p.description && (
						<CardDescription>
							{/* Conserver les retours à la ligne */}
							<span className="whitespace-pre-wrap">{p.description}</span>
						</CardDescription>
					)}
				</div>
			</CardHeader>

			{/* Plus d’air entre sections : tags / boutons */}
			<CardContent className="space-y-4">
				{p.tags?.length ? (
					<div className="flex flex-wrap gap-2">
						{p.tags.map((t) => (
							<Badge key={t} variant="secondary">{t}</Badge>
						))}
					</div>
				) : null}

				<div className="flex flex-wrap items-center gap-2 w-full">
					{/* Boutons GitHub à gauche */}
					{p.githubLinks?.map((url) => (
						<Button key={url}>
							<Github className="h-4 w-4" />
							<a href={url} target="_blank" rel="noopener noreferrer">
								{repoLabel(url)}
							</a>
						</Button>
					))}

					{/* À droite : soit Voir le site, soit Voir les images */}
					<div className="ml-auto">
						{(!p.siteUrl && p.screenshots?.length) ? (
							<ScreenshotGalleryModal images={p.screenshots} triggerLabel="Voir les images" />
						) : p.siteUrl ? (
							<Button asChild variant="secondary">
								<a href={p.siteUrl} target="_blank" rel="noopener noreferrer">Voir le site</a>
							</Button>
						) : null}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
