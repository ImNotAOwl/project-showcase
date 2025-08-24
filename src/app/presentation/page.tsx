import { Suspense } from "react";
import PresentationClient from "./presentation-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
	return (
		<Suspense fallback={<div className="p-8">Chargement…</div>}>
			<PresentationClient />
		</Suspense>
	);
}
