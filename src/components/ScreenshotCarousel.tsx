"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ScreenshotCarousel({ images }: { images: string[] }) {
	const [i, setI] = useState(0);
	if (!images || images.length === 0) return null;

	function prev() { setI((i - 1 + images.length) % images.length); }
	function next() { setI((i + 1) % images.length); }

	return (
		<div className="w-full relative overflow-hidden rounded border">
			<img
				src={images[i]}
				alt={`screenshot ${i + 1}/${images.length}`}
				className="w-full h-64 object-cover"
			/>
			{images.length > 1 && (
				<>
					<Button type="button" variant="secondary"
						className="absolute left-2 top-1/2 -translate-y-1/2"
						onClick={prev}>
						←
					</Button>
					<Button type="button" variant="secondary"
						className="absolute right-2 top-1/2 -translate-y-1/2"
						onClick={next}>
						→
					</Button>
					<div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
						{images.map((_, idx) => (
							<span
								key={idx}
								className={`h-2 w-2 rounded-full ${idx === i ? "bg-white" : "bg-white/50"}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}
