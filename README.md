# 🐾 Anamnese-Backend

API back-end para sistema de anamnese veterinária - permite que tutores preencham dados de anamnese e que veterinários consultem as informações.

## 🚀 Status do Projeto

✅ **Funcionalidades principais implementadas e testadas**

- ✅ Modelos de dados completos (Vet, Client, Pet, Anamnese)
- ✅ Autenticação JWT para veterinários
- ✅ CRUD completo para clientes e pets
- ✅ Sistema de anamnese (criação pública, consulta protegida)
- ✅ Segurança avançada (Helmet, Rate Limiting, NoSQL Injection Protection)
- ✅ Validação de dados com express-validator
- ✅ Middleware de tratamento de erros centralizado
- ✅ Tipagem TypeScript completa
- ✅ Testes unitários e de integração (Jest + Supertest)
- ✅ Documentação completa da API

## 📖 Visão Geral

Sistema back-end para clínicas veterinárias que facilita a coleta de dados clínicos e histórico de animais antes da consulta. Tutores podem preencher uma pré-anamnese e veterinários acessam as fichas com segurança via autenticação JWT.

## 🔧 Como rodar localmente

### Pré-requisitos

- Node.js (v16+)
- npm ou yarn
- MongoDB (local ou MongoDB Atlas)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/PhilipeEfrain/Anamnese-Backend.git
cd Anamnese-Backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### Configuração do arquivo .env

Crie um arquivo `.env` na raiz do projeto com:

```env
# MongoDB Connection (local ou Atlas)
MONGO_URI=mongodb://localhost:27017/anamnese
# OU para MongoDB Atlas:
# MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/anamnese

# JWT Secret (gere uma chave segura)
JWT_SECRET=sua_chave_secreta_muito_segura_aqui

# Porta do servidor
PORT=3000

# Ambiente
NODE_ENV=development

# CORS Origin (em produção, defina a URL do frontend)
CORS_ORIGIN=*
```

**💡 Dica:** Para gerar um JWT_SECRET seguro, execute:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Iniciando o servidor

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Modo produção (requer build primeiro)
npm run build
npm start
```

O servidor estará rodando em `http://localhost:3000`

### Scripts disponíveis

```bash
npm run dev              # Inicia servidor em modo desenvolvimento (ts-node-dev)
npm run build            # Compila TypeScript para JavaScript (pasta dist/)
npm start                # Inicia servidor em produção (node dist/index.js)
npm run seed:vet         # Cria um veterinário inicial no banco de dados
npm test                 # Executa todos os testes
npm run test:watch       # Executa testes em modo watch
npm run test:coverage    # Executa testes com relatório de cobertura
```

## 🧪 Testando a API

### 📚 Documentação Interativa (Swagger)

A documentação completa da API está disponível via Swagger UI:

**🔗 Acesse:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

- ✅ Todos os endpoints documentados
- ✅ Esquemas de request/response
- ✅ Teste direto pelo navegador (Try it out)
- ✅ Autenticação JWT integrada
- ✅ Filtros e paginação documentados

**Como usar o Swagger:**

1. Inicie o servidor (`npm run dev`)
2. Acesse `http://localhost:3000/api-docs`
3. Para endpoints protegidos:
   - Clique em "Authorize" (canto superior direito)
   - Cole seu token JWT no formato: `Bearer SEU_TOKEN_AQUI`
   - Clique em "Authorize" e depois "Close"
4. Navegue pelos endpoints e use "Try it out" para testar

### Opção 1: Testes Automatizados (Recomendado)

```bash
# Executar todos os testes
npm test

# Executar testes com cobertura
npm run test:coverage

# Executar testes em modo watch (durante desenvolvimento)
npm run test:watch
```

### Opção 2: Script de Teste Rápido

```bash
# Testa todos os endpoints principais
bash scripts/test-api.sh
```

### Opção 3: Postman/Insomnia

**Importar Collection:**

1. Abra o Postman
2. Clique em **Import**
3. Selecione o arquivo `postman_collection.json` na raiz do projeto
4. Todos os endpoints estarão prontos para uso!

**Testar Manualmente:**

#### 1️⃣ Criar Veterinário

```http
POST http://localhost:3000/vet/register
Content-Type: application/json

{
  "name": "Dr. João Silva",
  "crmv": "12345-SP",
  "email": "joao@vet.com",
  "password": "Senha@123!"
}
```

#### 2️⃣ Login

```http
POST http://localhost:3000/vet/login
Content-Type: application/json

{
  "email": "joao@vet.com",
  "password": "Senha@123!"
}
```

**⚠️ Copie o `token` retornado!**

A resposta será:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "a1b2c3d4e5f6...",
  "expiresIn": 3600
}
```

#### 2️⃣-A Renovar Access Token (quando expirar)

```http
POST http://localhost:3000/vet/refresh
Content-Type: application/json

{
  "refreshToken": "SEU_REFRESH_TOKEN_AQUI"
}
```

#### 2️⃣-B Logout

```http
POST http://localhost:3000/vet/logout
Content-Type: application/json

{
  "refreshToken": "SEU_REFRESH_TOKEN_AQUI"
}
```

#### 3️⃣ Criar Cliente (requer token)

```http
POST http://localhost:3000/client
Content-Type: application/json
Authorization: Bearer SEU_TOKEN_AQUI

{
  "name": "Maria Santos",
  "email": "maria@email.com",
  "phone": "11999998888",
  "address": "Rua das Flores, 123"
}
```

**⚠️ Copie o `_id` do cliente!**

#### 4️⃣ Criar Pet (requer token)

```http
POST http://localhost:3000/pet
Content-Type: application/json
Authorization: Bearer SEU_TOKEN_AQUI

{
  "name": "Rex",
  "species": "dog",
  "breed": "Labrador",
  "age": 3,
  "weight": 25.5,
  "owner": "ID_DO_CLIENTE"
}
```

**⚠️ Copie o `_id` do pet!**

#### 5️⃣ Criar Anamnese (rota PÚBLICA)

```http
POST http://localhost:3000/anamnese
Content-Type: application/json

{
  "pet": "ID_DO_PET",
  "reason": "Vômito e diarreia há 2 dias",
  "symptoms": {
    "vomiting": true,
    "diarrhea": true,
    "lethargy": true
  },
  "physicalExam": {
    "temperature": 38.5,
    "heartRate": 120,
    "respiratoryRate": 30
  }
}
```

### 📄 Paginação e Filtros

Todos os endpoints de listagem (`GET /client`, `GET /pet`, `GET /anamnese`) suportam paginação e filtros avançados:

#### Parâmetros de Paginação

- `page` (número): Página atual (padrão: 1)
- `limit` (número): Itens por página (padrão: 10, máximo: 100)
- `sortBy` (string): Campo para ordenação (ex: 'name', 'date', 'createdAt')
- `sortOrder` (string): Ordem de classificação - `asc` ou `desc` (padrão: 'desc')

#### Parâmetros de Busca

**Para Clients:**

- `search` (string): Busca por nome, email ou telefone

**Para Pets:**

- `search` (string): Busca por nome ou raça
- `species` (string): Filtra por espécie
- `owner` (ObjectId): Filtra por proprietário

**Para Anamneses:**

- `search` (string): Busca por motivo, avaliação, diagnóstico ou tratamento
- `status` (string): Filtra por status
- `startDate` (data): Data inicial do filtro
- `endDate` (data): Data final do filtro

#### Exemplos de Uso

**Listar clientes com paginação:**

```http
GET http://localhost:3000/client?page=1&limit=10&sortBy=name&sortOrder=asc
Authorization: Bearer SEU_TOKEN_AQUI
```

**Buscar clientes por nome:**

```http
GET http://localhost:3000/client?search=maria&page=1&limit=10
Authorization: Bearer SEU_TOKEN_AQUI
```

**Listar pets de um cliente específico:**

```http
GET http://localhost:3000/pet?owner=ID_DO_CLIENTE&page=1&limit=20
Authorization: Bearer SEU_TOKEN_AQUI
```

**Buscar anamneses em um período:**

```http
GET http://localhost:3000/anamnese?startDate=2024-01-01&endDate=2024-12-31&sortBy=date&sortOrder=desc
Authorization: Bearer SEU_TOKEN_AQUI
```

#### Formato da Resposta

Todas as respostas paginadas seguem este formato:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### 6️⃣ Listar Anamneses (requer token)

```http
GET http://localhost:3000/anamnese
Authorization: Bearer SEU_TOKEN_AQUI
```

#### 7️⃣ Buscar Anamnese por ID (requer token)

```http
GET http://localhost:3000/anamnese/ID_DA_ANAMNESE
Authorization: Bearer SEU_TOKEN_AQUI
```

### Opção 4: cURL

```bash
# Criar veterinário
curl -X POST http://localhost:3000/vet/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. João Silva",
    "crmv": "12345-SP",
    "email": "joao@vet.com",
    "password": "Senha@123!"
  }'

# Login
curl -X POST http://localhost:3000/vet/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@vet.com",
    "password": "Senha@123!"
  }'

# Criar cliente (substitua SEU_TOKEN)
curl -X POST http://localhost:3000/client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@email.com",
    "phone": "11999998888"
  }'
```

## 🌐 Endpoints Principais

### Veterinários (Public)

- `POST /vet/register` - Registrar novo veterinário
- `POST /vet/login` - Login e obter access token + refresh token
- `POST /vet/refresh` - Renovar access token usando refresh token
- `POST /vet/logout` - Invalidar refresh token (logout)

### Clientes (Protected - requer token)

- `POST /client` - Criar cliente
- `GET /client` - Listar todos os clientes
- `GET /client/:id` - Buscar cliente por ID
- `PUT /client/:id` - Atualizar cliente
- `DELETE /client/:id` - Deletar cliente

### Pets (Protected - requer token)

- `POST /pet` - Criar pet
- `GET /pet` - Listar todos os pets
- `GET /pet/:id` - Buscar pet por ID
- `PUT /pet/:id` - Atualizar pet
- `DELETE /pet/:id` - Deletar pet

### Anamneses (Mixed)

- `POST /anamnese` - Criar anamnese (PÚBLICO - para tutores)
- `GET /anamnese` - Listar anamneses (PROTEGIDO)
- `GET /anamnese/:id` - Buscar anamnese por ID (PROTEGIDO)

### Utilitários

- `GET /health` - Health check do servidor

## 🏗️ Estrutura do Projeto

```
Anamnese/
├── src/
│   ├── @types/              # Tipos TypeScript customizados
│   │   └── express/
│   ├── config/              # Configurações
│   │   └── database.ts      # Conexão MongoDB
│   ├── controllers/         # Lógica de negócio
│   │   ├── anamnese.controller.ts
│   │   ├── client.controller.ts
│   │   ├── pet.controller.ts
│   │   └── vet.controller.ts
│   ├── middleware/          # Middlewares customizados
│   │   ├── auth.ts          # Autenticação JWT
│   │   ├── errorHandler.ts  # Tratamento de erros
│   │   ├── rateLimiter.ts   # Rate limiting (3 níveis)
│   │   └── validators.ts    # Validações express-validator
│   ├── models/              # Schemas Mongoose
│   │   ├── Anamnese.ts
│   │   ├── Client.ts
│   │   ├── Pet.ts
│   │   └── Vet.ts
│   ├── routes/              # Definição de rotas
│   │   ├── anamnese.routes.ts
│   │   ├── client.routes.ts
│   │   ├── pet.routes.ts
│   │   └── vet.routes.ts
│   ├── app.ts               # Configuração Express + Middlewares
│   └── index.ts             # Entry point + MongoDB connection
├── tests/                   # Testes automatizados
│   ├── api.test.ts          # Testes de integração (40+ testes)
│   └── setup.ts             # Configuração global dos testes
├── scripts/
│   ├── createVet.ts         # Script para criar veterinário
│   └── test-api.sh          # Script bash para testes rápidos
├── .env.example             # Exemplo de variáveis de ambiente
├── .env.test                # Variáveis para testes
├── jest.config.js           # Configuração Jest
├── tsconfig.json            # Configuração TypeScript
├── package.json             # Dependências e scripts
└── postman_collection.json  # Collection Postman pronta
```

## 🔐 Segurança Implementada

### 1. **Autenticação e Autorização**

- JWT (Access Token) com expiração de 1 hora
- Refresh Token com expiração de 7 dias
- Senhas hasheadas com bcryptjs (salt rounds: 10)
- Middleware de autenticação para rotas protegidas
- Sistema de logout que invalida refresh tokens

### 2. **Proteção contra Ataques**

- **Helmet.js** - Headers HTTP seguros
- **express-mongo-sanitize** - Proteção contra NoSQL Injection
- **express-validator** - Validação e sanitização de inputs
- **CORS** - Configuração de origens permitidas

### 3. **Rate Limiting (3 níveis)**

- **General**: 100 requisições / 15 minutos
- **Auth**: 5 requisições / 15 minutos (login/register)
- **Anamnese**: 10 requisições / hora (criação de anamnese)

### 4. **Validações**

- Validação de email, senha forte, ObjectId do MongoDB
- Validação de campos obrigatórios
- Sanitização de inputs (trim, normalização)
- Limite de tamanho de body (10kb)

### 5. **Tratamento de Erros**

- Middleware centralizado de erros
- Mensagens de erro padronizadas
- Logs estruturados (não expõem dados sensíveis)

## 🔄 Relacionamentos do Banco

```
Vet (Veterinário)
├── Autenticação independente

Client (Cliente/Tutor)
├── tem múltiplos Pets
│   └── Pet.owner → Client._id
└── Client.pets[] → [Pet._id]

Pet (Animal)
├── pertence a um Client
├── tem múltiplas Anamneses
└── Anamnese.pet → Pet._id

Anamnese (Ficha Clínica)
└── pertence a um Pet
```

**Funcionalidades especiais:**

- Ao criar Pet, ele é automaticamente adicionado ao array `pets` do Client
- Ao deletar Pet, ele é removido do array `pets` do Client
- População automática de referências (populate)

## 🛠️ Stack Tecnológica

### Core

- **Node.js** v16+ - Runtime JavaScript
- **TypeScript** 5.9.3 - Superset tipado do JavaScript
- **Express** 4.21.2 - Framework web minimalista

### Database

- **MongoDB** 7.0.0 - Banco de dados NoSQL
- **Mongoose** 9.0.1 - ODM para MongoDB

### Segurança

- **jsonwebtoken** 9.0.3 - Autenticação JWT
- **bcryptjs** 3.0.3 - Hash de senhas
- **helmet** 8.1.0 - Headers HTTP seguros
- **express-rate-limit** 8.2.1 - Rate limiting
- **express-mongo-sanitize** 2.2.0 - Proteção NoSQL Injection
- **express-validator** 7.3.1 - Validação de dados
- **cors** 2.8.5 - Cross-Origin Resource Sharing

### Testes

- **Jest** 30.2.0 - Framework de testes
- **Supertest** 7.1.4 - Testes HTTP
- **ts-jest** 29.4.6 - Preset TypeScript para Jest

### DevOps

- **ts-node-dev** 2.0.0 - Hot reload em desenvolvimento
- **dotenv** 17.2.3 - Gerenciamento de variáveis de ambiente

## 🧪 Cobertura de Testes

- ✅ 40+ testes de integração (API completa)
- ✅ Testes unitários de controllers
- ✅ Testes de autenticação e autorização
- ✅ Testes de validação de dados
- ✅ Testes de rate limiting
- ✅ Testes de relacionamentos entre entidades
- ✅ Testes de casos de erro

Execute `npm run test:coverage` para ver o relatório completo.

## 📝 Regras de Validação

### Veterinário (Vet)

- `name`: obrigatório, string
- `crmv`: obrigatório, string
- `email`: obrigatório, email válido
- `password`: mínimo 8 caracteres, 1 letra maiúscula, 1 minúscula, 1 número

### Cliente (Client)

- `name`: obrigatório, string
- `phone`: obrigatório, 10-11 dígitos
- `email`: opcional, email válido
- `address`: opcional, string

### Pet

- `name`: obrigatório, string
- `species`: obrigatório, string
- `breed`: opcional, string
- `age`: opcional, número inteiro positivo
- `weight`: opcional, número positivo
- `owner`: obrigatório, ObjectId válido do MongoDB

### Anamnese

- `pet`: obrigatório, ObjectId válido do MongoDB
- `reason`: obrigatório, string (motivo da consulta)
- `clinicalHistory`: opcional, objeto
- `symptoms`: opcional, objeto
- `physicalExam`: opcional, objeto
- `assessment`: opcional, string
- `plan`: opcional, string

## 🔒 Restrição de Acesso (Segurança Adicional)

### Protegendo Rotas Administrativas com API Key

Para restringir o acesso a determinadas rotas (como listagem de veterinários):

1. **Adicione a variável `API_KEY` no Railway:**
   ```
   API_KEY=sua_chave_secreta_super_forte_aqui
   ```

2. **Use o middleware `requireApiKey`** nas rotas que deseja proteger:
   ```typescript
   import { requireApiKey } from "./middleware/apiKeyAuth";
   
   // Proteger rota específica
   router.get("/vet/list", requireApiKey, getAllVets);
   ```

3. **Para fazer requisições protegidas:**
   ```bash
   curl https://web-production-5ff3c.up.railway.app/vet/list \
     -H "x-api-key: sua_chave_secreta_super_forte_aqui"
   ```

### Outras Opções de Segurança

**Railway Private Networking:**
- Torne o serviço privado nas configurações do Railway
- Desabilite "Public Domain" em Settings > Networking
- ⚠️ Seu frontend público não conseguirá acessar

**CORS Restrito:**
- Configure `CORS_ORIGIN` no Railway com a URL do seu frontend:
  ```
  CORS_ORIGIN=https://seu-frontend.vercel.app
  ```
- Isso impede requisições de outros domínios

**IP Whitelist (Avançado):**
- Adicione middleware para verificar IPs permitidos
- Útil para APIs internas

## 🎯 Próximos Passos

- [x] Implementar refresh tokens
- [x] Implementar paginação e filtros avançados
- [x] Criar documentação Swagger/OpenAPI
- [x] Deploy em produção no Railway
- [ ] Implementar logs com Winston
- [ ] Adicionar cache com Redis
<!-- - [ ] Implementar notificações (email/SMS) -->

## 👨‍💻 Desenvolvimento

### Criando um Veterinário via Script

```bash
npm run seed:vet
```

### Rodando em Modo Watch (testes)

```bash
npm run test:watch
```

### Build para Produção

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### Erro de conexão MongoDB

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solução:** Certifique-se que o MongoDB está rodando ou use MongoDB Atlas.

### Erro "JWT must be provided"

**Solução:** Inclua o header `Authorization: Bearer SEU_TOKEN` nas rotas protegidas.

### Erro de validação

**Solução:** Verifique se todos os campos obrigatórios estão sendo enviados corretamente.

### Rate limit exceeded

**Solução:** Aguarde alguns minutos ou ajuste os limites em `src/middleware/rateLimiter.ts`.

## 📄 Licença

Este projeto está sob licença MIT.

## 👤 Autor

**Philipe Efrain**

- GitHub: [@PhilipeEfrain](https://github.com/PhilipeEfrain)

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!
