-- CENTRAL LUCRO REAL - MURAL DE OBSERVAÇÕES
-- Execute no SQL Editor do projeto ep-finance.

create table if not exists public.lr_observacoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.lr_empresas(id) on delete cascade,
  titulo text not null,
  texto text not null,
  autor_id uuid references auth.users(id) on delete set null,
  autor_nome text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.lr_observacao_anexos (
  id uuid primary key default gen_random_uuid(),
  observacao_id uuid not null references public.lr_observacoes(id) on delete cascade,
  nome text not null,
  caminho text not null unique,
  tipo text,
  tamanho bigint,
  criado_em timestamptz not null default now()
);

alter table public.lr_observacoes enable row level security;
alter table public.lr_observacao_anexos enable row level security;

drop policy if exists lr_observacoes_all on public.lr_observacoes;
create policy lr_observacoes_all on public.lr_observacoes
for all to authenticated using (true) with check (true);

drop policy if exists lr_observacao_anexos_all on public.lr_observacao_anexos;
create policy lr_observacao_anexos_all on public.lr_observacao_anexos
for all to authenticated using (true) with check (true);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'lr-observacoes',
  'lr-observacoes',
  false,
  20971520,
  array[
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'text/csv'
  ]
)
on conflict (id) do update set
  public=false,
  file_size_limit=20971520,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists lr_obs_storage_select on storage.objects;
create policy lr_obs_storage_select on storage.objects
for select to authenticated using (bucket_id='lr-observacoes');

drop policy if exists lr_obs_storage_insert on storage.objects;
create policy lr_obs_storage_insert on storage.objects
for insert to authenticated with check (bucket_id='lr-observacoes');

drop policy if exists lr_obs_storage_update on storage.objects;
create policy lr_obs_storage_update on storage.objects
for update to authenticated using (bucket_id='lr-observacoes') with check (bucket_id='lr-observacoes');

drop policy if exists lr_obs_storage_delete on storage.objects;
create policy lr_obs_storage_delete on storage.objects
for delete to authenticated using (bucket_id='lr-observacoes');
