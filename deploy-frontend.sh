#!/bin/bash

###############################################################################
# SCRIPT DE DEPLOYMENT AUTOMÁTICO PARA TEMUCOSOFT FRONTEND EN EC2
# Uso: bash deploy-frontend.sh
###############################################################################

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║      🎨 DEPLOYMENT AUTOMÁTICO - TemucoSoft Frontend            ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables configurables
BACKEND_IP="${BACKEND_IP:-localhost}"
PROJECT_PATH="/home/ubuntu/TemucoSoft-S.A._eva4"

echo -e "${YELLOW}📋 Paso 1: Actualizando sistema...${NC}"
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

echo -e "${YELLOW}📋 Paso 2: Instalando Node.js 20 LTS...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - -qq
sudo apt-get install -y -qq nodejs

# Instalar nginx
sudo apt-get install -y -qq nginx

echo -e "${GREEN}✓ Node.js $(node -v) instalado${NC}"
echo -e "${GREEN}✓ npm $(npm -v) instalado${NC}"

echo -e "${YELLOW}📋 Paso 3: Clonando repositorio...${NC}"
if [ ! -d "$PROJECT_PATH" ]; then
  cd /home/ubuntu
  git clone https://github.com/D1eg0-G/TemucoSoft-S.A._eva4.git
  echo -e "${GREEN}✓ Repositorio clonado${NC}"
else
  cd "$PROJECT_PATH"
  git pull origin main
  echo -e "${GREEN}✓ Repositorio actualizado${NC}"
fi

echo -e "${YELLOW}📋 Paso 4: Instalando dependencias npm...${NC}"
cd "$PROJECT_PATH/front"
npm install -q

echo -e "${GREEN}✓ Dependencias npm instaladas${NC}"

echo -e "${YELLOW}📋 Paso 5: Configurando variables de entorno...${NC}"

# Leer IPs si no están configuradas
if [ -z "$BACKEND_IP" ] || [ "$BACKEND_IP" = "localhost" ]; then
  read -p "Ingresa la IP pública del backend EC2: " BACKEND_IP
fi

# Crear .env para producción
cat > "$PROJECT_PATH/front/.env" << EOF
VITE_API_MASTER_URL=http://$BACKEND_IP/api/master
VITE_API_BASICO_URL=http://$BACKEND_IP/api/basico
VITE_API_ESTANDAR_URL=http://$BACKEND_IP/api/medio
VITE_API_PREMIUM_URL=http://$BACKEND_IP/api/premium
EOF

echo -e "${GREEN}✓ .env configurado${NC}"
echo "  Backend IP: $BACKEND_IP"

echo -e "${YELLOW}📋 Paso 6: Compilando React...${NC}"
npm run build -q

echo -e "${GREEN}✓ Build completado${NC}"

echo -e "${YELLOW}📋 Paso 7: Copiando archivos a Nginx...${NC}"
sudo mkdir -p /var/www/html
sudo rm -rf /var/www/html/*
sudo cp -r "$PROJECT_PATH/front/dist"/* /var/www/html/

echo -e "${GREEN}✓ Archivos copiados${NC}"

echo -e "${YELLOW}📋 Paso 8: Configurando Nginx...${NC}"

sudo bash << 'SUDO_EOF'
cat > /etc/nginx/sites-available/frontend << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    # Single Page Application (SPA) routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cachear assets estáticos por 1 año
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;
    gzip_min_length 1000;
}
EOF

ln -sf /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx
SUDO_EOF

echo -e "${GREEN}✓ Nginx configurado${NC}"

echo -e "${YELLOW}📋 Paso 9: Creando script de actualización automática...${NC}"

cat > "$PROJECT_PATH/update-frontend.sh" << 'EOF'
#!/bin/bash
cd /home/ubuntu/TemucoSoft-S.A._eva4/front
echo "[$(date)] Actualizando frontend..."
git pull origin main 2>/dev/null
npm install -q 2>/dev/null
npm run build -q 2>/dev/null
sudo cp -r dist/* /var/www/html/
echo "[$(date)] Frontend actualizado exitosamente"
EOF

chmod +x "$PROJECT_PATH/update-frontend.sh"

# Agregar a crontab para actualizar diariamente a las 2 AM
(crontab -l 2>/dev/null | grep -v update-frontend.sh; echo "0 2 * * * $PROJECT_PATH/update-frontend.sh") | crontab -

echo -e "${GREEN}✓ Script de actualización creado${NC}"
echo "  El frontend se actualizará diariamente a las 2:00 AM"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}║           ✅ DEPLOYMENT COMPLETADO EXITOSAMENTE          ║${NC}"
echo "╚════════════════════════════════════════════════════════════════╝"

echo ""
echo "📊 INFORMACIÓN DEL DEPLOYMENT:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Proyecto: $PROJECT_PATH"
echo "  Backend IP: $BACKEND_IP"
echo "  Node.js: $(node -v)"
echo "  npm: $(npm -v)"
echo ""
echo "🌐 APLICACIÓN DISPONIBLE EN:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  http://$(hostname -I | awk '{print $1}')"
echo ""
echo "📋 COMANDOS ÚTILES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Ver status nginx:     sudo systemctl status nginx"
echo "  Reiniciar nginx:      sudo systemctl restart nginx"
echo "  Ver logs nginx:       sudo tail -f /var/log/nginx/access.log"
echo "  Actualizar manualmente: bash $PROJECT_PATH/update-frontend.sh"
echo ""

# Test de conectividad
echo "🔍 Verificando conectividad con backend..."
if curl -s "http://$BACKEND_IP/api/master/" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Backend accesible${NC}"
else
  echo -e "${RED}✗ No se pudo acceder al backend${NC}"
  echo "  Asegúrate de que:"
  echo "  1. El backend está corriendo en $BACKEND_IP"
  echo "  2. Los security groups permiten conexión desde esta EC2"
fi

echo ""
