# Guía de Deployment - TemucoSoft ERP en AWS EC2

## 📋 Tabla de Contenidos

1. [Arquitectura de Deployment](#arquitectura-de-deployment)
2. [Requisitos Previos](#requisitos-previos)
3. [Preparación del Servidor EC2](#preparación-del-servidor-ec2)
4. [Instalación de Dependencias](#instalación-de-dependencias)
5. [Configuración de PostgreSQL](#configuración-de-postgresql)
6. [Configuración de Django (Backend)](#configuración-de-django-backend)
7. [Configuración de Gunicorn](#configuración-de-gunicorn)
8. [Configuración de Nginx](#configuración-de-nginx)
9. [Configuración de React (Frontend)](#configuración-de-react-frontend)
10. [SSL/HTTPS con Let's Encrypt](#ssl-https-con-lets-encrypt)
11. [Scripts de Automatización](#scripts-de-automatización)
12. [Monitoreo y Logs](#monitoreo-y-logs)
13. [Backup y Mantenimiento](#backup-y-mantenimiento)

---

## 🏗️ Arquitectura de Deployment

```
┌──────────────────────────────────────────────────────────────┐
│                    AWS EC2 Instance                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                     Nginx (Puerto 80/443)              │  │
│  │           (Reverse Proxy + Static Files)               │  │
│  └──┬─────────┬─────────┬─────────┬─────────┬────────────┘  │
│     │         │         │         │         │                │
│     ▼         ▼         ▼         ▼         ▼                │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────────┐         │
│  │Gunic.│ │Gunic.│ │Gunic.│ │Gunic.│ │   React    │         │
│  │Master│ │Básico│ │Medio │ │Prem. │ │   Build    │         │
│  │:8000 │ │:8001 │ │:8002 │ │:8003 │ │ /var/www   │         │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └────────────┘         │
│     │        │        │        │                             │
│     ▼        ▼        ▼        ▼                             │
│  ┌──────────────────────────────────────────────┐            │
│  │              PostgreSQL (Puerto 5432)        │            │
│  │    ┌──────┬─────────┬──────────┬──────────┐ │            │
│  │    │Master│ Básico  │ Estándar │ Premium  │ │            │
│  │    │  DB  │   DB    │    DB    │   DB     │ │            │
│  │    └──────┴─────────┴──────────┴──────────┘ │            │
│  └──────────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ Requisitos Previos

### Servidor AWS EC2

**Especificaciones Recomendadas**:

- **Tipo de Instancia**: `t3.medium` o superior (2 vCPU, 4 GB RAM)
- **Sistema Operativo**: Ubuntu 22.04 LTS
- **Almacenamiento**: Mínimo 30 GB SSD (recomendado 50 GB)
- **Security Group**: Puertos abiertos:
  - 22 (SSH)
  - 80 (HTTP)
  - 443 (HTTPS)
  - 5432 (PostgreSQL, solo interno)

### Dominio y DNS

- Dominio registrado (ej: `temucosoft.cl`)
- Registros DNS configurados:
  ```
  A     @          → IP_PUBLICA_EC2
  A     www        → IP_PUBLICA_EC2
  A     api        → IP_PUBLICA_EC2
  ```

---

## 🖥️ Preparación del Servidor EC2

### 1. Conexión SSH

```bash
# Desde tu máquina local
chmod 400 tu-llave.pem
ssh -i tu-llave.pem ubuntu@TU_IP_PUBLICA
```

### 2. Actualización del Sistema

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y build-essential python3-dev python3-pip python3-venv \
                    git curl wget vim software-properties-common
```

### 3. Configurar Firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 📦 Instalación de Dependencias

### Node.js (para el frontend)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verificar v20.x
npm --version
```

### Python y Pip

```bash
sudo apt install -y python3 python3-pip python3-venv
python3 --version  # Debe ser 3.10+
```

---

## 🗄️ Configuración de PostgreSQL

### Instalación

```bash
sudo apt install -y postgresql postgresql-contrib libpq-dev
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Crear Bases de Datos y Usuarios

```bash
sudo -u postgres psql
```

```sql
-- Master Database
CREATE DATABASE temucosoft_master;
CREATE USER master_user WITH PASSWORD 'tu_password_seguro_1';
ALTER ROLE master_user SET client_encoding TO 'utf8';
ALTER ROLE master_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE master_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE temucosoft_master TO master_user;

-- Básico Database
CREATE DATABASE temucosoft_basico;
CREATE USER basico_user WITH PASSWORD 'tu_password_seguro_2';
ALTER ROLE basico_user SET client_encoding TO 'utf8';
ALTER ROLE basico_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE basico_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE temucosoft_basico TO basico_user;

-- Estándar Database
CREATE DATABASE temucosoft_estandar;
CREATE USER estandar_user WITH PASSWORD 'tu_password_seguro_3';
ALTER ROLE estandar_user SET client_encoding TO 'utf8';
ALTER ROLE estandar_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE estandar_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE temucosoft_estandar TO estandar_user;

-- Premium Database
CREATE DATABASE temucosoft_premium;
CREATE USER premium_user WITH PASSWORD 'tu_password_seguro_4';
ALTER ROLE premium_user SET client_encoding TO 'utf8';
ALTER ROLE premium_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE premium_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE temucosoft_premium TO premium_user;

\q
```

### Configurar Autenticación PostgreSQL

```bash
sudo vim /etc/postgresql/14/main/pg_hba.conf
```

Agregar antes de las líneas existentes:

```
# TemucoSoft connections
local   temucosoft_master       master_user                     md5
local   temucosoft_basico       basico_user                     md5
local   temucosoft_estandar     estandar_user                   md5
local   temucosoft_premium      premium_user                    md5
```

```bash
sudo systemctl restart postgresql
```

---

## ⚙️ Configuración de Django (Backend)

### 1. Clonar el Repositorio

```bash
cd /home/ubuntu
git clone https://github.com/TU_USUARIO/TemucoSoft-S.A._eva4.git
cd TemucoSoft-S.A._eva4
```

### 2. Crear Entorno Virtual Global

```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
```

### 3. Instalar Dependencias Python

```bash
# Instalar Django y dependencias comunes
pip install django djangorestframework djangorestframework-simplejwt \
            psycopg2-binary python-decouple gunicorn django-cors-headers
```

### 4. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
vim .env
```

```env
# Django Settings
SECRET_KEY=tu_secret_key_super_seguro_aqui
DEBUG=False
ALLOWED_HOSTS=temucosoft.cl,www.temucosoft.cl,api.temucosoft.cl,TU_IP_PUBLICA

# Database Master
DB_MASTER_NAME=temucosoft_master
DB_MASTER_USER=master_user
DB_MASTER_PASSWORD=tu_password_seguro_1
DB_MASTER_HOST=localhost
DB_MASTER_PORT=5432

# Database Básico
DB_BASICO_NAME=temucosoft_basico
DB_BASICO_USER=basico_user
DB_BASICO_PASSWORD=tu_password_seguro_2
DB_BASICO_HOST=localhost
DB_BASICO_PORT=5432

# Database Estándar
DB_ESTANDAR_NAME=temucosoft_estandar
DB_ESTANDAR_USER=estandar_user
DB_ESTANDAR_PASSWORD=tu_password_seguro_3
DB_ESTANDAR_HOST=localhost
DB_ESTANDAR_PORT=5432

# Database Premium
DB_PREMIUM_NAME=temucosoft_premium
DB_PREMIUM_USER=premium_user
DB_PREMIUM_PASSWORD=tu_password_seguro_4
DB_PREMIUM_HOST=localhost
DB_PREMIUM_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://temucosoft.cl,https://www.temucosoft.cl
```

### 5. Actualizar Settings.py de Cada Servicio

**Ejemplo para Master** (`backend/services/master/proyecto_master/proyecto_master/settings.py`):

```python
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=lambda v: [s.strip() for s in v.split(',')])

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_MASTER_NAME'),
        'USER': config('DB_MASTER_USER'),
        'PASSWORD': config('DB_MASTER_PASSWORD'),
        'HOST': config('DB_MASTER_HOST', default='localhost'),
        'PORT': config('DB_MASTER_PORT', default='5432'),
    }
}

CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', cast=lambda v: [s.strip() for s in v.split(',')])
```

Repetir para Básico, Medio y Premium con sus respectivas variables.

### 6. Migraciones y Superusuario

```bash
# Master
cd backend/services/master/proyecto_master
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
# Email: admin@temucosoft.cl
# Password: (tu password seguro)

# Básico
cd ../../basico/proyecto_basico
python manage.py makemigrations
python manage.py migrate

# Medio
cd ../../medio/proyecto_medio
python manage.py makemigrations
python manage.py migrate

# Premium
cd ../../premium/proyecto_premium
python manage.py makemigrations
python manage.py migrate

cd /home/ubuntu/TemucoSoft-S.A._eva4
```

### 7. Collectstatic

```bash
# En cada servicio
cd backend/services/master/proyecto_master
python manage.py collectstatic --noinput

cd ../../basico/proyecto_basico
python manage.py collectstatic --noinput

cd ../../medio/proyecto_medio
python manage.py collectstatic --noinput

cd ../../premium/proyecto_premium
python manage.py collectstatic --noinput
```

---

## 🚀 Configuración de Gunicorn

### 1. Crear Archivos de Configuración Gunicorn

**Master** - `/home/ubuntu/TemucoSoft-S.A._eva4/gunicorn_master.conf.py`:

```python
bind = "127.0.0.1:8000"
workers = 3
timeout = 120
accesslog = "/var/log/gunicorn/master_access.log"
errorlog = "/var/log/gunicorn/master_error.log"
loglevel = "info"
```

Crear similares para Básico (8001), Medio (8002) y Premium (8003).

### 2. Crear Directorio de Logs

```bash
sudo mkdir -p /var/log/gunicorn
sudo chown ubuntu:ubuntu /var/log/gunicorn
```

### 3. Crear Servicios Systemd

**Master** - `/etc/systemd/system/gunicorn-master.service`:

```ini
[Unit]
Description=Gunicorn Master API
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/TemucoSoft-S.A._eva4/backend/services/master/proyecto_master
Environment="PATH=/home/ubuntu/TemucoSoft-S.A._eva4/venv/bin"
ExecStart=/home/ubuntu/TemucoSoft-S.A._eva4/venv/bin/gunicorn \
          --config /home/ubuntu/TemucoSoft-S.A._eva4/gunicorn_master.conf.py \
          proyecto_master.wsgi:application

[Install]
WantedBy=multi-user.target
```

**Básico** - `/etc/systemd/system/gunicorn-basico.service`:

```ini
[Unit]
Description=Gunicorn Básico API
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/TemucoSoft-S.A._eva4/backend/services/basico/proyecto_basico
Environment="PATH=/home/ubuntu/TemucoSoft-S.A._eva4/venv/bin"
ExecStart=/home/ubuntu/TemucoSoft-S.A._eva4/venv/bin/gunicorn \
          --config /home/ubuntu/TemucoSoft-S.A._eva4/gunicorn_basico.conf.py \
          proyecto_basico.wsgi:application

[Install]
WantedBy=multi-user.target
```

Repetir para Medio y Premium.

### 4. Activar y Arrancar Servicios

```bash
sudo systemctl daemon-reload
sudo systemctl start gunicorn-master
sudo systemctl start gunicorn-basico
sudo systemctl start gunicorn-medio
sudo systemctl start gunicorn-premium

sudo systemctl enable gunicorn-master
sudo systemctl enable gunicorn-basico
sudo systemctl enable gunicorn-medio
sudo systemctl enable gunicorn-premium

# Verificar estado
sudo systemctl status gunicorn-master
sudo systemctl status gunicorn-basico
sudo systemctl status gunicorn-medio
sudo systemctl status gunicorn-premium
```

---

## 🌐 Configuración de Nginx

### 1. Instalación

```bash
sudo apt install -y nginx
```

### 2. Crear Configuración del Sitio

`/etc/nginx/sites-available/temucosoft`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name temucosoft.cl www.temucosoft.cl api.temucosoft.cl;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS Server
server {
    listen 443 ssl http2;
    server_name temucosoft.cl www.temucosoft.cl;

    ssl_certificate /etc/letsencrypt/live/temucosoft.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/temucosoft.cl/privkey.pem;

    # React Frontend
    location / {
        root /var/www/temucosoft-frontend;
        try_files $uri $uri/ /index.html;
    }

    # Master API
    location /api/master/ {
        proxy_pass http://127.0.0.1:8000/api/master/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Básico API
    location /api/basico/ {
        proxy_pass http://127.0.0.1:8001/api/basico/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Medio API
    location /api/medio/ {
        proxy_pass http://127.0.0.1:8002/api/medio/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Premium API
    location /api/premium/ {
        proxy_pass http://127.0.0.1:8003/api/premium/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /home/ubuntu/TemucoSoft-S.A._eva4/staticfiles/;
    }

    # Media files
    location /media/ {
        alias /home/ubuntu/TemucoSoft-S.A._eva4/mediafiles/;
    }
}
```

### 3. Activar Configuración

```bash
sudo ln -s /etc/nginx/sites-available/temucosoft /etc/nginx/sites-enabled/
sudo nginx -t  # Verificar sintaxis
sudo systemctl restart nginx
```

---

## ⚛️ Configuración de React (Frontend)

### 1. Configurar Variables de Entorno

Crear `front/.env.production`:

```env
VITE_API_MASTER_URL=https://temucosoft.cl/api/master
VITE_API_BASICO_URL=https://temucosoft.cl/api/basico
VITE_API_ESTANDAR_URL=https://temucosoft.cl/api/medio
VITE_API_PREMIUM_URL=https://temucosoft.cl/api/premium
```

### 2. Build del Frontend

```bash
cd /home/ubuntu/TemucoSoft-S.A._eva4/front
npm install
npm run build
```

### 3. Copiar Build a Directorio Web

```bash
sudo mkdir -p /var/www/temucosoft-frontend
sudo cp -r dist/* /var/www/temucosoft-frontend/
sudo chown -R www-data:www-data /var/www/temucosoft-frontend
```

---

## 🔒 SSL/HTTPS con Let's Encrypt

### 1. Instalación de Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtener Certificados SSL

```bash
sudo certbot --nginx -d temucosoft.cl -d www.temucosoft.cl -d api.temucosoft.cl
# Seguir instrucciones (email, aceptar términos)
```

### 3. Renovación Automática

```bash
# Certbot crea un cron job automático, verificar:
sudo systemctl status certbot.timer

# Test manual de renovación:
sudo certbot renew --dry-run
```

---

## 🤖 Scripts de Automatización

### Script de Deployment Completo

Crear `/home/ubuntu/TemucoSoft-S.A._eva4/deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Iniciando deployment de TemucoSoft ERP..."

# 1. Actualizar código
echo "📥 Pulling latest changes..."
git pull origin main

# 2. Activar entorno virtual
source /home/ubuntu/TemucoSoft-S.A._eva4/venv/bin/activate

# 3. Actualizar dependencias Python
echo "📦 Updating Python dependencies..."
pip install -r requirements.txt

# 4. Migraciones
echo "🗄️ Running migrations..."
cd backend/services/master/proyecto_master
python manage.py migrate --noinput
cd ../../basico/proyecto_basico
python manage.py migrate --noinput
cd ../../medio/proyecto_medio
python manage.py migrate --noinput
cd ../../premium/proyecto_premium
python manage.py migrate --noinput
cd /home/ubuntu/TemucoSoft-S.A._eva4

# 5. Collectstatic
echo "📁 Collecting static files..."
cd backend/services/master/proyecto_master
python manage.py collectstatic --noinput
cd ../../basico/proyecto_basico
python manage.py collectstatic --noinput
cd ../../medio/proyecto_medio
python manage.py collectstatic --noinput
cd ../../premium/proyecto_premium
python manage.py collectstatic --noinput
cd /home/ubuntu/TemucoSoft-S.A._eva4

# 6. Build frontend
echo "⚛️ Building frontend..."
cd front
npm install
npm run build
sudo rm -rf /var/www/temucosoft-frontend/*
sudo cp -r dist/* /var/www/temucosoft-frontend/
sudo chown -R www-data:www-data /var/www/temucosoft-frontend
cd ..

# 7. Restart services
echo "🔄 Restarting services..."
sudo systemctl restart gunicorn-master
sudo systemctl restart gunicorn-basico
sudo systemctl restart gunicorn-medio
sudo systemctl restart gunicorn-premium
sudo systemctl restart nginx

echo "✅ Deployment completed successfully!"
```

```bash
chmod +x /home/ubuntu/TemucoSoft-S.A._eva4/deploy.sh
```

### Script de Backup

Crear `/home/ubuntu/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
sudo -u postgres pg_dump temucosoft_master > $BACKUP_DIR/master_$DATE.sql
sudo -u postgres pg_dump temucosoft_basico > $BACKUP_DIR/basico_$DATE.sql
sudo -u postgres pg_dump temucosoft_estandar > $BACKUP_DIR/estandar_$DATE.sql
sudo -u postgres pg_dump temucosoft_premium > $BACKUP_DIR/premium_$DATE.sql

# Comprimir
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/*.sql
rm $BACKUP_DIR/*.sql

# Limpiar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: backup_$DATE.tar.gz"
```

```bash
chmod +x /home/ubuntu/backup.sh
```

**Agregar a Crontab** (backups diarios a las 2 AM):

```bash
crontab -e
```

```
0 2 * * * /home/ubuntu/backup.sh >> /var/log/backup.log 2>&1
```

---

## 📊 Monitoreo y Logs

### Ver Logs de Gunicorn

```bash
# Master
sudo tail -f /var/log/gunicorn/master_error.log

# Básico
sudo tail -f /var/log/gunicorn/basico_error.log
```

### Ver Logs de Nginx

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Ver Status de Servicios

```bash
sudo systemctl status gunicorn-master
sudo systemctl status nginx
sudo systemctl status postgresql
```

### Monitoreo de Recursos

```bash
# CPU y memoria
htop

# Espacio en disco
df -h

# Conexiones activas
sudo netstat -tupln | grep LISTEN
```

---

## 🛠️ Backup y Mantenimiento

### Restaurar Backup

```bash
# Descomprimir
tar -xzf /home/ubuntu/backups/backup_FECHA.tar.gz

# Restaurar cada DB
sudo -u postgres psql temucosoft_master < master_FECHA.sql
sudo -u postgres psql temucosoft_basico < basico_FECHA.sql
sudo -u postgres psql temucosoft_estandar < estandar_FECHA.sql
sudo -u postgres psql temucosoft_premium < premium_FECHA.sql
```

### Actualización del Sistema

```bash
sudo apt update
sudo apt upgrade -y
sudo reboot  # Si es necesario
```

### Limpieza de Logs

```bash
# Rotar logs de Gunicorn
sudo logrotate -f /etc/logrotate.d/gunicorn

# Limpiar journalctl
sudo journalctl --vacuum-time=7d
```

---

## 🔧 Troubleshooting Común

### Gunicorn no arranca

```bash
# Ver logs detallados
sudo journalctl -u gunicorn-master -n 50 --no-pager

# Verificar permisos
ls -la /home/ubuntu/TemucoSoft-S.A._eva4/venv/bin/gunicorn

# Reiniciar servicio
sudo systemctl restart gunicorn-master
```

### Nginx 502 Bad Gateway

```bash
# Verificar que Gunicorn esté corriendo
sudo systemctl status gunicorn-master

# Verificar logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar conectividad a Gunicorn
curl http://127.0.0.1:8000/api/master/
```

### PostgreSQL Connection Failed

```bash
# Verificar servicio PostgreSQL
sudo systemctl status postgresql

# Verificar conexión local
sudo -u postgres psql -c "SELECT version();"

# Revisar configuración de autenticación
sudo vim /etc/postgresql/14/main/pg_hba.conf
```

### CORS Errors en Frontend

Verificar en `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://temucosoft.cl",
    "https://www.temucosoft.cl",
]

CORS_ALLOW_CREDENTIALS = True
```

---

## 📝 Checklist de Deployment

- [ ] EC2 creada y configurada
- [ ] Security Groups configurados (22, 80, 443)
- [ ] PostgreSQL instalado y DBs creadas
- [ ] Python y dependencias instaladas
- [ ] Migraciones ejecutadas
- [ ] Gunicorn configurado y corriendo (4 servicios)
- [ ] Nginx instalado y configurado
- [ ] Frontend buildeado y copiado
- [ ] SSL/HTTPS configurado con Let's Encrypt
- [ ] Scripts de backup configurados
- [ ] Cron jobs para backups activos
- [ ] Monitoreo de logs configurado
- [ ] Variables de entorno `.env` en producción

---

## 🎯 URLs Finales

- **Frontend**: `https://temucosoft.cl`
- **Master API**: `https://temucosoft.cl/api/master/`
- **Básico API**: `https://temucosoft.cl/api/basico/`
- **Medio API**: `https://temucosoft.cl/api/medio/`
- **Premium API**: `https://temucosoft.cl/api/premium/`

---

## 📧 Soporte

En caso de problemas, revisar:

1. Logs de Gunicorn: `/var/log/gunicorn/`
2. Logs de Nginx: `/var/log/nginx/`
3. Journalctl: `sudo journalctl -xe`
4. PostgreSQL logs: `/var/log/postgresql/`
