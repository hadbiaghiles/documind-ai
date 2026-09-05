# DocuMind AI

DocuMind is a polished Next.js frontend MVP for an intelligent document workspace. It includes a responsive marketing site, workspace/chat preview, source context panel, pricing, workflow, and FAQ sections.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The available checks are `npm run typecheck`, `npm run lint`, and `npm run build`.

## GitHub Pages deployment

The repository includes `.github/workflows/deploy-pages.yml`, which builds the static export and deploys it to GitHub Pages whenever `main` is updated.

1. In GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Push or merge to `main` (or run the workflow manually from the Actions tab).

For this repository, the expected URL is:

`https://hadbiaghiles.github.io/documind-ai/`

The `/documind-ai` base path is applied automatically in GitHub Actions and is not used during local development. The workflow uses the static `out/` export, so no server runtime or environment secrets are required.
