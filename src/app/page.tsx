import { cookies } from "next/headers";
import ProjectList from "@/components/ProjectList";
import AddProjectModal from "@/components/AddProjectModal";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { Link as LinkIcon } from "lucide-react";

export default async function HomePage() {
  const role = (await cookies()).get("role")?.value ?? "visitor";
  const isAdmin = role === "admin";

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mes Projets</h1>
          <p className="text-muted-foreground">Réalisés durant mon alternance et mes formations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <NextLink href="/presentation" className="inline-flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Mode présentation
            </NextLink>
          </Button>
          {isAdmin && <AddProjectModal />} {/* caché pour visitor */}
        </div>
      </header>

      <ProjectList isAdmin={isAdmin} />
    </main>
  );
}
