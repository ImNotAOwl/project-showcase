"use client";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function TagInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  function add(tag: string) {
    const t = tag.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setDraft("");
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((t) => (
          <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => onChange(value.filter(x => x !== t))}>
            {t} ✕
          </Badge>
        ))}
      </div>
      <Input
        placeholder="Ajouter un tag puis Entrée"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(draft); } }}
      />
    </div>
  );
}

export default function ProjectForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [githubLinks, setGithubLinks] = useState<string[]>([""]);
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  function updateGithub(i: number, v: string) {
    setGithubLinks((arr) => arr.map((x, idx) => (idx === i ? v : x)));
  }
  function addGithub() { setGithubLinks((arr) => [...arr, ""]); }
  function removeGithub(i: number) { setGithubLinks((arr) => arr.filter((_, idx) => idx !== i)); }

  async function handleUpload(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return alert("Échec upload");
    const j = await res.json();
    setImageUrl(j.url);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const links = githubLinks.map(s => s.trim()).filter(Boolean);
    const payload = { title, description, siteUrl: siteUrl || undefined, githubLinks: links, tags, imageUrl: imageUrl || undefined };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setTitle(""); setDescription(""); setSiteUrl(""); setGithubLinks([""]); setTags([]); setImageUrl("");
      onCreated();
    } else {
      const j = await res.json().catch(() => ({}));
      alert("Erreur: " + (j?.error ? JSON.stringify(j.error) : res.status));
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

      {/* Image */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input type="file" accept="image/*" ref={fileRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          {imageUrl && <Button type="button" variant="secondary" onClick={() => setImageUrl("")}>Retirer</Button>}
        </div>
        {imageUrl && <img src={imageUrl} alt="preview" className="h-24 rounded border" />}
      </div>

      {/* Liens GitHub multiples */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Liens GitHub</label>
        <div className="space-y-2">
          {githubLinks.map((v, i) => (
            <div key={i} className="flex gap-2">
              <Input placeholder="https://github.com/organisation/repo" value={v} onChange={(e) => updateGithub(i, e.target.value)} />
              <Button type="button" variant="secondary" onClick={() => removeGithub(i)} disabled={githubLinks.length === 1}>−</Button>
              {i === githubLinks.length - 1 && <Button type="button" onClick={addGithub}>+ Ajouter</Button>}
            </div>
          ))}
        </div>
      </div>

      {/* Site */}
      <Input placeholder="Lien du site (https://...)" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} />

      {/* Tags */}
      <TagInput value={tags} onChange={setTags} />

      <div className="pt-2">
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  );
}