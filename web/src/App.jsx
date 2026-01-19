import React, { useEffect, useMemo, useState } from "react";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function cleanText(value) {
  if (!value) return "";
  const s = String(value);
  // Remove LLM citation artifacts like:
  // ":contentReference[oaicite:12]{index=12}:contentReference[oaicite:13]{index=13}"
  return s
    .replace(/\s*:?\s*contentReference\[oaicite:\d+]\{index=\d+}/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .trim();
}

function shouldShowExpand(text, thresholdChars = 420) {
  return cleanText(text).length > thresholdChars;
}

function ExpandableText({ label, text, className, collapsedLines = 6 }) {
  const [open, setOpen] = useState(false);
  const cleaned = cleanText(text);
  const canExpand = shouldShowExpand(cleaned);
  if (!cleaned) return null;

  return (
    <div className={classNames("grid gap-2", className)}>
      {label ? (
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
          {label}
        </div>
      ) : null}
      <div
        className={classNames(
          "text-sm leading-6 text-neutral-800",
          !open ? `clamp-${collapsedLines}` : null
        )}
      >
        {cleaned}
      </div>
      {canExpand ? (
        <button
          type="button"
          className="w-fit rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700 shadow-sm">
      {children}
    </span>
  );
}

function ExternalLink({ href, children, className }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={classNames(
        "text-neutral-700 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900",
        className
      )}
    >
      {children}
    </a>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="text-sm font-semibold text-neutral-900">{title}</div>
          <button
            className="rounded-xl border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function SafeImage({
  src,
  alt,
  className,
  containerClassName,
  sourceUrl,
  sourceName,
  loading = "lazy",
  fit = "cover"
}) {
  const [failed, setFailed] = useState(false);
  const usableSrc = typeof src === "string" && src.trim().length > 0 ? src.trim() : "";
  const showFallback = failed || !usableSrc;

  return (
    <div className={classNames("relative", containerClassName)}>
      {!showFallback ? (
        <img
          src={usableSrc}
          alt={alt || "image"}
          className={classNames(className, fit === "contain" ? "object-contain" : "object-cover")}
          loading={loading}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className={classNames(
            "grid h-full w-full place-items-center bg-neutral-100 text-center text-xs text-neutral-600",
            className
          )}
        >
          <div className="px-4">
            <div className="font-medium text-neutral-700">Image unavailable</div>
            {sourceUrl ? (
              <div className="mt-1">
                <ExternalLink href={sourceUrl} className="text-xs">
                  Open source{sourceName ? ` (${sourceName})` : ""}
                </ExternalLink>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function Gallery({ images }) {
  const safeImages = Array.isArray(images) ? images : [];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [safeImages.length]);

  const current = safeImages[idx];

  if (!current) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
        No images available.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
        <SafeImage
          src={current.url}
          alt={current.alt || "project image"}
          className="h-[380px] w-full md:h-[520px]"
          sourceUrl={current.sourceUrl}
          sourceName={current.sourceName}
        />
        <div className="border-t border-neutral-200 bg-white px-4 py-3 text-xs text-neutral-600">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {current.role ? <span className="font-medium">{current.role}</span> : null}
            {current.sourceName && current.sourceUrl ? (
              <span>
                Source:{" "}
                <ExternalLink href={current.sourceUrl}>{current.sourceName}</ExternalLink>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {safeImages.map((im, i) => (
          <button
            key={`${im.url}-${i}`}
            onClick={() => setIdx(i)}
            className={classNames(
              "group overflow-hidden rounded-2xl border bg-white text-left shadow-sm hover:bg-neutral-50",
              i === idx ? "border-neutral-900" : "border-neutral-200"
            )}
          >
            <div className="grid grid-cols-[96px_1fr] gap-3 p-3">
              <div className="overflow-hidden rounded-xl bg-neutral-100">
                <SafeImage
                  src={im.url}
                  alt={im.alt || "thumbnail"}
                  className="h-20 w-24 transition-transform group-hover:scale-[1.02]"
                  sourceUrl={im.sourceUrl}
                  sourceName={im.sourceName}
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-neutral-900">
                  {cleanText(im.alt) || `Image ${i + 1}`}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                  {im.role ? <span className="rounded-md bg-neutral-100 px-2 py-0.5">{im.role}</span> : null}
                  <span>Click to view</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ p }) {
  const [open, setOpen] = useState(false);
  const cover = p.images?.[0];

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <button
          className="block w-full text-left"
          onClick={() => setOpen(true)}
          aria-label={`Open ${p.title}`}
        >
          <div className="relative">
            <div className="aspect-[16/10] w-full bg-neutral-100">
              {cover ? (
                <SafeImage
                  src={cover.url}
                  alt={cover.alt || p.title}
                  className="h-full w-full"
                  sourceUrl={cover.sourceUrl}
                  sourceName={cover.sourceName}
                />
              ) : null}
            </div>
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              {p.year ? <Chip>{p.year}</Chip> : null}
              {p.location ? <Chip>{p.location}</Chip> : null}
            </div>
          </div>
          <div className="p-5">
            <div className="text-base font-semibold text-neutral-900">{cleanText(p.title)}</div>
            <div className="mt-1 text-sm text-neutral-600">
              {(p.authors || []).map(cleanText).filter(Boolean).join(" · ")}
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-700 clamp-4">
              {cleanText(p.summary)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(p.tags || []).slice(0, 6).map((t) => (
                <Chip key={t}>{cleanText(t)}</Chip>
              ))}
            </div>
          </div>
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={p.title}>
        <div className="grid gap-5">
          <div className="flex flex-wrap items-center gap-2">
            {p.year ? <Chip>{p.year}</Chip> : null}
            {p.location ? <Chip>{p.location}</Chip> : null}
            {(p.authors || []).map((a) => (
              <Chip key={a}>{cleanText(a)}</Chip>
            ))}
          </div>

          <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <ExpandableText label="Analytical caption" text={p.analyticalCaption} collapsedLines={6} />
            <ExpandableText label="Summary" text={p.summary} collapsedLines={6} />
          </div>

          <Gallery images={p.images || []} />

          {(p.methods?.computational?.length || 0) > 0 ||
          (p.methods?.assemblyFabrication?.length || 0) > 0 ? (
            <div className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="text-sm font-semibold text-neutral-900">Methods</div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="text-xs font-medium text-neutral-500">
                    Computational
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    {(p.methods?.computational || []).map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-medium text-neutral-500">
                    Assembly / fabrication
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    {(p.methods?.assemblyFabrication || []).map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {(p.references || []).length ? (
            <div className="grid gap-2 rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="text-sm font-semibold text-neutral-900">References</div>
              <ul className="space-y-2 text-sm text-neutral-700">
                {(p.references || []).map((r, idx) => (
                  <li key={`${r.url}-${idx}`} className="leading-6">
                    <span className="mr-2 rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">
                      {cleanText(r.type)}
                    </span>
                    {r.url ? (
                      <ExternalLink href={r.url}>{cleanText(r.citation) || r.url}</ExternalLink>
                    ) : (
                      cleanText(r.citation)
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
}

export default function App() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("all");
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState({ state: "loading", error: "" });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/projects.index.json`);
        const ct = res.headers.get("content-type") || "";
        // Vite dev server returns index.html (200) for missing files; guard against that.
        if (!ct.includes("application/json")) {
          throw new Error(
            "Dataset not found. Generate it first (e.g. run the data build script to create web/public/data/projects.index.json)."
          );
        }
        if (!res.ok) throw new Error(`Failed to load dataset: ${res.status} ${res.statusText}`);
        const json = await res.json();
        const items = Array.isArray(json?.projects) ? json.projects : Array.isArray(json) ? json : [];
        if (!cancelled) {
          setProjects(items);
          setStatus({ state: "ready", error: "" });
        }
      } catch (e) {
        if (!cancelled) {
          setProjects([]);
          setStatus({ state: "error", error: e instanceof Error ? e.message : String(e) });
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const tags = useMemo(() => {
    const s = new Set();
    projects.forEach((p) => (p.tags || []).forEach((t) => s.add(t)));
    return ["all", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [projects]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return projects
      .filter((p) => (tag === "all" ? true : (p.tags || []).includes(tag)))
      .filter((p) => {
        if (!query) return true;
        const hay = [
          p.title,
          p.year,
          p.location,
          p.institutionOrPractice,
          ...(p.authors || []),
          ...(p.tags || []),
          p.summary,
          p.analyticalCaption
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(query);
      })
      .sort((a, b) => (b.year || 0) - (a.year || 0));
  }, [q, tag, projects]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="mx-auto max-w-6xl px-5 pb-6 pt-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
            Discrete &amp; Combinatorial Architecture — Project Gallery
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-neutral-600">
            A lightweight catalog of projects, systems, and platforms related to
            discrete, modular, and combinatorial design approaches.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs font-medium text-neutral-500">Search</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type: project name, author, year, tag…"
              className="mt-2 w-full border-0 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
            />
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs font-medium text-neutral-500">Tag</div>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            >
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {status.state === "loading" ? (
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm">
            Loading dataset…
          </div>
        ) : null}
        {status.state === "error" ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-sm">
            {status.error}
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-14">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Showing{" "}
            <span className="font-medium text-neutral-900">
              {filtered.length}
            </span>{" "}
            items
          </div>
          <div className="text-xs text-neutral-500">Tip: click a card to open full gallery</div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-8 text-xs text-neutral-500">
          Data is loaded from generated JSON in <span className="font-medium">data/schema/</span>;
          add more datasets and push to <span className="font-medium">main</span> to auto-deploy.
        </div>
      </footer>
    </div>
  );
}
