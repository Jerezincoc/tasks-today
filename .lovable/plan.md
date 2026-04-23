
## Todo List App com Autenticação

**Nota técnica importante:** Este ambiente Lovable usa **TanStack Start (React 19 + Vite)** em vez de Next.js, e **Lovable Cloud** (Supabase gerenciado) em vez de configurar Supabase manualmente. O resultado funcional é idêntico ao que você pediu — autenticação, RLS, banco Postgres, deploy de um clique — apenas o framework e a forma de provisionar o backend mudam. As variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` são injetadas automaticamente como `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Deploy é feito pelo botão **Publish** (não Vercel, mas igualmente um clique).

### Autenticação
- Páginas `/auth` (login + cadastro em abas) e `/auth/callback` para confirmação de email
- Cadastro com email/senha e **verificação obrigatória de email** antes de acessar `/`
- Persistência automática de sessão via `localStorage`
- Botão de logout no header
- Mensagens de erro claras: email inválido, senha fraca, credenciais incorretas, usuário já existente, email não confirmado
- Rota protegida `_authenticated` que redireciona para `/auth` se não logado

### Banco de Dados
Tabela `tasks` com os campos solicitados (`id`, `user_id`, `title`, `completed`, `created_at`) e **RLS ativado** com 4 políticas (SELECT/INSERT/UPDATE/DELETE) restringindo cada usuário às próprias tarefas via `auth.uid() = user_id`.

### Funcionalidades da Todo List
- Input no topo para criar nova tarefa (Enter ou botão "Adicionar")
- Lista de tarefas do usuário, ordenada por mais recentes primeiro
- Checkbox para marcar/desmarcar como concluída (com animação de risco no texto)
- Botão de lixeira para deletar (com confirmação inline)
- **Seções separadas:** "Pendentes" no topo, "Concluídas" abaixo (recolhível)
- **Realtime:** assinatura Supabase Realtime para refletir mudanças instantaneamente
- Estados de loading (skeleton ao carregar) e toasts de sucesso/erro

### Interface
- Design minimalista, fundo claro com acentos sutis, tipografia limpa
- Totalmente responsivo (mobile-first)
- Header fixo com email do usuário + botão sair
- Cards de tarefa com hover states e transições suaves
- Empty state amigável quando não há tarefas
- Toasts (sonner) para feedback de ações

### Estrutura de Código
- `src/routes/` — `index.tsx` (lista), `auth.tsx` (login/cadastro), `auth.callback.tsx`, `_authenticated.tsx` (guard)
- `src/components/` — `TaskItem`, `TaskInput`, `TaskList`, `Header`, `AuthForm`
- `src/hooks/` — `useAuth`, `useTasks` (CRUD + realtime)
- `src/integrations/supabase/` — client já configurado pelo Lovable Cloud
- Validação de input com Zod (título: 1–500 chars, trim)

Pronto para clicar em **Implement plan** para construir tudo.
