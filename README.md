# DocuMind AI

Static frontend on GitHub Pages plus optional RAG backend.
Live: https://hadbiaghiles.github.io/documind-ai/

## Architecture
- PDF/DOCX extract chunk embed retrieve answer
- Frontend uses NEXT_PUBLIC_API_URL; mock if unset
- Render Free primary host

## Backend
See backend/README.md for French setup steps.
Pipeline uses Supabase pgvector and Google generative models.
## Pages
Redeploy Pages after configuring the public backend URL.
Full free-tier setup: backend/README.md
