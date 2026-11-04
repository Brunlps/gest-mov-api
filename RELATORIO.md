# Relatório do projeto — gest-mov-api

Data: 2026-11-04 · Branch: `main` · Último commit: "entidades usuarios e imoveis."

## 1. Visão geral

API REST para gestão de imóveis (locação), em **Node.js + Express 5 + Prisma 6 + PostgreSQL** (CommonJS).
Dependências já instaladas mas ainda não usadas: `bcrypt`, `jsonwebtoken`, `multer`.
Script único: `npm run dev` (nodemon). Não há testes, `.env.example`, README nem migrations.

## 2. Estrutura

```
app.js                      servidor, porta 3000 fixa
prisma/schema.prisma        8 modelos
src/routes/                 niveis, imoveisTipo, usuarios
src/controllers/            niveis, imoveisTipo, usuarios (CRUD)
src/middlewares/            validadorDados (niveis, imoveisTipo)
src/services/index.js       PrismaClient
```

Modelos: `niveis`, `usuarios`, `imoveis_tipo`, `imoveis`, `locatarios`, `historico_imovel`, `historico_manutencoes`.

## 3. Estado de implementação

| Recurso | Schema | Controller | Rota | Montado no app |
|---|---|---|---|---|
| niveis | ok | ok (com bug) | ok | sim |
| imoveis_tipo | ok | ok (com bug) | ok | sim |
| usuarios | ok | com bugs | **copiada de imoveisTipo** | **não (quebra o app)** |
| imoveis, locatarios, históricos | ok | — | — | — |

## 4. Problemas encontrados

### Críticos (a aplicação não sobe ou não funciona)

1. **[app.js:5](app.js#L5)** — `require("./src/routes/")` aponta para uma pasta sem `index.js` → `Cannot find module`. O servidor **não inicia**. Além disso, a variável `usuarios` nunca é montada com `app.use`. Correto: `require("./src/routes/usuariosRoutes")` + `app.use("/usuarios", usuarios)`.
2. **[usuariosRoutes.js](src/routes/usuariosRoutes.js)** — importa o controller e o middleware de **imoveisTipo** (cópia). Deveria usar `usuariosController`.
3. **[usuariosController.js:49-66](src/controllers/usuariosController.js#L49-L66)** — `editar` usa `id` sem ter extraído de `req.params` → `ReferenceError`. Também desestrutura variáveis que não usa.
4. **Middlewares ([niveisMiddlewares.js](src/middlewares/niveisMiddlewares.js), [imoveisTipoMiddlewares.js](src/middlewares/imoveisTipoMiddlewares.js))**:
   - `req.boby` (typo de `req.body`) → `TypeError` ao desestruturar `undefined`; toda rota que usa o middleware (POST/PUT de imoveis-tipo) falha.
   - Falta `return` após `res.json(...)`: mesmo com nome ausente, `next()` é chamado e há dupla resposta (`ERR_HTTP_HEADERS_SENT`).
   - Mensagem com typo: "insformada". Os dois arquivos são idênticos (duplicação).
   - O middleware de niveis nem é usado em `niveisRoutes`.
5. **Banco/schema** — não existem migrations (`prisma/migrations` ausente) e não há `.env` versionado; `DATABASE_URL` é obrigatório. `src/generated/prisma` está no `.gitignore`, então é preciso rodar `npx prisma generate` após clonar (sem isso `services/index.js` falha).
6. **`historico_manutencoes`** — o modelo foi renomeado de `historico_manutecao`; sem `@@map` o Prisma busca uma tabela inexistente (item da Tarefa 7 do TAREFAS.md). O campo de relação em `imoveis` ainda se chama `historico_manutecao` (inconsistente).

### Bugs de lógica / robustez

7. **`error.messager`** (typo de `message`) em `buscar` de [niveisController.js:11](src/controllers/niveisController.js#L11), [imoveisTipoController.js](src/controllers/imoveisTipoController.js) e [usuariosController.js](src/controllers/usuariosController.js) → `description: undefined`.
8. **`req.json`** em vez de `res.json` no `catch` de `buscar` (imoveisTipo e usuarios) → o erro vira outro erro e a requisição fica pendurada.
9. **Respostas de erro com HTTP 200** — todos os erros retornam status 200. Deveria usar 400/404/500, e 201 para criação.
10. **`editar` aceita `req.body` inteiro** como `data` (mass assignment): o cliente pode alterar `id`, `createdAt`, etc. Também não atualiza `updatedAt`.
11. Variáveis `resposta` declaradas e não usadas; `update`/`delete` de id inexistente devolvem erro genérico do Prisma.

### Segurança

12. **Senha em texto puro** — `usuarios.criar` grava `senha` sem hash, apesar de `bcrypt` estar instalado.
13. **`GET /usuarios` devolveria o campo `senha`** (inclusive hash) a qualquer um; usar `select`/omitir.
14. **Sem autenticação/autorização** — nenhuma rota é protegida; `jsonwebtoken` ainda não é usado, e a tabela `niveis` (perfis) não influencia nada.
15. **`cors()` aberto** para qualquer origem.
16. Sem validação de formato (e-mail, UUID, tamanhos `VarChar`), nem limite de tamanho de payload específico.
17. Erros internos do Prisma são devolvidos crus ao cliente (`error.message`), expondo detalhes do banco.

### Qualidade / manutenção

18. **Código duplicado**: os três controllers são CRUDs quase idênticos; os dois middlewares são idênticos.
19. **Porta 3000 fixa** — deveria vir de `process.env.PORT`.
20. **Nomes no schema**: `usuarios.n_veis_id` mapeia para a coluna `"níveis_id"` (acento) — gerado por introspecção; considerar `nivel_id`. `imoveis.logrador` (typo de "logradouro"). `valor_aluguel` etc. como `Float` em vez de `Decimal` (dinheiro).
21. `imoveis.valor_aluguel`/`iptu`/`valor_condominio` e demais nomes misturam convenções (`createdAt` camelCase vs `snake_case`).
22. `prisma.config.ts` importa `dotenv/config`, mas `dotenv` não está em `package.json`; `prisma` e `nodemon` estão em `dependencies` (deveriam ser `devDependencies`); `main` aponta para `index.js` inexistente; `multer` sem uso.
23. [TAREFAS.md](TAREFAS.md) está **desatualizado**: as Tarefas 1–6 já foram resolvidas no código (rotas de niveis, `res.json`, `message` em `criar/editar/deletar`, app.js), exceto o typo `messager` que persiste em `buscar`. Só a Tarefa 7 segue pendente.

## 5. Pontos positivos

- Estrutura em camadas clara (routes → controllers → services) e nomenclatura consistente.
- Schema relacional bem pensado: UUIDs, FKs nomeadas, histórico de locação e de manutenção, `cpf_cnpj` e `email` únicos.
- `.env` e o client gerado estão fora do versionamento.
- Commits pequenos e história limpa.

## 6. Plano de ação sugerido (ordem)

1. Corrigir `app.js` (require de `usuariosRoutes` + `app.use("/usuarios", ...)`) para o servidor subir.
2. Reescrever `usuariosRoutes` e `usuariosController` (id em `editar`, `res.json`, `message`), com hash `bcrypt` e sem expor `senha`.
3. Corrigir middleware (`req.body`, `return`) e unificá-lo num único validador genérico.
4. Corrigir `messager` → `message` e `req.json` → `res.json` em todos os `buscar`.
5. Adicionar `@@map("historico_manutecao")` (ou migrar o banco), rodar `npx prisma generate` e criar a primeira migration.
6. Padronizar status HTTP e tratamento de erros (middleware global de erro).
7. Implementar login com JWT e proteção das rotas por nível.
8. Criar controllers/rotas de `imoveis`, `locatarios` e históricos.
9. Adicionar `.env.example`, README, `PORT` por env, mover `prisma`/`nodemon` para devDependencies e adicionar `dotenv`.
10. Atualizar/arquivar o TAREFAS.md e incluir testes básicos.
