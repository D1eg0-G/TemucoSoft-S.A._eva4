# 🚀 Guía de Deployment en AWS EC2 - TemucoSoft ERP

## 📊 Arquitectura Propuesta (Free Tier)

```
┌─────────────────────────────────────────────────────────────┐
│                     AWS Free Tier                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EC2 #1 (t2.micro)          EC2 #2 (t2.micro)             │
│  ┌──────────────┐            ┌──────────────┐              │
│  │ Frontend     │            │ Backend      │              │
│  │ React+Vite   │            │ Django x4    │              │
│  │ Port 5173/80 │            │ Ports 8000-3 │              │
│  └──────────────┘            └──────────────┘              │
│                                      │                     │
│                                      ▼                     │
│  EC2 #3 (t2.micro)          PostgreSQL (RDS Free)         │
│  ┌──────────────┐            ┌──────────────┐              │
│  │ PostgreSQL   │ ◄─────────►│ RDS Managed  │              │
│  │ Local Backup │            │5.7 / 12      │              │
│  └──────────────┘            └──────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

OPCIÓN ALTERNATIVA (Más barato):
- 1 EC2 para Frontend (t2.micro)
- 1 EC2 para Backend + PostgreSQL (t2.micro con volumen EBS optimizado)
```

---

## 📋 Pre-requisitos

### 1. Cuenta AWS

- ✓ Crear en https://aws.amazon.com/es/free/
- ✓ Validar tarjeta de crédito (no cobra si usas Free Tier)
- ✓ 12 meses gratis para:
  - EC2 t2.micro (750 horas/mes)
  - RDS db.t2.micro (750 horas/mes) o usar PostgreSQL local
  - 30 GB de almacenamiento EBS
  - 5 GB de transferencia de datos

### 2. Herramientas Locales

```bash
# Instalar AWS CLI
brew install awscli  # Mac
# o
apt-get install awscli  # Linux

# Instalar SSH key pair
aws configure  # Configurar credenciales
```

---

## 🔧 PASO 1: Crear Instancias EC2

### 1.1 Crear Security Group

```bash
# Crear security group
aws ec2 create-security-group \
  --group-name temucosoft-sg \
  --description "Security group for TemucoSoft"

# Permitir SSH (puerto 22)
aws ec2 authorize-security-group-ingress \
  --group-name temucosoft-sg \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

# Permitir HTTP (puerto 80)
aws ec2 authorize-security-group-ingress \
  --group-name temucosoft-sg \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Permitir HTTPS (puerto 443)
aws ec2 authorize-security-group-ingress \
  --group-name temucosoft-sg \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Permitir puertos Django (8000-8003)
aws ec2 authorize-security-group-ingress \
  --group-name temucosoft-sg \
  --protocol tcp \
  --port 8000-8003 \
  --cidr 0.0.0.0/0

# Permitir puerto Vite (5173)
aws ec2 authorize-security-group-ingress \
  --group-name temucosoft-sg \
  --protocol tcp \
  --port 5173 \
  --cidr 0.0.0.0/0
```

### 1.2 Crear Key Pair

```bash
# Crear key pair
aws ec2 create-key-pair \
  --key-name temucosoft-key \
  --query 'KeyMaterial' \
  --output text > ~/temucosoft-key.pem

# Asegurar permisos
chmod 400 ~/temucosoft-key.pem
```

### 1.3 Lanzar EC2 Instances (Frontend)

```bash
# Usar AMI de Ubuntu 22.04 LTS (Free Tier eligible)
# AMI ID varía por región, buscar latest de Ubuntu 22.04

aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name temucosoft-key \
  --security-groups temucosoft-sg \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=temucosoft-frontend}]'

# Guardar Instance ID
# Ejemplo: i-0123456789abcdef0
```

### 1.4 Lanzar EC2 Instances (Backend)

```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name temucosoft-key \
  --security-groups temucosoft-sg \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=temucosoft-backend}]'
```

### 1.5 Obtener IPs Públicas

```bash
# Listar instancias
aws ec2 describe-instances \
  --query 'Reservations[*].Instances[*].[Tags[?Key==`Name`].Value[],PublicIpAddress,PrivateIpAddress]' \
  --output table

# Resultado esperado:
# temucosoft-frontend  | 54.123.45.67    | 172.31.x.x
# temucosoft-backend   | 54.123.45.68    | 172.31.x.x
```

---

## 🐧 PASO 2: Configurar EC2 Backend

### 2.1 Conectarse a la Instancia

```bash
# SSH a backend
ssh -i ~/temucosoft-key.pem ubuntu@54.123.45.68

# Actualizar sistema
sudo apt-get update
sudo apt-get upgrade -y
```

### 2.2 Instalar Dependencias

```bash
# Python 3.12 + pip
sudo apt-get install -y python3.12 python3.12-venv python3-pip

# PostgreSQL client
sudo apt-get install -y postgresql postgresql-contrib libpq-dev

# Git
sudo apt-get install -y git

# Nginx (para producción)
sudo apt-get install -y nginx

# uWSGI (servidor WSGI)
sudo apt-get install -y uwsgi uwsgi-plugin-python3

# Supervisor (para mantener procesos corriendo)
sudo apt-get install -y supervisor
```

### 2.3 Clonar Repositorio

```bash
cd /home/ubuntu
git clone https://github.com/D1eg0-G/TemucoSoft-S.A._eva4.git
cd TemucoSoft-S.A._eva4/temucosoft-backend

# Crear virtual environment
python3.12 -m venv venv
source venv/bin/activate
```

### 2.4 Instalar Dependencias Python

```bash
# Dentro del venv
pip install --upgrade pip
pip install -r requirements.txt

# Si no existe requirements.txt, crearlo:
# pip freeze > requirements.txt
```

### 2.5 Configurar Base de Datos

**OPCIÓN A: PostgreSQL Local en otra EC2**

```bash
# En la EC2 de base de datos (otra instancia t2.micro)
ssh -i ~/temucosoft-key.pem ubuntu@54.123.45.69

# Instalar PostgreSQL Server
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear user y databases
sudo -u postgres psql

-- Dentro de psql
CREATE USER temucosoft_user WITH PASSWORD 'secure_password_here';
CREATE DATABASE master_db OWNER temucosoft_user;
CREATE DATABASE basico_db OWNER temucosoft_user;
CREATE DATABASE medio_db OWNER temucosoft_user;
CREATE DATABASE premium_db OWNER temucosoft_user;

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE master_db TO temucosoft_user;
GRANT ALL PRIVILEGES ON DATABASE basico_db TO temucosoft_user;
GRANT ALL PRIVILEGES ON DATABASE medio_db TO temucosoft_user;
GRANT ALL PRIVILEGES ON DATABASE premium_db TO temucosoft_user;

-- Salir
\q
```

**OPCIÓN B: RDS PostgreSQL (Recomendado)**

```bash
# Desde consola AWS o CLI
aws rds create-db-instance \
  --db-instance-identifier temucosoft-postgres \
  --db-instance-class db.t2.micro \
  --engine postgres \
  --engine-version 14.7 \
  --master-username admin \
  --master-user-password YourSecurePassword123 \
  --allocated-storage 20 \
  --publicly-accessible true

# Esperar 10 minutos a que se cree la instancia
# Obtener endpoint
aws rds describe-db-instances \
  --db-instance-identifier temucosoft-postgres \
  --query 'DBInstances[0].Endpoint.Address'
```

### 2.6 Configurar Settings.py

En `services/master/proyecto_master/settings.py`:

```python
import os
from decouple import config

# Base de datos
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', 'master_db'),
        'USER': config('DB_USER', 'temucosoft_user'),
        'PASSWORD': config('DB_PASSWORD', 'secure_password_here'),
        'HOST': config('DB_HOST', 'localhost'),  # IP privada de PostgreSQL EC2
        'PORT': config('DB_PORT', '5432'),
    }
}

# Seguridad para producción
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
SECRET_KEY = config('SECRET_KEY', 'dev-key-only')
```

### 2.7 Crear Archivo .env

```bash
# En /home/ubuntu/TemucoSoft-S.A._eva4/.env

cat > /home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend/services/master/.env << EOF
DEBUG=False
SECRET_KEY=your-secret-key-change-this-in-production
ALLOWED_HOSTS=54.123.45.68,localhost,127.0.0.1
DB_NAME=master_db
DB_USER=temucosoft_user
DB_PASSWORD=secure_password_here
DB_HOST=172.31.x.x  # IP privada de PostgreSQL
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://54.123.45.67:5173,http://54.123.45.67
EOF

# Repetir para basico, medio, premium con sus respectivas DBs
```

### 2.8 Ejecutar Migraciones

```bash
cd /home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend

# Master
cd services/master/proyecto_master
source ../../venv/bin/activate
python manage.py migrate

# Basico
cd ../../basico/proyecto_basico
python manage.py migrate

# Medio
cd ../../medio/proyecto_medio
python manage.py migrate

# Premium
cd ../../premium/proyecto_premium
python manage.py migrate
```

### 2.9 Crear Admin User

```bash
cd services/master/proyecto_master
python manage.py createsuperuser
# Email: admin@temucosoft.cl
# Password: secure_password
```

### 2.10 Configurar Supervisor (Iniciar Django en boot)

```bash
# Crear archivo de configuración
sudo nano /etc/supervisor/conf.d/temucosoft.conf
```

Pegar:

```ini
[program:temucosoft-master]
command=/home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend/venv/bin/python /home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend/services/master/proyecto_master/manage.py runserver 0.0.0.0:8000
directory=/home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend/services/master/proyecto_master
autostart=true
autorestart=true
user=ubuntu
stderr_logfile=/var/log/supervisor/temucosoft-master.err.log
stdout_logfile=/var/log/supervisor/temucosoft-master.out.log

[program:temucosoft-basico]
command=/home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend/venv/bin/python /home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend/services/basico/proyecto_basico/manage.py runserver 0.0.0.0:8001
directory=/home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend/services/basico/proyecto_basico
autostart=true
autorestart=true
user=ubuntu
stderr_logfile=/var/log/supervisor/temucosoft-basico.err.log
stdout_logfile=/var/log/supervisor/temucosoft-basico.out.log

[program:temucosoft-medio]
command=/home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend/venv/bin/python /home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend/services/medio/proyecto_medio/manage.py runserver 0.0.0.0:8002
directory=/home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend/services/medio/proyecto_medio
autostart=true
autorestart=true
user=ubuntu
stderr_logfile=/var/log/supervisor/temucosoft-medio.err.log
stdout_logfile=/var/log/supervisor/temucosoft-medio.out.log

[program:temucosoft-premium]
command=/home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend/venv/bin/python /home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend/services/premium/proyecto_premium/manage.py runserver 0.0.0.0:8003
directory=/home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend/services/premium/proyecto_premium
autostart=true
autorestart=true
user=ubuntu
stderr_logfile=/var/log/supervisor/temucosoft-premium.err.log
stdout_logfile=/var/log/supervisor/temucosoft-premium.out.log
```

```bash
# Recargar supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

### 2.11 Configurar Nginx como Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/temucosoft
```

Pegar:

```nginx
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

    # Master API
    location /api/master {
        proxy_pass http://master;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Basico API
    location /api/basico {
        proxy_pass http://basico;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Medio API
    location /api/medio {
        proxy_pass http://medio;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Premium API
    location /api/premium {
        proxy_pass http://premium;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Habilitar site
sudo ln -s /etc/nginx/sites-available/temucosoft /etc/nginx/sites-enabled/

# Remover default
sudo rm /etc/nginx/sites-enabled/default

# Test configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🎨 PASO 3: Configurar EC2 Frontend

### 3.1 Conectarse

```bash
ssh -i ~/temucosoft-key.pem ubuntu@54.123.45.67
```

### 3.2 Instalar Node.js

```bash
# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node -v  # v20.x.x
npm -v   # 10.x.x
```

### 3.3 Clonar y Construir

```bash
cd /home/ubuntu
git clone https://github.com/D1eg0-G/TemucoSoft-S.A._eva4.git
cd TemucoSoft-S.A._eva4/front

# Instalar dependencias
npm install

# Crear .env para producción
cat > .env << EOF
VITE_API_MASTER_URL=http://54.123.45.68/api/master
VITE_API_BASICO_URL=http://54.123.45.68/api/basico
VITE_API_ESTANDAR_URL=http://54.123.45.68/api/medio
VITE_API_PREMIUM_URL=http://54.123.45.68/api/premium
EOF

# Build para producción
npm run build
```

### 3.4 Servir con Nginx

```bash
# Copiar archivos de build
sudo cp -r /home/ubuntu/TemucoSoft-S.A._eva4/front/dist/* /var/www/html/

# Crear configuración Nginx
sudo nano /etc/nginx/sites-available/frontend
```

Pegar:

```nginx
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Habilitar
sudo ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/

# Reiniciar
sudo systemctl restart nginx
```

### 3.5 Setup Automático de Build (opcional)

```bash
# Crear script de deploy
cat > /home/ubuntu/deploy.sh << 'EOF'
#!/bin/bash
cd /home/ubuntu/TemucoSoft-S.A._eva4/front
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/html/
EOF

chmod +x /home/ubuntu/deploy.sh

# Agregar a crontab para actualizar diariamente
crontab -e
# Agregar: 0 2 * * * /home/ubuntu/deploy.sh
```

---

## 🔐 PASO 4: Configuración de Seguridad

### 4.1 SSL/HTTPS (Gratuito con Let's Encrypt)

```bash
# En frontend EC2
sudo apt-get install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot certonly --nginx -d tu-dominio.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 4.2 Firewall

```bash
# En ambas EC2
sudo ufw enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 8000:8003/tcp  # Django (solo en backend)
```

### 4.3 Actualizar Security Groups en AWS

```bash
# Restringir SSH a tu IP
aws ec2 authorize-security-group-ingress \
  --group-name temucosoft-sg \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32

# Remover acceso público SSH
aws ec2 revoke-security-group-ingress \
  --group-name temucosoft-sg \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0
```

---

## 📊 PASO 5: Monitoreo y Logs

### 5.1 Ver Logs

```bash
# Backend Django
tail -f /var/log/supervisor/temucosoft-*.err.log
tail -f /var/log/supervisor/temucosoft-*.out.log

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL (si está local)
sudo tail -f /var/log/postgresql/postgresql.log
```

### 5.2 Comandos Útiles

```bash
# Ver estado de servicios
sudo supervisorctl status
sudo systemctl status nginx

# Reiniciar services
sudo supervisorctl restart all
sudo systemctl restart nginx

# Monitoreo de recursos
htop
df -h  # Disco
free -h  # Memoria
```

---

## 💰 COSTOS (Free Tier)

### Primer Año

- EC2 t2.micro x2 (Frontend + Backend): **$0** (750h/mes)
- PostgreSQL RDS (si usas): **$0** (750h/mes)
- EBS Storage (20GB): **$0** (Free Tier)
- Transferencia datos: **$0** (5GB/mes free)
- **TOTAL: $0**

### Después del Año 1

- EC2 t2.micro: ~$10/mes cada una
- PostgreSQL RDS: ~$50/mes
- Storage EBS: ~$2/mes
- **TOTAL: ~$75/mes**

---

## ✅ CHECKLIST DE DEPLOYMENT

```
BACKEND (EC2 #2):
[ ] Instancias creadas y en running
[ ] Security group configurado
[ ] PostgreSQL instalado y accesible
[ ] Django apps migradas
[ ] Admin user creado
[ ] Supervisor iniciando los 4 servicios
[ ] Nginx reverse proxy funcionando
[ ] Logs sin errores

FRONTEND (EC2 #1):
[ ] Build de React completado
[ ] Archivos en /var/www/html
[ ] Nginx sirviendo index.html
[ ] .env con URLs correctas
[ ] Pueda conectar a Backend

TESTING:
[ ] curl http://54.123.45.68/api/master/empresas/
[ ] curl http://54.123.45.67  → muestra React
[ ] Login funcionando
[ ] Crear empresa desde admin
[ ] Ver datos en dashboard
```

---

## 🚨 TROUBLESHOOTING

```bash
# Ver procesos Django
ps aux | grep manage.py

# Reiniciar un servicio
sudo supervisorctl restart temucosoft-master

# Test conectividad entre EC2s
ping 172.31.x.x  # IP privada

# Test base de datos
psql -h 172.31.x.x -U temucosoft_user -d master_db

# Ver logs de Nginx
sudo journalctl -u nginx -n 50

# Chequear puertos abiertos
sudo netstat -tulpn | grep LISTEN
```

---

## 🔄 Desplegar Actualizaciones

```bash
# Frontend
cd /home/ubuntu/TemucoSoft-S.A._eva4/front
git pull origin main
npm run build
sudo cp -r dist/* /var/www/html/

# Backend
cd /home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend
git pull origin main
python manage.py migrate  # Si hay cambios en modelos
sudo supervisorctl restart all
```

---

**¿Necesitas ayuda con algún paso específico?**
