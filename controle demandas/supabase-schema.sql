-- Central Lucro Real - schema inicial
create extension if not exists pgcrypto;

create table if not exists empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text,
  criado_em timestamptz not null default now()
);

create table if not exists demandas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) on delete cascade,
  titulo text not null,
  setor text not null check (setor in ('Fiscal','Contábil')),
  categoria text,
  competencia text,
  prazo date,
  responsavel_id uuid references perfis(id),
  prioridade text not null default 'Média',
  status text not null default 'A fazer',
  observacao text,
  criado_em timestamptz not null default now()
);

create table if not exists pendencias (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) on delete cascade,
  demanda_id uuid references demandas(id) on delete cascade,
  descricao text not null,
  competencia text,
  concluido boolean not null default false,
  criado_em timestamptz not null default now()
);

alter table empresas enable row level security;
alter table perfis enable row level security;
alter table demandas enable row level security;
alter table pendencias enable row level security;

create policy "usuarios autenticados podem ler empresas" on empresas
for select to authenticated using (true);

create policy "usuarios autenticados podem gerenciar empresas" on empresas
for all to authenticated using (true) with check (true);

create policy "usuarios autenticados podem ler perfis" on perfis
for select to authenticated using (true);

create policy "usuarios autenticados podem gerenciar demandas" on demandas
for all to authenticated using (true) with check (true);

create policy "usuarios autenticados podem gerenciar pendencias" on pendencias
for all to authenticated using (true) with check (true);
