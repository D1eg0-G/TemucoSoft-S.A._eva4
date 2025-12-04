#!/bin/bash

###############################################################################
# SCRIPT DE DEPLOYMENT AUTOMÁTICO PARA TEMUCOSOFT EN EC2
# Uso: bash deploy-backend.sh
###############################################################################

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║      🚀 DEPLOYMENT AUTOMÁTICO - TemucoSoft Backend             ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables configurables
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-temucosoft_user}"
DB_PASSWORD="${DB_PASSWORD:-secure_password}"
PROJECT_PATH="/home/ubuntu/TemucoSoft-S.A._eva4"
VENV_PATH="$PROJECT_PATH/temucosoft-backend/venv"

echo -e "${YELLOW}📋 Paso 1: Actualizando sistema...${NC}"
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

echo -e "${YELLOW}📋 Paso 2: Instalando dependencias...${NC}"
sudo apt-get install -y -qq \
  python3.12 python3.12-venv python3-pip \
  postgresql postgresql-contrib libpq-dev \
  git nginx uwsgi uwsgi-plugin-python3 supervisor

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

echo -e "${YELLOW}📋 Paso 4: Creando virtual environment...${NC}"
if [ ! -d "$VENV_PATH" ]; then
  python3.12 -m venv "$VENV_PATH"
  echo -e "${GREEN}✓ Venv creado${NC}"
fi

echo -e "${YELLOW}📋 Paso 5: Instalando dependencias Python...${NC}"
source "$VENV_PATH/bin/activate"
pip install --upgrade pip -q
pip install -q \
  Django==5.2.9 \
  djangorestframework==3.14.0 \
  djangorestframework-simplejwt==5.3.0 \
  django-cors-headers==4.3.1 \
  psycopg2-binary==2.9.9 \
  python-decouple==3.8 \
  requests==2.31.0

echo -e "${GREEN}✓ Dependencias Python instaladas${NC}"

echo -e "${YELLOW}📋 Paso 6: Configurando base de datos...${NC}"

# Crear archivos .env para cada servicio
for SERVICE in master basico medio premium; do
  ENV_FILE="$PROJECT_PATH/temucosoft-backend/services/$SERVICE/.env"
  
  cat > "$ENV_FILE" << EOF
DEBUG=False
SECRET_KEY=your-secret-key-change-in-production-$(date +%s)
ALLOWED_HOSTS=localhost,127.0.0.1,your-ip-here
DB_NAME=${SERVICE}_db
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
CORS_ALLOWED_ORIGINS=http://your-frontend-ip:5173,http://your-frontend-ip
EOF

  echo -e "${GREEN}✓ .env creado para $SERVICE${NC}"
done

echo -e "${YELLOW}📋 Paso 7: Ejecutando migraciones...${NC}"

for SERVICE in master basico medio premium; do
  cd "$PROJECT_PATH/temucosoft-backend/services/$SERVICE/proyecto_$SERVICE"
  source "$VENV_PATH/bin/activate"
  python manage.py migrate --noinput
  echo -e "${GREEN}✓ Migraciones completadas para $SERVICE${NC}"
done

echo -e "${YELLOW}📋 Paso 8: Creando admin user (opcional)...${NC}"
read -p "¿Deseas crear un usuario admin? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  cd "$PROJECT_PATH/temucosoft-backend/services/master/proyecto_master"
  source "$VENV_PATH/bin/activate"
  python manage.py createsuperuser
fi

echo -e "${YELLOW}📋 Paso 9: Configurando Supervisor...${NC}"

# Crear configuración de supervisor
SUPERVISOR_CONF="/etc/supervisor/conf.d/temucosoft.conf"

sudo bash << SUDO_EOF
cat > $SUPERVISOR_CONF << 'EOF'
[program:temucosoft-master]
command=$VENV_PATH/bin/python $PROJECT_PATH/temucosoft-backend/services/master/proyecto_master/manage.py runserver 0.0.0.0:8000
directory=$PROJECT_PATH/temucosoft-backend/services/master/proyecto_master
autostart=true
autorestart=true
user=ubuntu
stderr_logfile=/var/log/supervisor/temucosoft-master.err.log
stdout_logfile=/var/log/supervisor/temucosoft-master.out.log

[program:temucosoft-basico]
command=$VENV_PATH/bin/python $PROJECT_PATH/temucosoft-backend/services/basico/proyecto_basico/manage.py runserver 0.0.0.0:8001
directory=$PROJECT_PATH/temucosoft-backend/services/basico/proyecto_basico
autostart=true
autorestart=true
user=ubuntu
stderr_logfile=/var/log/supervisor/temucosoft-basico.err.log
stdout_logfile=/var/log/supervisor/temucosoft-basico.out.log

[program:temucosoft-medio]
command=$VENV_PATH/bin/python $PROJECT_PATH/temucosoft-backend/services/medio/proyecto_medio/manage.py runserver 0.0.0.0:8002
directory=$PROJECT_PATH/temucosoft-backend/services/medio/proyecto_medio
autostart=true
autorestart=true
user=ubuntu
stderr_logfile=/var/log/supervisor/temucosoft-medio.err.log
stdout_logfile=/var/log/supervisor/temucosoft-medio.out.log

[program:temucosoft-premium]
command=$VENV_PATH/bin/python $PROJECT_PATH/temucosoft-backend/services/premium/proyecto_premium/manage.py runserver 0.0.0.0:8003
directory=$PROJECT_PATH/temucosoft-backend/services/premium/proyecto_premium
autostart=true
autorestart=true
user=ubuntu
stderr_logfile=/var/log/supervisor/temucosoft-premium.err.log
stdout_logfile=/var/log/supervisor/temucosoft-premium.out.log
EOF

supervisorctl reread
supervisorctl update
supervisorctl start all
SUDO_EOF

echo -e "${GREEN}✓ Supervisor configurado${NC}"

echo -e "${YELLOW}📋 Paso 10: Configurando Nginx...${NC}"

sudo bash << 'SUDO_EOF'
cat > /etc/nginx/sites-available/temucosoft << 'EOF'
upstream master {
    server 127.0.0.1:8000;
}

upstream basico {
    server 127.0.0.1:8001;
}

upstream medio {
    server 127.0.0.1:8002;
}

upstream premium {
    server 127.0.0.1:8003;
}

server {
    listen 80;
    server_name _;

    location /api/master {
        proxy_pass http://master;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/basico {
        proxy_pass http://basico;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/medio {
        proxy_pass http://medio;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/premium {
        proxy_pass http://premium;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

ln -sf /etc/nginx/sites-available/temucosoft /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx
SUDO_EOF

echo -e "${GREEN}✓ Nginx configurado${NC}"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}║           ✅ DEPLOYMENT COMPLETADO EXITOSAMENTE          ║${NC}"
echo "╚════════════════════════════════════════════════════════════════╝"

echo ""
echo "📊 INFORMACIÓN DEL DEPLOYMENT:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Proyecto: $PROJECT_PATH"
echo "  Virtual Env: $VENV_PATH"
echo "  BD Host: $DB_HOST"
echo "  BD Puerto: $DB_PORT"
echo "  BD Usuario: $DB_USER"
echo ""
echo "🚀 SERVIDORES CORRIENDO EN:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Master API:    http://localhost:8000/api/master"
echo "  Basico API:    http://localhost:8001/api/basico"
echo "  Medio API:     http://localhost:8002/api/medio"
echo "  Premium API:   http://localhost:8003/api/premium"
echo "  Nginx Proxy:   http://localhost/api/*"
echo ""
echo "📋 COMANDOS ÚTILES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Ver estado:    sudo supervisorctl status"
echo "  Ver logs:      tail -f /var/log/supervisor/temucosoft-*.err.log"
echo "  Reiniciar:     sudo supervisorctl restart all"
echo "  Admin Django:  cd $PROJECT_PATH/temucosoft-backend/services/master/proyecto_master && python manage.py createsuperuser"
echo ""
