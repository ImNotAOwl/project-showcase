// src/components/ScreenshotGalleryModal.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import {
	Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ScreenshotGalleryModal({
	images,
	triggerLabel = "Voir les images",
}: {
	images: string[];
	triggerLabel?: string;
}) {
	const [open, setOpen] = useState(false);
	const [i, setI] = useState(0);


	const prev = useCallback(() => setI((v) => (v - 1 + images.length) % images.length), [images.length]);
	const next = useCallback(() => setI((v) => (v + 1) % images.length), [images.length]);

	// Nav clavier dans la galerie
	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "ArrowLeft") prev();
			if (e.key === "ArrowRight") next();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, prev, next]);

	const hasShots = Array.isArray(images) && images.length > 0;
	if (!hasShots) return null;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary">{triggerLabel}</Button>
			</DialogTrigger>

			{/* Large mais raisonnable, responsive : ~90vw et des steps 3xl/5xl/6xl */}
			<DialogContent className="!max-w-[90vw] sm:!max-w-3xl md:!max-w-5xl lg:!max-w-6xl p-4">
				<DialogHeader>
					<DialogTitle>Galerie d’images</DialogTitle>
				</DialogHeader>

				{/* Zone d’image grande (≈70% de la hauteur viewport) */}
				<div className="relative w-full h-[50vh] sm:h-[55vh] md:h-[60vh] flex items-center justify-center bg-black rounded-lg overflow-hidden">
					<img
						src={images[i]}
						alt={`screenshot ${i + 1}/${images.length}`}
						className="max-w-full max-h-full object-contain"
					/>

					{images.length > 1 && (
						<>
							<Button
								type="button"
								size="icon"
								variant="secondary"
								className="absolute left-3 top-1/2 -translate-y-1/2"
								onClick={prev}
								aria-label="Précédent"
							>
								<ChevronLeft className="h-5 w-5" />
							</Button>
							<Button
								type="button"
								size="icon"
								variant="secondary"
								className="absolute right-3 top-1/2 -translate-y-1/2"
								onClick={next}
								aria-label="Suivant"
							>
								<ChevronRight className="h-5 w-5" />
							</Button>

							<div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
								{images.map((_, idx) => (
									<button
										key={idx}
										aria-label={`Aller à l’image ${idx + 1}`}
										onClick={() => setI(idx)}
										className={`h-2 w-2 rounded-full ${idx === i ? "bg-white" : "bg-white/50"}`}
									/>
								))}
							</div>
						</>
					)}
				</div>

				{/* Miniatures cliquables (optionnel) */}
				{images.length > 1 && (
					<div className="grid grid-cols-5 gap-2 mt-3">
						{images.map((src, idx) => (
							<button
								key={src + idx}
								onClick={() => setI(idx)}
								className={`border rounded overflow-hidden ${idx === i ? "ring-2 ring-primary" : ""}`}
							>
								<img src={src} alt={`miniature ${idx + 1}`} className="h-20 w-full object-cover" />
							</button>
						))}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
