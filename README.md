# Central Lucro Real V2 - Conectado

Esta versão já está conectada ao projeto Supabase `ep-finance`.
As tabelas usadas são isoladas pelo prefixo `lr_`:
- lr_perfis
- lr_empresas
- lr_demandas
- lr_pendencias

O banco começa sem empresas e demandas fictícias.

## Rodar
`npm install`
`npm run dev`

## Netlify
Build command: `npm run build`
Publish directory: `dist`

Não é necessário configurar variáveis de ambiente para o Supabase nesta versão.
O sistema usa Supabase Auth para login e senha.
