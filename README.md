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

## V3 - Mural de Observações
Foi adicionada a aba **Observações** com:
- mural em cartões
- observações gerais ou vinculadas a uma empresa
- busca e filtro por empresa
- anexos PDF, XLS, XLSX, XLSM e CSV
- limite de 20 MB por arquivo
- download de anexos
- exclusão da observação e dos anexos
- autor e data/hora da publicação

### Banco/Storage
Antes de publicar esta V3, execute **supabase-observacoes.sql** no SQL Editor do projeto Supabase. Ele cria/protege as tabelas e o bucket privado de arquivos.
