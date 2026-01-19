import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages (project pages) requires a base of "/<repo>/".
// In GitHub Actions, GITHUB_REPOSITORY is "<owner>/<repo>".
export default defineConfig(() => {
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
  const base = repo ? `/${repo}/` : "/";
  return {
    base,
    plugins: [react()]
  };
});
