"use client";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import type { StartHereConfig, StartHerePath } from "@mw/types";
import { updateStartHereAction } from "@/app/actions/settings.actions";

const DEFAULT_PATHS: StartHerePath[] = [
  { id: "feeling-lost", title: "I feel lost", blurb: "", targetTags: [], targetCategory: "self-actualization", deeperCtaLabel: "Start reading", deeperCtaHref: "/wisdom" },
  { id: "deeper-meaning", title: "I want deeper meaning", blurb: "", targetTags: [], targetCategory: "science-of-consciousness", deeperCtaLabel: "Explore", deeperCtaHref: "/wisdom" },
  { id: "relationships", title: "My relationships are struggling", blurb: "", targetTags: [], targetCategory: "conscious-relationships", deeperCtaLabel: "Read more", deeperCtaHref: "/wisdom/conscious-relationships" },
  { id: "spirituality", title: "I want to explore spirituality", blurb: "", targetTags: [], targetCategory: "source-code", deeperCtaLabel: "Begin here", deeperCtaHref: "/our-ideal" },
];

interface PathFieldProps {
  path: StartHerePath;
  index: number;
  onChange: (i: number, patch: Partial<StartHerePath>) => void;
}

function PathField({ path, index, onChange }: PathFieldProps) {
  return (
    <div className="space-y-3 pb-5 border-b border-border last:border-0 last:pb-0">
      <p className="text-sm font-semibold text-text">{index + 1}. Path</p>
      <div>
        <label htmlFor={`sh-title-${index}`} className="block text-xs font-medium text-muted mb-1">Title</label>
        <input
          id={`sh-title-${index}`}
          value={path.title}
          onChange={(e) => onChange(index, { title: e.target.value })}
          className="field"
        />
      </div>
      <div>
        <label htmlFor={`sh-blurb-${index}`} className="block text-xs font-medium text-muted mb-1">Blurb</label>
        <textarea
          id={`sh-blurb-${index}`}
          rows={2}
          value={path.blurb}
          onChange={(e) => onChange(index, { blurb: e.target.value })}
          className="field resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`sh-cta-label-${index}`} className="block text-xs font-medium text-muted mb-1">CTA Label</label>
          <input
            id={`sh-cta-label-${index}`}
            value={path.deeperCtaLabel}
            onChange={(e) => onChange(index, { deeperCtaLabel: e.target.value })}
            className="field"
          />
        </div>
        <div>
          <label htmlFor={`sh-cta-href-${index}`} className="block text-xs font-medium text-muted mb-1">CTA href</label>
          <input
            id={`sh-cta-href-${index}`}
            value={path.deeperCtaHref}
            onChange={(e) => onChange(index, { deeperCtaHref: e.target.value })}
            className="field"
          />
        </div>
      </div>
    </div>
  );
}

export function StartHereForm({ config }: { config: StartHereConfig }) {
  const [isPending, startTransition] = useTransition();
  const [paths, setPaths] = useState<StartHerePath[]>(
    config.length ? [...config] : DEFAULT_PATHS
  );

  const updatePath = (i: number, patch: Partial<StartHerePath>) => {
    setPaths((prev) => prev.map((p, idx) => idx === i ? { ...p, ...patch } : p));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateStartHereAction(paths);
      if (result.ok) toast.success("Start Here updated");
      else toast.error(result.error ?? "Failed");
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {paths.map((path, i) => (
        <PathField key={path.id} path={path} index={i} onChange={updatePath} />
      ))}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {isPending ? "Saving…" : "Save Start Here"}
        </button>
      </div>
    </form>
  );
}
