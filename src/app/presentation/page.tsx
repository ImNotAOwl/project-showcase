"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Github } from "lucide-react";
import Image from "next/image";

type Project = {
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

const fetcher = (u: string) => fetch(u).then(r => r.json());
const repoLabel = (raw: string) => {
	try {
		const u = new URL(raw);
		const parts = u.pathname.split("/").filter(Boolean);
		if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
		return parts[0] || raw;
	} catch { return raw; }
};

export default function PresentationPage() {
	const router = useRouter();
	const params = useSearchParams();
	const sectionParam = params.get("section") || "";
	const { data: projects = [] } = useSWR<Project[]>("/api/projects", fetcher);

	const slides = useMemo(() => {
		return sectionParam
			? projects.filter(p => (p.section || "Autres") === sectionParam)
			: projects;
	}, [projects, sectionParam]);

	const [i, setI] = useState(0);
	useEffect(() => { setI(0); }, [sectionParam]);
	const has = slides.length > 0;
	const cur = has ? slides[Math.max(0, Math.min(i, slides.length - 1))] : null;

	const prev = useCallback(() => setI(v => (v - 1 + slides.length) % slides.length), [slides.length]);
	const next = useCallback(() => setI(v => (v + 1) % slides.length), [slides.length]);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "ArrowLeft") prev();
			if (e.key === "ArrowRight" || e.key === " ") next();
			if (e.key === "Escape") router.push("/");
			if (e.key.toLowerCase() === "f") {
				if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { });
				else document.exitFullscreen().catch(() => { });
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [prev, next, router]);

	return (
		<div className="w-screen h-screen bg-background text-foreground">
			{/* Barre de contrôle */}
			<div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-3 z-10">
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={() => router.push("/")}>Quitter</Button>
					<Button variant="outline" onClick={() => {
						if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { });
						else document.exitFullscreen().catch(() => { });
					}}>Plein écran (F)</Button>
					{sectionParam && <div className="text-sm px-2 py-1 rounded bg-muted">{sectionParam}</div>}
				</div>
				<div className="text-sm opacity-75">{has ? `${i + 1} / ${slides.length}` : "—"}</div>
			</div>

			{/* Slide scrollable */}
			<div className="w-full h-full flex items-stretch justify-center p-6 sm:p-8">
				<div className="max-w-6xl w-full h-full bg-transparent"	>
					<button
						className="absolute inset-0 z-0 opacity-0"
						aria-label="Suivant"
						onClick={next}
					/>
					{!cur ? (
						<div className="h-full flex items-center justify-center opacity-70">Aucun projet à afficher.</div>
					) : (
						// Empêche le click de propager (sinon ça avance la slide)
						<div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
							{/* Contenu scrollable verticalement */}
							<div className="h-full overflow-y-auto pr-1">
								{/* Header: imageUrl TOUJOURS à gauche du titre et bouton site à droite */}
								<header className="flex z-20 items-start justify-between gap-4 mb-4">
									{/* Image à gauche */}
									{cur.imageUrl && (
										<Image
											src={cur.imageUrl}
											alt="illustration"
											width={96}
											height={96}
											className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded border shrink-0"
											unoptimized
										/>
									)}

									{/* Titre + section */}
									<div className="flex-1 text-center sm:text-left">
										<h1 className="text-2xl sm:text-3xl font-bold leading-tight">{cur.title}</h1>
										{cur.section && <div className="mt-1 text-sm opacity-70">{cur.section}</div>}
										{/* Tags : taille stable, pas d'étirement vertical */}
										{cur.tags?.length ? (
											<div className="flex flex-wrap items-center justify-start gap-2 mt-2 mb-4">
												{cur.tags.map(t => (
													<Badge key={t} variant="outline" className="inline-flex items-center h-6 bg-yellow-500">
														{t}
													</Badge>
												))}
											</div>
										) : null}
									</div>

									{/* Bouton Voir le site à droite */}
									{cur.siteUrl && (
										<Button asChild variant="secondary" className="shrink-0">
											<a
												href={cur.siteUrl}
												target="_blank"
												rel="noopener noreferrer"
												onClick={(e) => e.stopPropagation()}
											>
												Voir le site
											</a>
										</Button>
									)}
								</header>

								{/* Visuel central : uniquement si screenshots */}
								{cur.screenshots?.length ? (
									<div className="mb-4">
										{cur.screenshots.length > 1 ? (
											<InlineCarousel images={cur.screenshots} />
										) : (
											<Image
												src={cur.screenshots[0]}
												alt="screenshot"
												width={1200}
												height={800}
												className="mx-auto max-h-[55vh] w-auto object-contain rounded border bg-black"
											/>
										)}
									</div>
								) : null}

								{/* Description */}
								{cur.description && (
									<p className="text-base leading-relaxed whitespace-pre-wrap text-center sm:text-left mx-auto mb-4">
										{cur.description}
									</p>
								)}

								{/* Actions (cliquables) */}
								<div className="flex flex-wrap items-center justify-center gap-2">
									{cur.githubLinks?.map((link) => (
										<Button key={link} asChild className="flex items-center gap-2">
											<a
												href={link}
												target="_blank"
												rel="noopener noreferrer"
												onClick={(e) => e.stopPropagation()}
											>
												<Github className="h-4 w-4" />
												{repoLabel(link)}
											</a>
										</Button>
									))}
								</div>

								{/* Espace bas pour respirer lors du scroll */}
								<div className="h-10" />
							</div>

							{/* Overlays latéraux pour naviguer (en dessous du header) */}
							<button
								className="absolute left-0 top-[88px] h-[calc(100%-88px)] w-[10%] opacity-0 z-10"
								aria-label="Précédent"
								onClick={(e) => { e.stopPropagation(); prev(); }}
							/>
							<button
								className="absolute right-0 top-[88px] h-[calc(100%-88px)] w-[10%] opacity-0 z-10"
								aria-label="Suivant"
								onClick={(e) => { e.stopPropagation(); next(); }}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

/** Petit carrousel inline pour multiples screenshots (sans modal) */
function InlineCarousel({ images }: { images: string[] }) {
	const [i, setI] = useState(0);
	const prev = () => setI(v => (v - 1 + images.length) % images.length);
	const next = () => setI(v => (v + 1) % images.length);

	return (
		<div className="relative w-full mx-auto h-[55vh] rounded-lg overflow-hidden bg-black">
			<Image
				src={images[i]}
				alt={`screenshot ${i + 1}/${images.length}`}
				width={1600}
				height={900}
				className="w-full h-full object-contain"
			/>
			<Button
				type="button"
				size="icon"
				variant="secondary"
				className="absolute left-3 top-1/2 -translate-y-1/2 z-30"
				onClick={(e) => { e.stopPropagation(); prev(); }}
				aria-label="Précédent"
			>
				<ChevronLeft className="h-5 w-5" />
			</Button>

			<Button
				type="button"
				size="icon"
				variant="secondary"
				className="absolute right-3 top-1/2 -translate-y-1/2 z-30"
				onClick={(e) => { e.stopPropagation(); next(); }}
				aria-label="Suivant"
			>
				<ChevronRight className="h-5 w-5" />
			</Button>
			<div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
				{images.map((_, idx) => (
					<button
						key={idx}
						aria-label={`Aller à l’image ${idx + 1}`}
						onClick={(e) => { e.stopPropagation(); setI(idx); }}
						className={`h-2 w-2 rounded-full ${idx === i ? "bg-white" : "bg-white/50"}`}
					/>
				))}
			</div>
		</div>
	);
}
