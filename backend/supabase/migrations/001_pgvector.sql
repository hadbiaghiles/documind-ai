-- DocuMind AI — pgvector schema (Supabase Free)
-- Run in Supabase SQL Editor (Dashboard → SQL → New query).

create extension if not exists vector;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  content_type text,
  byte_size integer,
  created_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding vector(768) not null,
  created_at timestamptz not null default now()
);

create index if not exists document_chunks_document_id_idx
  on public.document_chunks (document_id);

-- IVFFlat is optional on free tier for small corpora; HNSW needs more resources.
-- Cosine distance search via RPC below works without an ANN index for small datasets.
create index if not exists document_chunks_embedding_ivfflat_idx
  on public.document_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function public.match_document_chunks(
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  id uuid,
  document_id uuid,
  filename text,
  chunk_index integer,
  content text,
  similarity float
)
language sql
stable
as $$
  select
    c.id,
    c.document_id,
    d.filename,
    c.chunk_index,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  join public.documents d on d.id = c.document_id
  order by c.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

-- Service role bypasses RLS; still enable RLS so anon key cannot read embeddings.
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
