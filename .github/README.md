# `.github/` folder

This folder contains GitHub-specific configuration for this repository, primarily **GitHub Actions workflows**.

## Workflows

### `workflows/deploy-pages.yml` — Build & deploy the site to GitHub Pages

This workflow builds the dataset index, builds the Vite site, and deploys the output to **GitHub Pages**.

#### Triggers

- **On push to `main`**
- **Manual trigger** via `workflow_dispatch` (Actions → “Run workflow”)

#### What it does (high level)

1. Checks out the repository
2. Sets up Node.js (v20) and restores npm cache
3. Installs dependencies
   - Root deps (for dataset build scripts)
   - `web/` deps (for the frontend)
4. Builds the merged dataset index (`npm run data:build`)
   - Writes generated JSON into `web/public/data/`
5. Builds the frontend (`web/` → `npm run build`)
   - Outputs static files into `web/dist`
6. Uploads `web/dist` as the Pages artifact
7. Deploys the artifact to GitHub Pages

#### Required repository settings

In the repository UI:

- Settings → Pages → **Build and deployment**
  - Source: **GitHub Actions**

Once configured, your site will be published at:

- Project Pages: `https://<owner>.github.io/<repo>/`

#### Notes about Pages “enablement”

The workflow uses `actions/configure-pages@v5`. If GitHub Pages has **never been enabled** for the repo, the action may fail while trying to read the Pages site configuration.

This repository assumes Pages is enabled once via the UI (Settings → Pages → Source = GitHub Actions).

If you want a workflow that can **auto-enable** Pages for a brand-new repo, you can pass:

- `enablement: true`
- a token **other than** `GITHUB_TOKEN` (e.g., a PAT with `repo` scope / Pages write permission)

#### How to update the deployed site

Any change merged into/pushed to `main` will redeploy automatically, including:

- Dataset changes in `data/schema/*.json`
- UI changes in `web/src/*`

To redeploy without code changes, use Actions → “Run workflow”.

