# note-taking-app

Aplicação web para criar e gerenciar notas pessoais. O usuário cria uma conta, faz login e tem acesso a uma lista de notas que só ele pode ver. Cada nota tem um título e um conteúdo opcional. Dá para criar novas notas e listar as existentes com paginação.

O projeto foi feito como exercício técnico, com foco em boas práticas de API REST, autenticação JWT, separação entre frontend e backend, e qualidade de código (testes, lint, análise de segurança).

---

## Stack

| Camada    | Tecnologia                              |
|-----------|-----------------------------------------|
| Backend   | Rails 8, API only, SQLite, Devise + JWT |
| Frontend  | Vue 3, TypeScript, Vite, Pinia, vue-i18n |
| Infra     | Docker, Nginx (serve o build do Vite no container), rack-attack |

## Rodando com Docker

```bash
docker compose up
```

- App: http://localhost:5173  
- API: http://localhost:3000

A primeira vez que subir o backend ele já roda `db:prepare` automaticamente.

## Rodando localmente (sem Docker)

Requisitos: Ruby 3.4.1 e Node 20+.

**Backend** (porta 3000):

```bash
cd backend
bin/setup        # instala gems e cria o banco
bin/rails server
```

**Frontend** (porta 5173):

```bash
cd frontend
npm install
npm run dev
```

O frontend já aponta para `http://localhost:3000` por padrão. Se precisar mudar, defina `VITE_API_URL` no ambiente antes de rodar `npm run dev`.

## Testes e qualidade

```bash
# backend
cd backend
bin/rails test           # testes
bin/rubocop              # linting
bin/brakeman --no-pager  # análise de segurança estática
bin/bundler-audit        # CVEs nas gems

# frontend
cd frontend
npm run test:unit -- --run  # testes (sem watch)
npm run lint                # oxlint + eslint com auto-fix
npm run type-check          # vue-tsc
```

## Decisões relevantes

**JWT com expiração** — autenticação stateless. O token fica no `localStorage` e é injetado automaticamente em toda requisição pelo interceptor do axios. Quando expira, o interceptor captura o 401, limpa a sessão e redireciona para `/login`.

**SQLite** — banco em arquivo, sem servidor externo. Simples de subir tanto localmente quanto em Docker. O volume `backend_storage` garante que os dados persistem entre reinicializações do container.

**Paginação server-side** — o backend usa `pagy` e retorna apenas a página solicitada. O frontend nunca recebe a lista completa.

**Rate limiting** — `rack-attack` no backend para bloquear brute force nos endpoints de autenticação.

**i18n** — todas as strings visíveis ao usuário ficam em `frontend/src/locales/pt-BR.ts`. Os erros de validação do backend também são externalizados — nenhuma string hardcoded nos componentes.
