#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${YELLOW}🧪 Anamnese API - Script de Testes${NC}\n"

# Verificar se o servidor está rodando
echo -e "${YELLOW}🔍 Verificando servidor...${NC}"
if ! curl -s $BASE_URL/health > /dev/null; then
    echo -e "${RED}❌ Servidor não está rodando!${NC}"
    echo -e "${YELLOW}💡 Execute: npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Servidor está online${NC}\n"

# 1. Health Check
echo -e "${YELLOW}1️⃣ Testando Health Check...${NC}"
HEALTH=$(curl -s $BASE_URL/health)
if [ "$HEALTH" = "OK" ]; then
    echo -e "${GREEN}✅ Health check OK${NC}\n"
else
    echo -e "${RED}❌ Health check falhou${NC}\n"
fi

# 2. Register Vet (gerar email único)
RANDOM_EMAIL="vet$(date +%s)@test.com"
echo -e "${YELLOW}2️⃣ Registrando veterinário ($RANDOM_EMAIL)...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/vet/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"Test@123\"}")

if echo $REGISTER_RESPONSE | grep -q "successfully"; then
    echo -e "${GREEN}✅ Veterinário registrado${NC}"
else
    echo -e "${RED}❌ Falha no registro${NC}"
    echo $REGISTER_RESPONSE
fi
echo ""

# 3. Login
echo -e "${YELLOW}3️⃣ Fazendo login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/vet/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"Test@123\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ Login bem-sucedido${NC}"
    echo -e "Token: ${TOKEN:0:30}...\n"
else
    echo -e "${RED}❌ Falha no login${NC}"
    echo $LOGIN_RESPONSE
    exit 1
fi

# 4. Testar rota protegida sem token
echo -e "${YELLOW}4️⃣ Testando rota protegida SEM token...${NC}"
NO_TOKEN_RESPONSE=$(curl -s $BASE_URL/client)
if echo $NO_TOKEN_RESPONSE | grep -q "No token provided"; then
    echo -e "${GREEN}✅ Proteção funcionando (rejeitou sem token)${NC}\n"
else
    echo -e "${RED}❌ Falha na proteção${NC}\n"
fi

# 5. Create Client
echo -e "${YELLOW}5️⃣ Criando cliente...${NC}"
CLIENT_RESPONSE=$(curl -s -X POST $BASE_URL/client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"João Silva","phone":"11999999999","email":"joao@test.com"}')

CLIENT_ID=$(echo $CLIENT_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -n "$CLIENT_ID" ]; then
    echo -e "${GREEN}✅ Cliente criado: $CLIENT_ID${NC}\n"
else
    echo -e "${RED}❌ Falha ao criar cliente${NC}"
    echo $CLIENT_RESPONSE
    echo ""
fi

# 6. Create Pet
if [ -n "$CLIENT_ID" ]; then
    echo -e "${YELLOW}6️⃣ Criando pet...${NC}"
    PET_RESPONSE=$(curl -s -X POST $BASE_URL/pet \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{\"owner\":\"$CLIENT_ID\",\"name\":\"Rex\",\"species\":\"dog\",\"breed\":\"Golden Retriever\",\"age\":3,\"weight\":25.5}")
    
    PET_ID=$(echo $PET_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$PET_ID" ]; then
        echo -e "${GREEN}✅ Pet criado: $PET_ID${NC}\n"
    else
        echo -e "${RED}❌ Falha ao criar pet${NC}"
        echo $PET_RESPONSE
        echo ""
    fi
fi

# 7. Create Anamnese
if [ -n "$PET_ID" ]; then
    echo -e "${YELLOW}7️⃣ Criando anamnese...${NC}"
    ANAMNESE_RESPONSE=$(curl -s -X POST $BASE_URL/anamnese \
      -H "Content-Type: application/json" \
      -d "{\"pet\":\"$PET_ID\",\"reason\":\"Consulta de rotina\",\"symptoms\":{\"vomiting\":false,\"diarrhea\":false}}")
    
    ANAMNESE_ID=$(echo $ANAMNESE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$ANAMNESE_ID" ]; then
        echo -e "${GREEN}✅ Anamnese criada: $ANAMNESE_ID${NC}\n"
    else
        echo -e "${RED}❌ Falha ao criar anamnese${NC}"
        echo $ANAMNESE_RESPONSE
        echo ""
    fi
fi

# 8. List Anamneses
echo -e "${YELLOW}8️⃣ Listando anamneses...${NC}"
LIST_RESPONSE=$(curl -s -X GET $BASE_URL/anamnese \
  -H "Authorization: Bearer $TOKEN")

if echo $LIST_RESPONSE | grep -q "$ANAMNESE_ID"; then
    echo -e "${GREEN}✅ Listagem funcionando (anamnese encontrada)${NC}\n"
else
    echo -e "${YELLOW}⚠️  Anamnese não encontrada na listagem${NC}\n"
fi

# 9. Testar validação (senha fraca)
echo -e "${YELLOW}9️⃣ Testando validação (senha fraca)...${NC}"
WEAK_PASS_RESPONSE=$(curl -s -X POST $BASE_URL/vet/register \
  -H "Content-Type: application/json" \
  -d '{"email":"weak@test.com","password":"123"}')

if echo $WEAK_PASS_RESPONSE | grep -q "at least 8 characters"; then
    echo -e "${GREEN}✅ Validação de senha funcionando${NC}\n"
else
    echo -e "${RED}❌ Validação não está funcionando${NC}\n"
fi

# 10. Testar validação (email inválido)
echo -e "${YELLOW}🔟 Testando validação (email inválido)...${NC}"
INVALID_EMAIL_RESPONSE=$(curl -s -X POST $BASE_URL/vet/register \
  -H "Content-Type: application/json" \
  -d '{"email":"email-invalido","password":"Test@123"}')

if echo $INVALID_EMAIL_RESPONSE | grep -q "Valid email"; then
    echo -e "${GREEN}✅ Validação de email funcionando${NC}\n"
else
    echo -e "${RED}❌ Validação de email não está funcionando${NC}\n"
fi

# Resumo
echo -e "${YELLOW}═══════════════════════════════════${NC}"
echo -e "${GREEN}✅ Testes Concluídos!${NC}"
echo -e "${YELLOW}═══════════════════════════════════${NC}\n"

echo -e "📊 ${YELLOW}Recursos Criados:${NC}"
echo -e "  • Veterinário: $RANDOM_EMAIL"
[ -n "$CLIENT_ID" ] && echo -e "  • Cliente: $CLIENT_ID"
[ -n "$PET_ID" ] && echo -e "  • Pet: $PET_ID"
[ -n "$ANAMNESE_ID" ] && echo -e "  • Anamnese: $ANAMNESE_ID"
echo ""

echo -e "${YELLOW}💡 Próximos passos:${NC}"
echo -e "  1. Execute os testes automatizados: ${GREEN}npm test${NC}"
echo -e "  2. Veja a cobertura: ${GREEN}npm run test:coverage${NC}"
echo -e "  3. Consulte TESTING_GUIDE.md para mais detalhes"
echo ""
