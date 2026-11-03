# Tarefas — correção de bugs

Marque `[x]` quando terminar cada tarefa. Faça na ordem: as primeiras desbloqueiam as seguintes.

Em cada tarefa, o bloco **✅ Código corrigido** traz o trecho completo, pronto para copiar e colar no lugar do antigo. As linhas alteradas estão marcadas com `// ← CORRIGIDO`.

Para testar, rode `npm run dev` e faça as requisições pelo Insomnia, Postman ou Thunder Client.

---

## Tarefa 1 — `buscar` nunca devolve resposta

- [ ] Concluída

**Arquivo:** [src/controllers/niveisController.js](src/controllers/niveisController.js) (linhas 3 a 12)

**Problema:** a função busca os dados, mas nunca envia nada de volta. A requisição fica "carregando" até dar timeout.

**❌ Como está:**
```js
async function buscar(req, res) {
    try {
        const linhas = await PRISMA.niveis.findMany();
    } catch(errror) {
        req.json({
            type: "error",
            description: erro.messager
        });
    }
}
```

**✅ Código corrigido:** substitua a função `buscar` inteira por esta.
```js
async function buscar(req, res) {
    try {
        const linhas = await PRISMA.niveis.findMany();
        res.json(linhas); // ← CORRIGIDO: envia os registros para quem chamou a rota
    } catch(errror) {
        req.json({
            type: "error",
            description: erro.messager
        });
    }
}
```

**Por quê:** no Express, toda rota precisa terminar com uma resposta (`res.json`, `res.send`, etc.). Se nenhuma for chamada, o cliente fica esperando para sempre.

**Teste:** `GET http://localhost:3000/niveis` deve retornar `[]` ou a lista de níveis.

---

## Tarefa 2 — Nome da variável do erro diferente no `catch`

- [ ] Concluída

**Arquivo:** [src/controllers/niveisController.js](src/controllers/niveisController.js) (linhas 6 e 9)

**Problema:** o erro é recebido como `errror` (3 "r"), mas usado como `erro`. Quando der erro, o JavaScript lança um novo erro: `ReferenceError: erro is not defined`.

**❌ Como está:**
```js
    } catch(errror) {
        req.json({
            type: "error",
            description: erro.messager
        });
    }
```

**✅ Código corrigido:** substitua a função `buscar` inteira por esta (já inclui a Tarefa 1).
```js
async function buscar(req, res) {
    try {
        const linhas = await PRISMA.niveis.findMany();
        res.json(linhas);
    } catch (error) { // ← CORRIGIDO: "error" com 2 "r"
        req.json({
            type: "error",
            description: error.messager // ← CORRIGIDO: mesmo nome do catch
        });
    }
}
```

**Por quê:** o nome entre parênteses no `catch (...)` é o nome da variável que guarda o erro. Ele precisa ser idêntico onde você usa. Use `error`, como nas outras funções do arquivo.

---

## Tarefa 3 — `req.json` em vez de `res.json`

- [ ] Concluída

**Arquivo:** [src/controllers/niveisController.js](src/controllers/niveisController.js) (linha 7)

**Problema:** `req` é a **requisição** (o que chega) e `res` é a **resposta** (o que você envia). `req.json` não existe e gera `TypeError: req.json is not a function`.

**❌ Como está:**
```js
        req.json({
```

**✅ Código corrigido:** substitua a função `buscar` inteira por esta (já inclui as Tarefas 1 e 2).
```js
async function buscar(req, res) {
    try {
        const linhas = await PRISMA.niveis.findMany();
        res.json(linhas);
    } catch (error) {
        res.json({ // ← CORRIGIDO: res (resposta), não req (requisição)
            type: "error",
            description: error.messager
        });
    }
}
```

**Dica para lembrar:** **req** = re**q**uest (pedido), **res** = res**ponse** (resposta).

---

## Tarefa 4 — `.messager` não existe

- [ ] Concluída

**Arquivo:** [src/controllers/niveisController.js](src/controllers/niveisController.js) (linha 9)

**Problema:** o objeto de erro tem a propriedade `message`, não `messager`. Com o erro de digitação, a resposta sai com `description: undefined`.

**❌ Como está:**
```js
            description: error.messager
```

**✅ Código corrigido (versão final da função):** substitua a função `buscar` inteira por esta (já inclui as Tarefas 1, 2 e 3).
```js
async function buscar(req, res) {
    try {
        const linhas = await PRISMA.niveis.findMany();
        res.json(linhas);
    } catch (error) {
        res.json({
            type: "error",
            description: error.message // ← CORRIGIDO: "message", sem o "r"
        });
    }
}
```

---

## Tarefa 5 — Rotas de criar, editar e deletar não existem

- [ ] Concluída

**Arquivo:** [src/routes/niveisRoutes.js](src/routes/niveisRoutes.js)

**Problema:** as funções `criar`, `editar` e `deletar` existem no controller, mas nenhuma rota chama elas. Por isso, `POST`, `PUT` e `DELETE` em `/niveis` retornam 404.

**❌ Como está:**
```js
const { buscar } = require("../controllers/niveisController")

const rotas = require("express").Router();

rotas.get("/", buscar);

module.exports = rotas;
```

**✅ Código corrigido:** substitua o arquivo inteiro por este.
```js
const { buscar, criar, editar, deletar } = require("../controllers/niveisController"); // ← CORRIGIDO: importa as 4 funções

const rotas = require("express").Router();

rotas.get("/", buscar);          // listar todos
rotas.post("/", criar);          // ← CORRIGIDO: criar novo
rotas.put("/:id", editar);       // ← CORRIGIDO: editar pelo id
rotas.delete("/:id", deletar);   // ← CORRIGIDO: deletar pelo id

module.exports = rotas;
```

**Por quê:** o `:id` na rota vira `req.params.id` dentro do controller. É assim que `editar` e `deletar` sabem qual registro alterar.

**Teste:**
- `POST /niveis` com o corpo `{ "nome": "Administrador" }` cria um nível.
- `GET /niveis` mostra o nível criado. Copie o `id` dele.
- `PUT /niveis/<id>` com o corpo `{ "nome": "Admin" }` edita o nível.
- `DELETE /niveis/<id>` remove o nível.

---

## Tarefa 6 — Rotas importadas e montadas duas vezes

- [ ] Concluída

**Arquivo:** [app.js](app.js) (linhas 3, 4, 14 e 15)

**Problema:** `niveisController` e `niveisRoutes` importam **o mesmo arquivo** de rotas, e o `app.use` registra esse arquivo duas vezes. Funciona por acaso, mas confunde, e o nome `niveisController` está errado (é um arquivo de rotas).

**❌ Como está:**
```js
const niveisController = require("./src/routes/niveisRoutes");
const niveisRoutes = require("./src/routes/niveisRoutes")
...
app.use("/niveis", niveisController); //middleare
app.use("/niveis", niveisRoutes); //middleare
```

**✅ Código corrigido:** substitua o arquivo `app.js` inteiro por este.
```js
const express = require("express");
const cors = require("cors");
const niveisRoutes = require("./src/routes/niveisRoutes"); // ← CORRIGIDO: importa só uma vez

const app = express();

app.use(cors()); // permite que requisições externas acessem as rotas
app.use(express.json()); // transforma o JSON do corpo da requisição em JS

app.get("/", (req, res) => {
    res.send("Olá Tapioca");
});

app.use("/niveis", niveisRoutes); // ← CORRIGIDO: registra as rotas de níveis uma vez só

app.listen(3000, () => {
    console.log("Servidor on: http://localhost:3000");
});
```

**Por quê:** o `app.js` só deve conhecer as **rotas**. Quem chama o controller são as rotas.

---

## Tarefa 7 — Tabela de manutenções renomeada só no schema

- [ ] Concluída

**Arquivo:** [prisma/schema.prisma](prisma/schema.prisma) (linhas 27 a 36)

**Problema:** o modelo mudou de `historico_manutecao` para `historico_manutencoes`. Como não há migrations, o Prisma vai procurar uma tabela `historico_manutencoes`, mas no banco ela provavelmente ainda se chama `historico_manutecao`. As consultas nessa tabela vão falhar com o erro "table does not exist".

**❌ Como está:**
```prisma
model historico_manutencoes {
  id        String    @id @db.Uuid @default(uuid())
  descricao String
  valor     Float     @default(0)
  data      DateTime  @db.Date
  imovel_id String    @db.Uuid
  createdAt DateTime  @default(now()) @db.Timestamp(6)
  updatedAt DateTime? @default(now()) @db.Timestamp(6)
  imoveis   imoveis   @relation(fields: [imovel_id], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "historico_manutecao_imovel_fk")
}
```

**✅ Código corrigido (Opção A, recomendada: mantém o nome antigo no banco e não mexe nos dados):** substitua o modelo inteiro por este.
```prisma
model historico_manutencoes {
  id        String    @id @db.Uuid @default(uuid())
  descricao String
  valor     Float     @default(0)
  data      DateTime  @db.Date
  imovel_id String    @db.Uuid
  createdAt DateTime  @default(now()) @db.Timestamp(6)
  updatedAt DateTime? @default(now()) @db.Timestamp(6)
  imoveis   imoveis   @relation(fields: [imovel_id], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "historico_manutecao_imovel_fk")

  @@map("historico_manutecao") // ← CORRIGIDO: nome real da tabela no banco
}
```

**Opção B — renomear a tabela no banco** (sem `@@map`):
```bash
npx prisma db push
```
> ⚠️ O `db push` pode **apagar e recriar** a tabela, e os dados dela se perdem. Use só se a tabela estiver vazia.

**Depois de qualquer mudança no schema**, rode este comando no terminal:
```bash
npx prisma generate
```
Ele atualiza o cliente em `src/generated/prisma` para o código enxergar os novos nomes.

---

## Checklist final

- [ ] `GET /niveis` retorna a lista
- [ ] `POST /niveis` cria um nível
- [ ] `PUT /niveis/:id` edita um nível
- [ ] `DELETE /niveis/:id` deleta um nível
- [ ] Servidor sobe sem erros no terminal
