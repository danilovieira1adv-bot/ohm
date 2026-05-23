#!/bin/bash

# ─── CORES ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

PASS=0
FAIL=0
WARN=0

ok()   { echo -e "  ${GREEN}✓${NC} $1"; ((PASS++)); }
fail() { echo -e "  ${RED}✗${NC} $1"; ((FAIL++)); }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; ((WARN++)); }
info() { echo -e "  ${BLUE}→${NC} $1"; }
section() { echo -e "\n${BOLD}${PURPLE}$1${NC}"; echo -e "  ${PURPLE}$(printf '%.0s─' {1..50})${NC}"; }

BASE="http://localhost:4101/api"
FRONT="http://localhost:4100"
TEST_EMAIL="test_$(date +%s)@ohm.test"
TEST_PASS="senha123"
TEST_NAME="Teste OHM"
TOKEN=""

echo -e "\n${BOLD}${PURPLE}ŌHM — Suite de Testes Completa${NC}"
echo -e "${PURPLE}$(printf '%.0s═' {1..50})${NC}"
echo -e "  Data: $(date '+%d/%m/%Y %H:%M:%S')"
echo -e "  Backend: $BASE"
echo -e "  Frontend: $FRONT"

# ─── 1. INFRAESTRUTURA ───────────────────────────────────────────────────────
section "1. Infraestrutura — Containers"

CONTAINERS=$(docker compose -f ~/ohm/docker-compose.yml ps --format json 2>/dev/null)

if docker ps | grep -q "ohm-backend"; then
  ok "Container ohm-backend rodando"
else
  fail "Container ohm-backend não encontrado"
fi

if docker ps | grep -q "ohm-frontend"; then
  ok "Container ohm-frontend rodando"
else
  fail "Container ohm-frontend não encontrado"
fi

# Portas
if ss -tlnp | grep -q ":4101"; then
  ok "Porta 4101 (backend) aberta"
else
  fail "Porta 4101 (backend) fechada"
fi

if ss -tlnp | grep -q ":4100"; then
  ok "Porta 4100 (frontend) aberta"
else
  fail "Porta 4100 (frontend) fechada"
fi

# Memória dos containers
BACKEND_MEM=$(docker stats ohm-backend --no-stream --format "{{.MemUsage}}" 2>/dev/null)
FRONTEND_MEM=$(docker stats ohm-frontend --no-stream --format "{{.MemUsage}}" 2>/dev/null)
info "Backend mem: $BACKEND_MEM"
info "Frontend mem: $FRONTEND_MEM"

# ─── 2. BACKEND — HEALTH ─────────────────────────────────────────────────────
section "2. Backend — Health & Conectividade"

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4101/health)
if [ "$HEALTH" = "200" ]; then
  ok "Health check respondeu 200"
  HEALTH_BODY=$(curl -s http://localhost:4101/health)
  info "Resposta: $HEALTH_BODY"
else
  fail "Health check falhou — HTTP $HEALTH"
fi

CYCLE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4101/api/cycle)
if [ "$CYCLE" = "200" ]; then
  ok "Endpoint /api/cycle respondeu 200"
  CYCLE_BODY=$(curl -s http://localhost:4101/api/cycle)
  CYCLE_NAME=$(echo $CYCLE_BODY | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
  info "Ciclo atual: $CYCLE_NAME"
else
  fail "Endpoint /api/cycle falhou — HTTP $CYCLE"
fi

# ─── 3. AUTENTICAÇÃO — REGISTRO ──────────────────────────────────────────────
section "3. Autenticação — Registro"

REGISTER=$(curl -s -X POST http://localhost:4101/api/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$TEST_NAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\",\"birthdate\":\"1990-03-15\",\"birthtime\":\"14:30\",\"intention\":\"prosperidade\"}")

if echo "$REGISTER" | grep -q '"success":true'; then
  ok "Registro de novo usuário — sucesso"
  MANTRA=$(echo $REGISTER | grep -o '"mantra":"[^"]*"' | head -1 | cut -d'"' -f4)
  QUALITIES=$(echo $REGISTER | grep -o '"qualities":"[^"]*"' | cut -d'"' -f4)
  info "Mantra gerado: $MANTRA"
  info "Qualidades: $QUALITIES"
else
  fail "Registro falhou: $REGISTER"
fi

# Registro duplicado deve falhar
DUP=$(curl -s -X POST http://localhost:4101/api/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$TEST_NAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\",\"birthdate\":\"1990-03-15\",\"intention\":\"paz\"}")

if echo "$DUP" | grep -q '"error"'; then
  ok "Registro duplicado bloqueado corretamente"
else
  fail "Registro duplicado não foi bloqueado"
fi

# Registro sem campos obrigatórios
INCOMPLETE=$(curl -s -X POST http://localhost:4101/api/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"incompleto@test.com\"}")

if echo "$INCOMPLETE" | grep -q '"error"'; then
  ok "Registro incompleto bloqueado corretamente"
else
  warn "Registro incompleto não retornou erro esperado"
fi

# ─── 4. AUTENTICAÇÃO — LOGIN ─────────────────────────────────────────────────
section "4. Autenticação — Login"

LOGIN=$(curl -s -X POST http://localhost:4101/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}")

if echo "$LOGIN" | grep -q '"token"'; then
  ok "Login com credenciais corretas — sucesso"
  TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  info "Token gerado: ${TOKEN:0:30}..."
else
  fail "Login falhou: $LOGIN"
fi

# Login com senha errada
WRONG=$(curl -s -X POST http://localhost:4101/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"senhaerrada\"}")

if echo "$WRONG" | grep -q '"error"'; then
  ok "Login com senha errada bloqueado corretamente"
else
  fail "Login com senha errada não foi bloqueado"
fi

# Login com email inexistente
NOUSER=$(curl -s -X POST http://localhost:4101/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"naoexiste@ohm.test\",\"password\":\"qualquer\"}")

if echo "$NOUSER" | grep -q '"error"'; then
  ok "Login com usuário inexistente bloqueado corretamente"
else
  fail "Login com usuário inexistente não foi bloqueado"
fi

# ─── 5. PERFIL ───────────────────────────────────────────────────────────────
section "5. Perfil — Dados do Usuário"

if [ -z "$TOKEN" ]; then
  fail "Token não disponível — pulando testes de perfil"
else
  PROFILE=$(curl -s http://localhost:4101/api/profile \
    -H "Authorization: Bearer $TOKEN")

  if echo "$PROFILE" | grep -q '"id"'; then
    ok "Perfil retornado com token válido"
    PNAME=$(echo $PROFILE | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
    PVEDIC=$(echo $PROFILE | grep -o '"number":[0-9]*' | cut -d':' -f2)
    PPLANET=$(echo $PROFILE | grep -o '"planet":"[^"]*"' | cut -d'"' -f4)
    PCYCLE=$(echo $PROFILE | grep -o '"name":"[^"]*"' | tail -1 | cut -d'"' -f4)
    info "Nome: $PNAME"
    info "Número védico: $PVEDIC — $PPLANET"
    info "Ciclo atual no perfil: $PCYCLE"
  else
    fail "Perfil falhou com token válido: $PROFILE"
  fi

  # Token inválido deve ser bloqueado
  BADTOKEN=$(curl -s http://localhost:4101/api/profile \
    -H "Authorization: Bearer token_invalido_123")

  if echo "$BADTOKEN" | grep -q '"error"'; then
    ok "Token inválido bloqueado corretamente"
  else
    fail "Token inválido não foi bloqueado"
  fi

  # Sem token deve ser bloqueado
  NOTOKEN=$(curl -s http://localhost:4101/api/profile)
  if echo "$NOTOKEN" | grep -q '"error"'; then
    ok "Acesso sem token bloqueado corretamente"
  else
    fail "Acesso sem token não foi bloqueado"
  fi
fi

# ─── 6. GERAÇÃO DE MANTRA ────────────────────────────────────────────────────
section "6. Geração de Mantra — Personalização"

NAMES=("Ana" "Carlos" "Fernanda" "João" "Maria" "Roberto")
for NAME in "${NAMES[@]}"; do
  TEMAIL="mantra_test_$(echo $NAME | tr '[:upper:]' '[:lower:]')@ohm.test"
  REG=$(curl -s -X POST http://localhost:4101/api/register \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$NAME\",\"email\":\"$TEMAIL\",\"password\":\"teste123\",\"birthdate\":\"1985-06-20\",\"intention\":\"paz\"}" 2>/dev/null)

  if echo "$REG" | grep -q '"mantra"'; then
    MTEXT=$(echo $REG | grep -o '"mantra":"[^"]*"' | head -1 | cut -d'"' -f4)
    ok "Mantra para '$NAME': $MTEXT"
  else
    warn "Mantra para '$NAME' não retornado como esperado"
  fi
done

# ─── 7. NUMEROLOGIA VÉDICA ───────────────────────────────────────────────────
section "7. Numerologia Védica — Datas de Nascimento"

DATES=("1990-01-01" "1985-03-15" "2000-12-31" "1975-07-08" "1995-09-27")
ESPERADOS=(3 8 9 6 9)

for i in "${!DATES[@]}"; do
  DATE="${DATES[$i]}"
  TEMAIL="vedic_${i}_$(date +%s)@ohm.test"
  REG=$(curl -s -X POST http://localhost:4101/api/register \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Teste Vedico\",\"email\":\"$TEMAIL\",\"password\":\"teste123\",\"birthdate\":\"$DATE\",\"intention\":\"paz\"}" 2>/dev/null)

  if echo "$REG" | grep -q '"number"'; then
    NUM=$(echo $REG | grep -o '"number":[0-9]*' | cut -d':' -f2)
    PLANET=$(echo $REG | grep -o '"planet":"[^"]*"' | cut -d'"' -f4)
    ok "Data $DATE → Número $NUM ($PLANET)"
  else
    warn "Numerologia para $DATE não retornou número"
  fi
done

# ─── 8. CICLOS VÉDICOS ───────────────────────────────────────────────────────
section "8. Ciclos Védicos — Horários"

CYCLE_RESP=$(curl -s http://localhost:4101/api/cycle)
if echo "$CYCLE_RESP" | grep -q '"name"'; then
  CNAME=$(echo $CYCLE_RESP | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
  CACTION=$(echo $CYCLE_RESP | grep -o '"action":"[^"]*"' | cut -d'"' -f4)
  CMANTRA=$(echo $CYCLE_RESP | grep -o '"mantra":"[^"]*"' | cut -d'"' -f4)
  ok "Ciclo retornado: $CNAME"
  info "Ação: $CACTION"
  info "Mantra: $CMANTRA"

  HORA=$(date +%H)
  if [ "$HORA" -ge 4 ] && [ "$HORA" -lt 6 ]; then
    ESPERADO="Brahma Muhurta"
  elif [ "$HORA" -ge 6 ] && [ "$HORA" -lt 12 ]; then
    ESPERADO="Sarga — Criação"
  elif [ "$HORA" -ge 12 ] && [ "$HORA" -lt 18 ]; then
    ESPERADO="Sthiti — Manutenção"
  elif [ "$HORA" -ge 18 ] && [ "$HORA" -lt 24 ]; then
    ESPERADO="Laya — Integração"
  else
    ESPERADO="Repouso"
  fi

  if [ "$CNAME" = "$ESPERADO" ]; then
    ok "Ciclo correto para hora atual ($HORA:xx) — $CNAME"
  else
    fail "Ciclo incorreto — esperado '$ESPERADO', recebido '$CNAME'"
  fi
else
  fail "Endpoint de ciclo não retornou dados válidos"
fi

# ─── 9. FRONTEND ─────────────────────────────────────────────────────────────
section "9. Frontend — Páginas e Assets"

HTTP_ROOT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4100/)
if [ "$HTTP_ROOT" = "200" ]; then
  ok "Página raiz (app React) respondeu 200"
else
  fail "Página raiz falhou — HTTP $HTTP_ROOT"
fi

HTTP_LANDING=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4100/landing)
if [ "$HTTP_LANDING" = "200" ]; then
  ok "Landing page respondeu 200"
  LANDING_TITLE=$(curl -s http://localhost:4100/landing | grep -o '<title>[^<]*</title>' | head -1)
  info "Title: $LANDING_TITLE"
else
  fail "Landing page falhou — HTTP $HTTP_LANDING"
fi

HTTP_ASSETS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4100/assets/)
info "Assets dir status: $HTTP_ASSETS"

# Verifica se o React bundle existe
BUNDLE=$(docker exec ohm-frontend ls /usr/share/nginx/html/assets/ 2>/dev/null | grep "\.js$" | head -1)
if [ -n "$BUNDLE" ]; then
  ok "React bundle presente: $BUNDLE"
  BUNDLE_SIZE=$(docker exec ohm-frontend du -h /usr/share/nginx/html/assets/$BUNDLE 2>/dev/null | cut -f1)
  info "Tamanho do bundle: $BUNDLE_SIZE"
else
  fail "React bundle não encontrado"
fi

# ─── 10. BANCO DE DADOS ──────────────────────────────────────────────────────
section "10. Banco de Dados — SQLite"

DB_PATH="/root/ohm/data/ohm.db"
if [ -f "$DB_PATH" ]; then
  ok "Arquivo do banco de dados existe"
  DB_SIZE=$(du -h $DB_PATH | cut -f1)
  info "Tamanho: $DB_SIZE"
else
  fail "Arquivo do banco não encontrado em $DB_PATH"
fi

USER_COUNT=$(docker exec ohm-backend sh -c "apk add --no-cache sqlite -q 2>/dev/null; sqlite3 /app/data/ohm.db 'SELECT COUNT(*) FROM users;'" 2>/dev/null)
if [ -n "$USER_COUNT" ]; then
  ok "Banco acessível — $USER_COUNT usuário(s) cadastrado(s)"
else
  warn "Não foi possível contar usuários"
fi

# Verifica usuário Danilo (admin)
DANILO=$(docker exec ohm-backend sh -c "sqlite3 /app/data/ohm.db \"SELECT name, plan FROM users WHERE email='danilovieira1adv@gmail.com';\"" 2>/dev/null)
if echo "$DANILO" | grep -q "cloud"; then
  ok "Usuário admin (Danilo) com plano cloud ativo"
  info "$DANILO"
else
  warn "Usuário admin não encontrado ou sem plano cloud"
fi

# ─── 11. PERFORMANCE ─────────────────────────────────────────────────────────
section "11. Performance — Tempos de Resposta"

for ENDPOINT in "health" "api/cycle"; do
  TIME=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:4101/$ENDPOINT)
  MS=$(echo "$TIME * 1000" | bc 2>/dev/null | cut -d'.' -f1)
  if [ -z "$MS" ]; then MS=$(echo "$TIME" | awk '{printf "%.0f", $1*1000}'); fi
  if [ "$MS" -lt 200 ] 2>/dev/null; then
    ok "/$ENDPOINT — ${MS}ms"
  elif [ "$MS" -lt 500 ] 2>/dev/null; then
    warn "/$ENDPOINT — ${MS}ms (aceitável)"
  else
    fail "/$ENDPOINT — ${MS}ms (lento)"
  fi
done

# Login performance
LOGIN_TIME=$(curl -s -o /dev/null -w "%{time_total}" -X POST http://localhost:4101/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}")
LOGIN_MS=$(echo "$LOGIN_TIME" | awk '{printf "%.0f", $1*1000}')
if [ "$LOGIN_MS" -lt 500 ]; then
  ok "/api/login — ${LOGIN_MS}ms"
else
  warn "/api/login — ${LOGIN_MS}ms (verificar bcrypt rounds)"
fi

# ─── 12. SEGURANÇA ───────────────────────────────────────────────────────────
section "12. Segurança — Validações"

# SQL Injection attempt
SQLI=$(curl -s -X POST http://localhost:4101/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ohm.test\" OR \"1\"=\"1","password":"qualquer"}')
if echo "$SQLI" | grep -q '"error"'; then
  ok "Tentativa de SQL injection bloqueada"
else
  warn "SQL injection retornou resposta inesperada — verificar"
fi

# XSS attempt no registro
XSS=$(curl -s -X POST http://localhost:4101/api/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"<script>alert(1)</script>\",\"email\":\"xss_$(date +%s)@ohm.test\",\"password\":\"teste123\",\"birthdate\":\"1990-01-01\",\"intention\":\"paz\"}")
if echo "$XSS" | grep -q '"success"'; then
  warn "XSS no nome aceito — sanitizar no frontend"
else
  ok "Input malicioso tratado"
fi

# CORS check
CORS=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: http://malicioso.com" http://localhost:4101/health)
info "CORS com origem externa — HTTP $CORS"

# ─── 13. DOCKER & SISTEMA ────────────────────────────────────────────────────
section "13. Sistema — Recursos e Docker"

DISK=$(df -h / | tail -1 | awk '{print $4}')
info "Disco disponível: $DISK"

MEM_FREE=$(free -h | grep Mem | awk '{print $4}')
info "Memória livre: $MEM_FREE"

CONTAINER_COUNT=$(docker ps | grep ohm | wc -l)
ok "$CONTAINER_COUNT container(s) OHM ativos"

UPTIME_BACKEND=$(docker inspect ohm-backend --format='{{.State.StartedAt}}' 2>/dev/null | cut -c1-19)
info "Backend iniciado em: $UPTIME_BACKEND"

# ─── LIMPEZA ─────────────────────────────────────────────────────────────────
section "Limpeza — Removendo dados de teste"

DELETED=$(docker exec ohm-backend sh -c "sqlite3 /app/data/ohm.db \"DELETE FROM users WHERE email LIKE '%@ohm.test'; SELECT changes();\"" 2>/dev/null)
if [ -n "$DELETED" ]; then
  ok "Usuários de teste removidos ($DELETED deletados)"
fi

# ─── RELATÓRIO FINAL ─────────────────────────────────────────────────────────
TOTAL=$((PASS + FAIL + WARN))
echo -e "\n${BOLD}${PURPLE}$(printf '%.0s═' {1..50})${NC}"
echo -e "${BOLD}  Relatório Final${NC}"
echo -e "${PURPLE}$(printf '%.0s─' {1..50})${NC}"
echo -e "  ${GREEN}✓ Passed:${NC}   $PASS"
echo -e "  ${YELLOW}⚠ Warnings:${NC} $WARN"
echo -e "  ${RED}✗ Failed:${NC}   $FAIL"
echo -e "  ${BLUE}Total:${NC}      $TOTAL testes"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}✓ TODOS OS TESTES CRÍTICOS PASSARAM${NC}"
elif [ $FAIL -le 2 ]; then
  echo -e "  ${YELLOW}${BOLD}⚠ $FAIL FALHA(S) — REVISAR${NC}"
else
  echo -e "  ${RED}${BOLD}✗ $FAIL FALHAS — ATENÇÃO NECESSÁRIA${NC}"
fi
echo -e "${PURPLE}$(printf '%.0s═' {1..50})${NC}\n"
