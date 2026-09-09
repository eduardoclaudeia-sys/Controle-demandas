# Central Lucro Real V2

Sem dados fictícios. Usa Supabase para login, senha e banco.

1. Execute `supabase-schema.sql` no SQL Editor do Supabase.
2. Crie `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. `npm install` e `npm run dev`.
4. Na Netlify: build `npm run build`, publish `dist`, e cadastre as duas variáveis de ambiente.
5. Login/senha ficam no Supabase Auth; não salve senhas em tabelas próprias.
6. Você pode criar os dois usuários em Authentication > Users ou usar a tela Criar conta.
