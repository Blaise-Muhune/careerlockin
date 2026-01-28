-- Add source_id and verification_status for RAG grounding and URL validation
alter table public.resources
  add column if not exists source_id text,
  add column if not exists verification_status text check (verification_status is null or verification_status in ('verified', 'unverified', 'fallback'));
