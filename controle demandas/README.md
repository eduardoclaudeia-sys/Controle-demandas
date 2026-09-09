# Central Lucro Real

Primeiro protótipo para controle de demandas Fiscal e Contábil de empresas do Lucro Real.

## Rodar localmente
1. Instale Node.js 20+
2. `npm install`
3. `npm run dev`

## Supabase
1. Crie um projeto no Supabase.
2. Abra SQL Editor.
3. Execute `supabase-schema.sql`.
4. Copie `.env.example` para `.env`.
5. Preencha:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

Nesta V1 a interface funciona com dados locais para prototipação. O schema já deixa o banco preparado para a próxima etapa, quando CRUD e autenticação serão ligados ao Supabase.

## GitHub
Crie um repositório chamado `central-lucro-real` e envie estes arquivos.

## Netlify
- Add new site > Import an existing project
- Selecione GitHub
- Build command: `npm run build`
- Publish directory: `dist`
- Adicione as variáveis do `.env` em Site configuration > Environment variables.

O arquivo `netlify.toml` já inclui o redirect necessário para SPA.
