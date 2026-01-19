import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { validateAllDatasets } from "./validate-datasets.mjs";

function isoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function writeJson(filePath, obj) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function stableSortProjects(projects) {
  return [...projects].sort((a, b) => {
    const ay = typeof a.year === "number" ? a.year : 0;
    const by = typeof b.year === "number" ? b.year : 0;
    if (by !== ay) return by - ay;
    const at = (a.title || "").toString();
    const bt = (b.title || "").toString();
    return at.localeCompare(bt);
  });
}

export async function buildProjectIndex() {
  const repoRoot = process.cwd();
  const outDir = path.join(repoRoot, "web", "public", "data");
  const indexPath = path.join(outDir, "projects.index.json");
  const metaPath = path.join(outDir, "meta.json");

  const { files, projects } = await validateAllDatasets();
  const sorted = stableSortProjects(projects);

  const generatedAt = isoDate();
  const datasetFiles = files.map((f) => path.relative(repoRoot, f).replaceAll("\\", "/"));

  const index = {
    schemaVersion: "1.0.0",
    generatedAt,
    source: {
      generator: "PDF-Gallery build-project-index",
      notes: "Merged datasets from data/schema"
    },
    datasets: datasetFiles,
    projects: sorted
  };

  const meta = {
    generatedAt,
    datasetCount: datasetFiles.length,
    projectCount: sorted.length,
    datasetFiles
  };

  await writeJson(indexPath, index);
  await writeJson(metaPath, meta);

  return { indexPath, metaPath, projectCount: sorted.length, datasetCount: datasetFiles.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const res = await buildProjectIndex();
    console.log(
      `Wrote ${res.projectCount} project(s) from ${res.datasetCount} dataset file(s) to:\n- ${res.indexPath}\n- ${res.metaPath}`
    );
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  }
}

