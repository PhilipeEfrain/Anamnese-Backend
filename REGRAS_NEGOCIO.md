# Regras de Negócio — Anamnese Backend

Este documento resume as regras de negócio e principais fluxos do backend, cobrindo os atores: Cliente (tutor), Pet, Veterinário e Anamnese. As regras foram extraídas do código-fonte (controllers, models e rotas).

**Arquivos de referência**

- Controller Cliente: [src/controllers/client.controller.ts](src/controllers/client.controller.ts)
- Controller Pet: [src/controllers/pet.controller.ts](src/controllers/pet.controller.ts)
- Controller Veterinário: [src/controllers/vet.controller.ts](src/controllers/vet.controller.ts)
- Controller Anamnese: [src/controllers/anamnese.controller.ts](src/controllers/anamnese.controller.ts)
- Model Cliente: [src/models/Client.ts](src/models/Client.ts)
- Model Pet: [src/models/Pet.ts](src/models/Pet.ts)
- Model Vet: [src/models/Vet.ts](src/models/Vet.ts)
- Model Anamnese: [src/models/Anamnese.ts](src/models/Anamnese.ts)
- Middleware Auth: [src/middleware/auth.ts](src/middleware/auth.ts)
- Rotas: [src/routes](src/routes)

**Resumo dos atores**

- Veterinário: usuário autenticado (JWT), pode gerenciar clientes, pets e visualizar/analisar anamneses.
- Cliente (tutor): entidade representada no sistema; não há login próprio no backend atual (anamneses públicas podem ser criadas sem autenticação).
- Pet: pertence a um `Client` (campo `owner`).
- Anamnese: formulário/registro ligado a um `Pet`. Pode ser criado publicamente (tutor) e consultado por veterinários.

**Fluxos e regras por entidade**

**Clientes (Tutors)**

- Criação: `POST /client` — somente veterinários autenticados (middleware `authenticateVet`) podem criar clientes. Campos obrigatórios: `name`, `phone`. Campos opcionais: `email`, `address`.
- Listagem: `GET /client` — veterinários autenticados; suporta paginação, ordenação e busca por `name`, `email`, `phone`.
- Consulta por ID: `GET /client/:id` — veterinários autenticados; retorna cliente com `pets` populado.
- Atualização: `PUT /client/:id` — veterinários autenticados; `runValidators: true` garante validação do modelo.
- Remoção: `DELETE /client/:id` — veterinários autenticados; ao deletar o cliente, todos os `Pet` com `owner` igual ao cliente são removidos (`Pet.deleteMany`).
  - Regra importante: remoção de cliente remove pets associados (cascata manual implementada).

Referência: [src/controllers/client.controller.ts](src/controllers/client.controller.ts)

**Pets**

- Criação: `POST /pet` — veterinários autenticados; requisição deve incluir `owner` (ID do `Client`), `name` e `species`. Antes de criar, o backend verifica se o `Client` existe; se não existir retorna 404.
- Ao criar um `Pet`, o ID do pet é adicionado ao array `pets` do `Client` e o `Client` é salvo (`client.pets.push(pet._id)` + `client.save()`).
- Listagem: `GET /pet` — veterinários autenticados; suporta paginação, ordenação, busca (`name`, `breed`), filtro por `species` e por `owner`.
- Consulta por ID: `GET /pet/:id` — veterinários autenticados; retorna `owner` e `anamneses` populados.
- Atualização: `PUT /pet/:id` — veterinários autenticados; validações do modelo aplicadas.
- Remoção: `DELETE /pet/:id` — veterinários autenticados; ao excluir pet, é feito `$pull` no `Client.pets` para remover o ID do pet.

Referência: [src/controllers/pet.controller.ts](src/controllers/pet.controller.ts)

**Veterinários (auth)**

- Registro: `POST /vet/register` — cria `Vet` com `email` único e senha, senha é hasheada no `pre('save')` do modelo.
- Login: `POST /vet/login` — valida `email` e `password` com `comparePassword`; em caso de sucesso gera `accessToken` JWT (1h) e `refreshToken` (valor aleatório, salvo em `RefreshToken` com expiry 7 dias).
- Refresh: `POST /vet/refresh` — recebe `refreshToken`, valida existência e expiração; se válido gera novo `accessToken`.
- Logout: `POST /vet/logout` — exclui o `RefreshToken` informado.
- Proteção de rotas: middleware `authenticateVet` valida header `Authorization: Bearer <token>` e decodifica JWT usando `process.env.JWT_SECRET`.

Referência: [src/controllers/vet.controller.ts](src/controllers/vet.controller.ts) e [src/models/Vet.ts](src/models/Vet.ts)

**Anamneses**

- Criação: `POST /anamnese` — rota pública (destinada a tutores) com rate limiter `createAnamneseLimiter` para evitar abuso. Campos obrigatórios: `pet` (ID), `reason`.
  - Anamnese armazena campos compostos: `clinicalHistory`, `symptoms`, `physicalExam`, `assessment`, `plan`.
  - Não há vínculo que impeça um usuário público de criar anamneses para qualquer `pet` — pressupõe-se que cliente/tutor conhece o ID do pet.
- Listagem: `GET /anamnese` — veterinários autenticados; suporta paginação, ordenação por `date` (padrão desc), busca por `reason`, `assessment`, `diagnosis`, `treatment`, filtro por `status` e filtragem por intervalo de datas (`startDate`, `endDate`).
- Consulta por ID: `GET /anamnese/:id` — veterinários autenticados; retorna anamnese com `pet` populado.

Referência: [src/controllers/anamnese.controller.ts](src/controllers/anamnese.controller.ts) e [src/routes/anamnese.routes.ts](src/routes/anamnese.routes.ts)

**Validações e limitações**

- Várias rotas usam middleware de validação (`src/middleware/validators.ts`) — garantir formato e campos obrigatórios.
- Limitação de taxa aplicada em rotas sensíveis: autenticação registra `authLimiter` e criação de anamnese `createAnamneseLimiter` (ver `src/middleware/rateLimiter.ts`).
- Senha de `Vet` é sempre armazenada hasheada (bcrypt) e comparada via método `comparePassword` do schema.
- Tokens: `accessToken` expira em 1h; `refreshToken` expira em 7 dias e é armazenado na collection `RefreshToken`.

**Regras de segurança e permissões**

- A maioria das operações de CRUD para `Client` e `Pet` requer autenticação de veterinário (JWT). Somente `POST /anamnese` é pública.
- `authenticateVet` retorna 401 quando header `Authorization` ausente, mal formado ou token inválido.
- Não há implementação de roles além do `Vet` autenticado; assume-se único papel com privilégios administrativos sobre dados clínicos.

**Regras de integridade e relacionamentos**

- `Pet.owner` é required e referencia `Client`.
- `Client.pets` mantém lista de ObjectId referenciando `Pet` — manutenção manual (push ao criar pet; pull ao deletar pet; deleteMany ao deletar cliente).
- `Anamnese.pet` é required e referencia `Pet`.
- Ao deletar `Client`, todos os `Pet` do cliente são removidos; porém não há código explícito para remover `Anamnese` associados ao `Pet` na remoção automática. Observação importante: se for necessário remover anamneses quando um pet é deletado, implementar remoção em cascade.

**Paginação, busca e ordenação**

- Implementado utilitário de paginação (`src/utils/pagination.ts`) que extrai `page`, `limit`, `skip`, `sort` e `search`.
- Campos de busca indexados implicitamente via regex em queries (`new RegExp(term, 'i')`) — é útil para pequenas bases; para escalabilidade considerar índices textuais.

**Erros e respostas**

- Erros de validação/missing retornam códigos 400/404 conforme o caso.
- Erros internos retornam 500 com mensagem genérica ou message do erro dependendo do controller.

**Pontos de atenção / sugestões**

- Autorização do tutor: atualmente qualquer usuário pode criar anamnese para qualquer `pet` se souber o ID. Se for requisito que apenas o tutor do pet ou veterinários possam criar anamneses, adicionar checagem de propriedade (verificar `Pet.owner`) ou sistema de login para tutores.
- Cascata de remoção: ao deletar `Pet`, as `Anamnese` vinculadas permanecem; avaliar se devem ser removidas ou preservadas (dependendo do requisito de negócio).
- Auditoria e histórico: considerar campos `createdBy`/`updatedBy` para saber qual vet registrou ou alterou uma anamnese.
- Indexes para buscas: para grandes volumes, criar índices em campos frequentemente consultados (e.g., `pet`, `date`, `status`, `owner`).
- Segurança: proteger rotas sensíveis e esconder mensagens de erro detalhadas em produção; validar `process.env.JWT_SECRET` em startup.

**Resumo rápido dos endpoints principais**

- `POST /vet/register` — registrar veterinário
- `POST /vet/login` — autenticar e receber `accessToken` + `refreshToken`
- `POST /vet/refresh` — renovar `accessToken`
- `POST /vet/logout` — invalidar `refreshToken`
- `POST /client` — criar cliente (vet apenas)
- `GET /client` — listar clientes (vet apenas)
- `GET /client/:id` — obter cliente (vet apenas)
- `PUT /client/:id` — atualizar cliente (vet apenas)
- `DELETE /client/:id` — deletar cliente + pets (vet apenas)
- `POST /pet` — criar pet (vet apenas)
- `GET /pet` — listar pets (vet apenas)
- `GET /pet/:id` — obter pet (vet apenas)
- `PUT /pet/:id` — atualizar pet (vet apenas)
- `DELETE /pet/:id` — deletar pet (vet apenas)
- `POST /anamnese` — criar anamnese (pública, com rate limit)
- `GET /anamnese` — listar anamneses (vet apenas)
- `GET /anamnese/:id` — obter anamnese (vet apenas)

---

Se quiser, eu posso:

- Gerar uma seção adicional com exemplos de payloads por endpoint;
- Implementar cascata para remover `Anamnese` ao deletar `Pet`;
- Adicionar checagem que restrinja criação de anamneses apenas ao tutor do pet.

Arquivo gerado: `REGRAS_NEGOCIO.md` (raiz do projeto).
