# 🚀 Guia de Deploy - Anamnese Backend

Este guia mostra como fazer deploy do projeto em diferentes plataformas.

## 📋 Pré-requisitos

1. Conta no MongoDB Atlas (gratuito): https://www.mongodb.com/cloud/atlas
2. Conta na plataforma de deploy escolhida

## 🗄️ Configurar MongoDB Atlas (Necessário para todos)

1. Acesse https://www.mongodb.com/cloud/atlas/register
2. Crie um cluster gratuito (M0)
3. Configure:
   - Database Access: Crie um usuário e senha
   - Network Access: Adicione `0.0.0.0/0` para permitir conexões de qualquer lugar
4. Obtenha a string de conexão:
   - Clique em "Connect" > "Connect your application"
   - Copie a string no formato: `mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/anamnese?retryWrites=true&w=majority`

---

## 🟢 Opção 1: Deploy no Render (Recomendado - Gratuito)

### Passo a Passo:

1. **Crie uma conta no Render**: https://render.com

2. **Conecte seu repositório GitHub**:
   - Faça push do projeto para o GitHub primeiro
   - No Render Dashboard, clique em "New +" > "Web Service"
   - Conecte seu repositório GitHub

3. **Configure o serviço**:
   - Nome: `anamnese-backend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Configure as variáveis de ambiente**:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `MONGODB_URI`: Cole sua string do MongoDB Atlas
   - `JWT_SECRET`: Gere uma chave forte (ex: use https://randomkeygen.com/)
   - `JWT_REFRESH_SECRET`: Gere outra chave forte
   - `JWT_EXPIRES_IN`: `1h`
   - `JWT_REFRESH_EXPIRES_IN`: `7d`

5. **Deploy**:
   - Clique em "Create Web Service"
   - Aguarde o deploy (5-10 minutos)
   - Sua API estará disponível em: `https://anamnese-backend.onrender.com`

### ⚠️ Nota sobre Render Free Tier:
- O serviço "hiberna" após 15 minutos de inatividade
- Primeira requisição pode levar 30-60 segundos para "acordar"
- Perfeito para testes e projetos pessoais

---

## 🚂 Opção 2: Deploy no Railway (Gratuito)

### Passo a Passo:

1. **Crie uma conta no Railway**: https://railway.app

2. **Novo Projeto**:
   - Click em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Conecte e selecione seu repositório

3. **Configure as variáveis de ambiente**:
   - Vá em "Variables"
   - Adicione:
     ```
     NODE_ENV=production
     MONGODB_URI=<sua-string-do-mongodb-atlas>
     JWT_SECRET=<gere-uma-chave-forte>
     JWT_REFRESH_SECRET=<gere-outra-chave-forte>
     JWT_EXPIRES_IN=1h
     JWT_REFRESH_EXPIRES_IN=7d
     ```

4. **Deploy automático**:
   - Railway detecta automaticamente Node.js
   - Build e deploy acontecem automaticamente
   - Sua API estará disponível no domínio gerado

5. **Obter URL**:
   - Vá em "Settings" > "Generate Domain"
   - Sua API estará em: `https://seu-projeto.up.railway.app`

---

## 🐳 Opção 3: Deploy com Docker

### Localmente:

```bash
# Build da imagem
docker build -t anamnese-backend .

# Executar container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=<sua-string-mongodb> \
  -e JWT_SECRET=<sua-chave-jwt> \
  -e JWT_REFRESH_SECRET=<sua-chave-refresh> \
  anamnese-backend
```

### Em qualquer plataforma que suporte Docker:

O `Dockerfile` está pronto para uso em:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Fly.io

---

## 🟣 Opção 4: Deploy no Heroku (Pago)

⚠️ **Nota**: Heroku descontinuou o plano gratuito em 2022

### Passo a Passo:

1. **Instale o Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Login e crie app**:
```bash
heroku login
heroku create anamnese-backend
```

3. **Configure variáveis de ambiente**:
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=<sua-string-mongodb>
heroku config:set JWT_SECRET=<sua-chave-jwt>
heroku config:set JWT_REFRESH_SECRET=<sua-chave-refresh>
heroku config:set JWT_EXPIRES_IN=1h
heroku config:set JWT_REFRESH_EXPIRES_IN=7d
```

4. **Deploy**:
```bash
git push heroku main
```

---

## 🔐 Criar Primeiro Veterinário

Após o deploy, você precisa criar o primeiro veterinário:

### Método 1: Script local conectado ao MongoDB Atlas

```bash
# Configure .env com a MONGODB_URI do Atlas
npm run seed:vet
```

### Método 2: Via MongoDB Atlas Interface

1. Acesse MongoDB Atlas > Browse Collections
2. Selecione database `anamnese` > collection `vets`
3. Clique em "Insert Document"
4. Cole:
```json
{
  "name": "Dr. João Silva",
  "email": "joao@clinica.com",
  "password": "$2a$10$XYZ...",  // Hash bcrypt de "senha123"
  "crmv": "12345-SP",
  "createdAt": { "$date": "2025-12-19T00:00:00.000Z" },
  "updatedAt": { "$date": "2025-12-19T00:00:00.000Z" }
}
```

### Método 3: Endpoint direto (temporário)

Você pode criar um endpoint temporário de cadastro ou usar ferramentas como Postman para fazer uma requisição POST direta ao banco.

---

## 📝 Testar API Publicada

1. **Acessar documentação Swagger**:
   ```
   https://seu-dominio.com/api-docs
   ```

2. **Testar login**:
   ```bash
   curl -X POST https://seu-dominio.com/api/vet/login \
     -H "Content-Type: application/json" \
     -d '{"email":"joao@clinica.com","password":"senha123"}'
   ```

3. **Testar health check** (se implementado):
   ```bash
   curl https://seu-dominio.com/
   ```

---

## 🔄 Atualizações Futuras

Depois do primeiro deploy:

### Render/Railway:
- Faça push para GitHub
- Deploy automático é acionado

### Heroku:
```bash
git push heroku main
```

### Docker:
```bash
docker build -t anamnese-backend .
docker push seu-registry/anamnese-backend
```

---

## ⚡ Checklist Pré-Deploy

- [ ] `.env` está no `.gitignore`
- [ ] MongoDB Atlas configurado e acessível
- [ ] Variáveis de ambiente configuradas na plataforma
- [ ] Testes passando: `npm test`
- [ ] Build funcionando: `npm run build`
- [ ] CORS configurado para domínio do frontend
- [ ] Primeiro veterinário criado

---

## 🆘 Troubleshooting

### Erro de conexão com MongoDB:
- Verifique se o IP `0.0.0.0/0` está na whitelist do MongoDB Atlas
- Confirme usuário e senha na string de conexão
- Certifique-se que a string está correta (especialmente caracteres especiais)

### Erro 500 na API:
- Verifique logs da plataforma
- Confirme que todas as variáveis de ambiente estão definidas
- Teste localmente com as mesmas variáveis

### Deploy falha:
- Verifique se `npm run build` funciona localmente
- Confirme que todas as dependências estão no `package.json`
- Verifique logs de build da plataforma

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique logs da plataforma
2. Teste localmente primeiro
3. Revise as variáveis de ambiente
4. Consulte documentação da plataforma escolhida

Bom deploy! 🚀
