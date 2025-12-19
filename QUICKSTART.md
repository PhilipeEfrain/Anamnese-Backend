# 🚀 Quick Start - Deploy Rápido

## Opção Mais Rápida: Render (5 minutos)

### 1. Prepare MongoDB Atlas
1. Crie conta gratuita: https://www.mongodb.com/cloud/atlas/register
2. Crie cluster gratuito (M0)
3. Database Access → Criar usuário e senha
4. Network Access → Adicionar `0.0.0.0/0`
5. Connect → Copie a string de conexão

### 2. Deploy no Render
1. Crie conta: https://render.com
2. New → Web Service
3. Conecte este repositório GitHub
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Adicione variáveis de ambiente:
   ```
   NODE_ENV=production
   MONGODB_URI=<sua-string-do-mongodb-atlas>
   JWT_SECRET=<gere-chave-aleatoria-forte>
   JWT_REFRESH_SECRET=<gere-outra-chave-aleatoria>
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   ```
6. Create Web Service → Aguarde deploy

✅ Pronto! Sua API estará em: `https://seu-app.onrender.com`

### 3. Criar Primeiro Veterinário
Execute localmente com MONGODB_URI do Atlas:
```bash
npm run seed:vet
```

### 4. Testar
Acesse: `https://seu-app.onrender.com/api-docs`

---

## Outras Opções

Ver `DEPLOY.md` para:
- Railway
- Heroku  
- Docker
- Outras plataformas

---

## Checklist Antes do Deploy

- [x] Arquivos de configuração criados
- [ ] Push para GitHub
- [ ] MongoDB Atlas configurado
- [ ] Deploy na plataforma
- [ ] Variáveis de ambiente configuradas
- [ ] Primeiro veterinário criado
- [ ] API testada

## Comandos Git

```bash
git add .
git commit -m "feat: adiciona configuração para deploy"
git push origin main
```

Bom deploy! 🎉
