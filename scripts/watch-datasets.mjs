import chokidar from "chokidar";
import path from "node:path";
import process from "node:process";

import { buildProjectIndex } from "./build-project-index.mjs";

const repoRoot = process.cwd();
const watchDir = path.join(repoRoot, "data", "schema");

let building = false;
let queued = false;

async function rebuild(reason) {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  queued = false;
  try {
    const res = await buildProjectIndex();
    console.log(
      `[data:watch] ${reason} -> wrote ${res.projectCount} project(s) from ${res.datasetCount} dataset(s)`
    );
  } catch (e) {
    console.error(`[data:watch] build failed:\n${e instanceof Error ? e.message : String(e)}`);
  } finally {
    building = false;
    if (queued) {
      await rebuild("queued change");
    }
  }
}

console.log(`[data:watch] Watching ${watchDir}`);

const watcher = chokidar.watch([`${watchDir}/*.json`], {
  ignoreInitial: false,
  awaitWriteFinish: {
    stabilityThreshold: 200,
    pollInterval: 50
  }
});

watcher.on("all", async (event, filePath) => {
  const name = path.basename(filePath);
  if (name === "projects.schema.json") return;
  await rebuild(`${event}: ${name}`);
});

process.on("SIGINT", async () => {
  await watcher.close();
  process.exit(0);
});

