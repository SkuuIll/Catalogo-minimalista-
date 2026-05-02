#!/bin/bash
set -e

echo "=========================================="
echo "  🚀 DEPLOY - Aura Catalog"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Build
echo -e "${YELLOW}📦 Paso 1: Compilando build de producción...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build exitoso${NC}"
else
    echo -e "${RED}❌ Error en el build${NC}"
    exit 1
fi

echo ""

# 2. Reiniciar servidor
echo -e "${YELLOW}🔄 Paso 2: Reiniciando servidor PM2...${NC}"
pm2 restart aura-catalog --update-env
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Servidor reiniciado${NC}"
else
    echo -e "${RED}❌ Error reiniciando servidor${NC}"
    exit 1
fi

echo ""

# 3. Esperar y verificar
echo -e "${YELLOW}⏳ Paso 3: Verificando estado...${NC}"
sleep 3
pm2 status catalogo

echo ""

# 4. Git add, commit, push
echo -e "${YELLOW}📤 Paso 4: Subiendo cambios a GitHub...${NC}"
git add -A
read -p "📝 Escribe un mensaje para el commit (o presiona Enter para usar 'deploy: update'): " msg
if [ -z "$msg" ]; then
    msg="deploy: update"
fi
git commit -m "$msg" || echo -e "${YELLOW}⚠️  Nada para commitear${NC}"
git push origin main

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  ✅ DEPLOY COMPLETADO EXITOSAMENTE${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "🌐 URLs:"
echo -e "   Local:   http://localhost:3000"
echo -e "   Public:  https://showjr.store"
echo -e "   Admin:   https://showjr.store/admin"
echo -e "   Login:   https://showjr.store/login"
echo ""
