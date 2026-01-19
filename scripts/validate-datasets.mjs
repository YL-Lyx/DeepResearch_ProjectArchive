import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const repoRoot = process.cwd();
const schemaPath = path.join(repoRoot, "data", "schema", "projects.schema.json");
const datasetsDir = path.join(repoRoot, "data", "schema");

function formatAjvErrors(errors) {
  if (!errors?.length) return "Unknown validation error.";
  return errors
    .map((e) => {
      const where = e.instancePath || "(root)";
      const msg = e.message || "invalid";
      return `- ${where}: ${msg}`;
    })
    .join("\n");
}

async function loadJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Invalid JSON in ${filePath}: ${msg}`);
  }
}

async function listDatasetFiles() {
  const entries = await fs.readdir(datasetsDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .filter((name) => name !== "projects.schema.json")
    .map((name) => path.join(datasetsDir, name))
    .sort((a, b) => a.localeCompare(b));
}

function runInvariants(allProjects, fileToProjectsMap) {
  const errors = [];

  // Global uniqueness of project IDs across all datasets
  const seenIds = new Map(); // id -> file
  for (const p of allProjects) {
    const id = p?.id;
    if (typeof id !== "string" || !id.trim()) continue;
    if (seenIds.has(id)) {
      errors.push(
        `Duplicate project id "${id}" found in ${seenIds.get(id)} and ${p.__sourceFile}`
      );
    } else {
      seenIds.set(id, p.__sourceFile);
    }
  }

  // Per-project invariants
  for (const p of allProjects) {
    const images = Array.isArray(p.images) ? p.images : [];
    if (images.length !== 3) {
      errors.push(
        `Project "${p.id}" in ${p.__sourceFile} must have exactly 3 images (found ${images.length}).`
      );
    }
    const urls = images.map((im) => im?.url).filter(Boolean);
    const uniqueUrls = new Set(urls);
    if (uniqueUrls.size !== urls.length) {
      errors.push(
        `Project "${p.id}" in ${p.__sourceFile} has duplicate image.url values; images must be deduplicated.`
      );
    }
    for (const im of images) {
      if (!im?.url || !im?.sourceUrl) {
        errors.push(
          `Project "${p.id}" in ${p.__sourceFile} has an image missing url or sourceUrl.`
        );
      }
    }
  }

  // Basic sanity: at least one dataset file produces projects
  const datasetCount = Object.keys(fileToProjectsMap).length;
  if (datasetCount > 0 && allProjects.length === 0) {
    errors.push("No projects found across dataset files.");
  }

  return errors;
}

export async function validateAllDatasets() {
  const schema = await loadJson(schemaPath);
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const files = await listDatasetFiles();
  if (files.length === 0) {
    throw new Error(`No dataset JSON files found in ${datasetsDir}`);
  }

  const allProjects = [];
  const fileToProjectsMap = {};
  const failures = [];

  for (const filePath of files) {
    const json = await loadJson(filePath);
    const ok = validate(json);
    if (!ok) {
      failures.push(`Schema validation failed for ${filePath}:\n${formatAjvErrors(validate.errors)}`);
      continue;
    }
    const projects = Array.isArray(json.projects) ? json.projects : [];
    fileToProjectsMap[filePath] = projects;
    for (const p of projects) {
      allProjects.push({ ...p, __sourceFile: filePath });
    }
  }

  const invariantErrors = runInvariants(allProjects, fileToProjectsMap);
  if (failures.length || invariantErrors.length) {
    const msg = [
      ...failures,
      ...(invariantErrors.length ? [`Invariant checks failed:\n- ${invariantErrors.join("\n- ")}`] : [])
    ].join("\n\n");
    const err = new Error(msg);
    err.failures = failures;
    err.invariantErrors = invariantErrors;
    throw err;
  }

  // Strip internal fields before returning.
  const cleanProjects = allProjects.map(({ __sourceFile, ...rest }) => rest);
  return {
    files,
    projects: cleanProjects
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const res = await validateAllDatasets();
    console.log(`OK: validated ${res.files.length} dataset file(s), ${res.projects.length} project(s).`);
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  }
}

