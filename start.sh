#!/bin/bash
set -e

echo "=========================================="
echo "  ▶️  INICIAR SERVIDOR - Aura Catalog"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 no encontrado. Instalando...${NC}"
    npm install -g pm2
fi

# Verificar si ya existe el proceso
if pm2 describe catalogo &> /dev/null; then
    echo -e "${YELLOW}🔄 El proceso 'catalogo' ya existe. Reiniciando...${NC}"
    pm2 restart catalogo --update-env
else
    echo -e "${YELLOW}🚀 Iniciando servidor por primera vez...${NC}"
    pm2 start npm --name "catalogo" -- start
fi

# Guardar configuración de PM2
pm2 save

echo ""
echo -e "${GREEN}✅ Servidor iniciado correctamente${NC}"
echo ""
pm2 status catalogo
echo ""
echo -e "🌐 URL: http://localhost:3000"
echo ""
