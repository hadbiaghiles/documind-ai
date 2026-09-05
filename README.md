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

## Live RAG API (optional)

The repository now includes a FastAPI RAG service in `backend/` and a `render.yaml` blueprint. It supports PDF, DOCX, TXT, and Markdown uploads, Gemini embeddings/generation, Supabase Postgres + pgvector retrieval, CORS, and `/health`.

1. Create a Supabase project, enable the `vector` extension, and run `backend/schema.sql` in the SQL editor.
2. In Render, create a **Blueprint** from this repository and select `render.yaml`.
3. Add `DATABASE_URL` from Supabase and `GEMINI_API_KEY` in Render’s environment variables. Never commit either value.
4. Verify `https://<your-render-service>.onrender.com/health` returns `{"status":"ok","database":true,"gemini_configured":true,"rag_ready":true}`.
5. Add the exact Render URL as the GitHub repository **Variable** `NEXT_PUBLIC_API_URL`, then rerun the Pages workflow. The frontend otherwise stays in clearly labeled demo mode.

The exact public `/workspace/` URL is `https://hadbiaghiles.github.io/documind-ai/workspace/`. Live RAG is not claimed until the Render health response is reachable and Pages has been rebuilt with that variable.
