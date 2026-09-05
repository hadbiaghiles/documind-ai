# DocuMind AI — Backend RAG (free tier)

API FastAPI : **PDF/DOCX → extraction → chunking → embeddings Gemini → Supabase pgvector → réponse Gemini avec sources**.

## Stack

| Composant | Choix free-tier |
|-----------|-----------------|
| LLM + embeddings | Google Gemini (`gemini-2.0-flash` + `text-embedding-004`) — **même clé** |
| Vecteurs | Supabase Free + extension `pgvector` |
| Hébergement | Render Free (Docker) — optionnel Hugging Face Spaces |

## Endpoints

- `GET /health` — statut + flags de config
- `GET /api/documents` — liste des documents
- `POST /api/documents/upload` — upload multipart (`file`)
- `DELETE /api/documents/{id}` — suppression
- `POST /api/chat` — `{ "question": "..." }` → réponse + sources

## Variables d'environnement

Documentées dans `.env.example` (ne jamais committer de secrets) :

```
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CORS_ORIGINS=https://hadbiaghiles.github.io
```

## 1. Supabase (gratuit)

1. Créez un projet sur [supabase.com](https://supabase.com).
2. **SQL Editor** → coller / exécuter `supabase/migrations/001_pgvector.sql`.
3. **Project Settings → API** :
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = `service_role` (secret serveur uniquement — jamais dans le frontend)
4. Vérifiez que l'extension `vector` est active (Database → Extensions).

> Note IVFFlat : sur un corpus tout petit, l'index peut exiger quelques lignes avant d'être utile. La RPC `match_document_chunks` fonctionne quand même.

## 2. Clé Gemini

1. [Google AI Studio](https://aistudio.google.com/apikey) → Create API key.
2. Utilisée pour le chat **et** les embeddings (`text-embedding-004`, dimension 768).

Si Gemini embeddings n'étaient plus disponibles un jour : alternative free-tier possible = `sentence-transformers` / Hugging Face Inference, mais cela est plus lourd pour Render Free (RAM). Préférez Gemini tant que la même clé fonctionne.

## 3. Déploiement Render Free

1. [render.com](https://render.com) → New → Web Service → connectez ce repo.
2. Root Directory : `backend` — Runtime : Docker (`Dockerfile`).
3. Plan **Free**.
4. Environment :
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CORS_ORIGINS=https://hadbiaghiles.github.io`
5. Déployez. Health check : `/health`.
6. Copiez l'URL publique (ex. `https://documind-ai-backend.onrender.com`).

Blueprint optionnel : `render.yaml` à la racine du service (`rootDir: backend`).

### Limites Render Free

- Spin-down après inactivité (~15 min) — le premier appel peut prendre 30–60 s.
- Pas de disque persistant : les fichiers ne sont pas stockés sur le conteneur (seulement métadonnées + chunks dans Supabase).

## 4. Frontend (GitHub Pages)

Sur le build Pages / Actions, définissez :

```
NEXT_PUBLIC_API_URL=https://VOTRE-SERVICE.onrender.com
```

Le frontend garde `output: "export"`. **Ne mettez jamais `GEMINI_API_KEY` ni la `service_role` dans le frontend.**

## 5. Local

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # remplir les valeurs
uvicorn app.main:app --reload --port 8000
```

Docs interactives : http://localhost:8000/docs

## Option Hugging Face Spaces

1. Space Docker, copier le dossier `backend/`.
2. Secrets Space : mêmes variables que Render.
3. Port 7860 souvent attendu — adapter `CMD` :
   `uvicorn app.main:app --host 0.0.0.0 --port 7860`

## Sécurité

- CORS limité à l'origine Pages.
- RLS activé sur les tables ; seul le `service_role` (backend) écrit/lit.
- Aucune clé API dans le dépôt git.
