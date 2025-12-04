# 🚀 QUICK START - Deployment EC2 TemucoSoft

## ⚡ Opción Rápida (5 minutos)

### 1. En AWS Console

```bash
# Crear 2 instancias t2.micro (Ubuntu 22.04 LTS)
# - temucosoft-frontend
# - temucosoft-backend

# Crear Security Group "temucosoft-sg" permitiendo:
# - SSH (22) desde tu IP
# - HTTP (80) desde 0.0.0.0/0
# - HTTPS (443) desde 0.0.0.0/0
# - Puertos 8000-8003 desde 0.0.0.0/0 (backend)
```

### 2. SSH a Backend EC2

```bash
ssh -i ~/temucosoft-key.pem ubuntu@BACKEND_IP

# Descargar y ejecutar script
curl -O https://raw.githubusercontent.com/D1eg0-G/TemucoSoft-S.A._eva4/main/deploy-backend.sh
bash deploy-backend.sh

# Sigue las instrucciones (introducir credenciales BD, crear admin, etc)
```

### 3. SSH a Frontend EC2

```bash
ssh -i ~/temucosoft-key.pem ubuntu@FRONTEND_IP

# Descargar y ejecutar script
curl -O https://raw.githubusercontent.com/D1eg0-G/TemucoSoft-S.A._eva4/main/deploy-frontend.sh
bash deploy-frontend.sh

# Cuando pida: ingresa la IP del backend
```

### 4. ¡Listo!

```
Frontend: http://FRONTEND_IP
Backend:  http://BACKEND_IP/api/master
```

---

## 📚 Documentación Completa

Ver `DEPLOYMENT_EC2_GUIDE.md` para:

- Configuración manual paso a paso
- Setup de PostgreSQL
- SSL/HTTPS con Let's Encrypt
- Monitoreo y logs
- Troubleshooting

---

## 💰 Costos (Free Tier 1 año)

- EC2 t2.micro x2: **$0**
- Storage: **$0**
- Data transfer: **$0**
- **TOTAL: $0** ✨

Después del año:

- 2x EC2: ~$20/mes
- PostgreSQL (si usas RDS): ~$50/mes
- **TOTAL: ~$70/mes**

---

## ✅ Verificación Post-Deployment

```bash
# Desde tu máquina local
curl http://BACKEND_IP/api/master/empresas/
curl http://FRONTEND_IP

# Debería ver:
# Backend: {"detail":"Authentication credentials were not provided."}
# Frontend: HTML de React
```

---

## 🆘 Troubleshooting Rápido

```bash
# ¿No conecta al backend?
# 1. Verifica security groups (80, 8000-8003 abiertos)
# 2. SSH a backend y ejecuta:
sudo supervisorctl status
tail -f /var/log/supervisor/temucosoft-master.err.log

# ¿Frontend no carga?
# 1. SSH a frontend y ejecuta:
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# ¿Base de datos no conecta?
# 1. Verifica que PostgreSQL esté corriendo
# 2. Checkea credenciales en .env
```

---

## 📱 Acceder desde Móvil

```
http://BACKEND_IP_PUBLICA:5173  (en desarrollo)
http://FRONTEND_IP_PUBLICA     (en producción)
```

---

## 🔄 Actualizar Código

```bash
# Backend
ssh ubuntu@BACKEND_IP
cd /home/ubuntu/TemucoSoft-S.A._eva4/temucosoft-backend
git pull origin main
python manage.py migrate
sudo supervisorctl restart all

# Frontend
ssh ubuntu@FRONTEND_IP
bash /home/ubuntu/TemucoSoft-S.A._eva4/update-frontend.sh
```

---

## 🔐 Cambios de Seguridad Antes de Producción

```bash
# 1. Cambiar SECRET_KEY en .env
# 2. Cambiar contraseña de admin
# 3. Habilitar HTTPS con Let's Encrypt
# 4. Restringir SSH a tu IP
# 5. Cambiar DEBUG a False
```

---

**¿Necesitas ayuda? Revisa DEPLOYMENT_EC2_GUIDE.md o crea un issue en el repo.**
