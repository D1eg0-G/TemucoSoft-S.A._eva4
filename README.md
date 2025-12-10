<div align="center">

# 🧩 TemucoSoft ERP

_SaaS multi-tenant con React, Django/DRF y PostgreSQL_

![Status](https://img.shields.io/badge/Estado-Producción-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DBFB)
![Backend](https://img.shields.io/badge/Backend-Django%20%2B%20DRF-092E20)
![Database](https://img.shields.io/badge/DB-PostgreSQL-336791)
![License](https://img.shields.io/badge/License-Privado-orange)

</div>

---

## 🚀 Descripción

**TemucoSoft ERP** es un sistema SaaS ERP multi-tenant completo con 3 planes de suscripción (Básico, Estándar y Premium). Cuenta con autenticación centralizada en el servicio Master y ruteo dinámico de API según el plan del cliente.

**Características principales**:

- ✅ Multi-tenancy con aislamiento por `empresa_id`
- ✅ Autenticación JWT con login routing inteligente
- ✅ Validaciones chilenas (RUT, teléfono)
- ✅ 4 servicios Django independientes (1 Master + 3 por plan)
- ✅ Frontend React con routing por roles
- ✅ API REST completa con endpoints custom
- ✅ Documentación exhaustiva (MER, Deploy, API)

---

## 🏗️ Arquitectura

### Backend: 4 Servicios Django/DRF

```
┌─────────────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)                │
└──────┬────────────┬────────────┬────────────┬───────────┘
       │            │            │            │
       ▼            ▼            ▼            ▼
   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
   │ Master │  │ Básico │  │  Medio │  │Premium │
   │  :8000 │  │  :8001 │  │  :8002 │  │  :8003 │
   └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘
        │           │           │           │
        └───────────┴───────────┴───────────┘
                         │
                    PostgreSQL
           ┌────────────┼────────────┐
           ▼            ▼            ▼
       Master DB   Básico DB   Premium DB
```

- **Master (8000)**: Autenticación, empresas, planes, suscripciones
- **Básico (8001)**: 5 módulos (productos, inventario, ventas, caja, sucursales)
- **Medio (8002)**: Básico + proveedores, compras, pedidos internos
- **Premium (8003)**: Medio + e-commerce (clientes finales, carrito, órdenes)

### Frontend: React SPA con Routing por Rol

- **Admin TemucoSoft**: Gestión del SaaS (empresas, planes, suscripciones)
- **Admin Cliente**: ERP completo con módulos según plan
- **Routing dinámico**: `ProtectedRoute` valida permisos por plan y rol

### Base de Datos: PostgreSQL Multi-tenant

- Una base de datos por servicio (4 total)
- Aislamiento por `empresa_id` (no FK reales)
- Escalabilidad horizontal por plan

---

## ⚡ Inicio Rápido

### Requisitos Previos

- Python 3.10+
- Node.js 20+
- PostgreSQL 14+

### Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/TU_USUARIO/TemucoSoft-S.A._eva4.git
cd TemucoSoft-S.A._eva4

# 2. Backend - Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install django djangorestframework djangorestframework-simplejwt psycopg2-binary django-cors-headers

# 3. Configurar PostgreSQL (crear 4 bases de datos)
# Ver docs/DEPLOYMENT_GUIDE.md para scripts SQL

# 4. Migraciones
cd backend/services/master/proyecto_master
python manage.py migrate
cd ../../basico/proyecto_basico
python manage.py migrate
cd ../../medio/proyecto_medio
python manage.py migrate
cd ../../premium/proyecto_premium
python manage.py migrate
cd /ruta/al/proyecto

# 5. Frontend - Instalar dependencias
cd front
npm install

# 6. Configurar variables de entorno
# Crear front/.env con:
# VITE_API_MASTER_URL=http://localhost:8000/api/master
# VITE_API_BASICO_URL=http://localhost:8001/api/basico
# VITE_API_ESTANDAR_URL=http://localhost:8002/api/medio
# VITE_API_PREMIUM_URL=http://localhost:8003/api/premium
```

### Ejecutar

```bash
# Terminal 1: Iniciar todos los servicios Django
bash start_servers.sh

# Terminal 2: Iniciar frontend React
cd front
npm run dev
```

Acceder a: `http://localhost:5173`

---

## 📚 Documentación

| Documento                                                                 | Descripción                                                  |
| ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [**MER_DIAGRAM.md**](docs/MER_DIAGRAM.md)                                 | Diagrama Modelo Entidad-Relación completo con 51 tablas      |
| [**DEPLOYMENT_GUIDE.md**](docs/DEPLOYMENT_GUIDE.md)                       | Guía paso a paso para deploy en AWS EC2 con Nginx + Gunicorn |
| [**API_DOCUMENTATION.md**](docs/API_DOCUMENTATION.md)                     | Documentación de todos los endpoints REST                    |
| [**TemucoSoft_API_Collection.json**](docs/TemucoSoft_API_Collection.json) | Colección Postman importable                                 |

---

## 🔐 Autenticación y Roles

### Flujo de Login

```
1. POST /api/master/empresas/login-router/
   → Body: { email, password }

2. Master determina:
   - Super-admin (email @temucosoft) → Master API
   - Admin cliente → API según plan (basico/medio/premium)

3. Response incluye:
   - instance_url: URL del servicio asignado
   - modulos: JSON con permisos

4. Frontend reconfigura Axios baseURL
```

### Roles y Permisos

| Rol               | Plan      | Permisos                  |
| ----------------- | --------- | ------------------------- |
| **super_admin**   | Master    | Gestión SaaS completa     |
| **admin_cliente** | Todos     | Gestión ERP de su empresa |
| **gerente**       | Estándar+ | Supervisión y reportes    |
| **vendedor**      | Todos     | Ventas y caja             |

---

## 🆕 Endpoints Custom Implementados

### Master API

```http
POST /api/master/empresas/{id}/subscribe/
→ Suscribir empresa a un plan
Body: { "plan_id": 2, "fecha_inicio": "2025-01-01", "fecha_fin": "2025-12-31" }
```

### Servicios Básico/Medio/Premium

```http
POST /api/{service}/inventario/{id}/adjust/
→ Ajustar stock manualmente
Body: { "cantidad": 50, "tipo": "entrada", "motivo": "Ajuste físico" }
```

### Servicio Premium

```http
POST /api/premium/carritos/{id}/add/
→ Agregar producto al carrito
Body: { "producto_id": 5, "cantidad": 2 }

POST /api/premium/carritos/{id}/checkout/
→ Procesar checkout y crear orden
Body: { "cliente_id": 1, "direccion_envio": "...", "metodo_pago": "tarjeta" }
```

---

## 🎯 Módulos por Plan

### Plan Básico (5 módulos)

- ✅ Dashboard
- ✅ Productos y Categorías
- ✅ Inventario
- ✅ Ventas (POS)
- ✅ Caja

### Plan Estándar (10 módulos)

- ✅ **Básico +**
- ✅ Sucursales
- ✅ Proveedores
- ✅ Compras
- ✅ Pedidos Internos
- ✅ Movimientos de Inventario
- ✅ Rol Gerente habilitado

### Plan Premium (12 módulos)

- ✅ **Estándar +**
- ✅ Clientes Finales
- ✅ E-commerce (Carrito, Órdenes)
- ✅ Gestión de Usuarios
- ✅ Mi Suscripción
- ✅ API Tokens e Integraciones

---

## 🛠️ Tecnologías

### Backend

- Django 4.2+
- Django REST Framework 3.14+
- Simple JWT (autenticación)
- PostgreSQL (psycopg2)
- Gunicorn (producción)

### Frontend

- React 19
- Vite 7
- React Router v7
- Axios (interceptors)
- Lucide React (iconos)
- Recharts (gráficas)

### DevOps

- Nginx (reverse proxy)
- Gunicorn (WSGI server)
- PostgreSQL 14+
- AWS EC2 (recomendado)
- Let's Encrypt (SSL)

---

## 📊 Validaciones Implementadas

Todos los servicios incluyen validadores custom chilenos:

```python
✅ validar_rut()          → Formato 12.345.678-9 con dígito verificador
✅ validar_telefono()     → Formato +56912345678
✅ validar_precio()       → Valores >= 0
✅ validar_cantidad()     → Valores > 0
✅ validar_fecha()        → No fechas futuras
```

---

## 🚀 Deployment

### Producción con Nginx + Gunicorn

Ver guía completa en [**DEPLOYMENT_GUIDE.md**](docs/DEPLOYMENT_GUIDE.md)

**Resumen**:

1. EC2 Ubuntu 22.04 LTS (t3.medium)
2. PostgreSQL con 4 bases de datos
3. 4 servicios Gunicorn (systemd)
4. Nginx como reverse proxy
5. Let's Encrypt para SSL/HTTPS
6. Scripts de backup automatizados

**Scripts incluidos**:

- `start_servers.sh` - Iniciar todos los servicios en desarrollo
- `deploy.sh` - Deployment completo en producción
- `backup.sh` - Backup automático de bases de datos

---

## 📝 Testing con Postman

Importar colección desde `docs/TemucoSoft_API_Collection.json`:

1. Abrir Postman → Import
2. Seleccionar archivo JSON
3. Configurar variables:
   - `base_url_master`: `http://localhost:8000/api/master`
   - `base_url_basico`: `http://localhost:8001/api/basico`
   - `base_url_medio`: `http://localhost:8002/api/medio`
   - `base_url_premium`: `http://localhost:8003/api/premium`

---

## 🤝 Contribución

Este proyecto es privado. Para reportar bugs o solicitar features:

1. Crear issue en GitHub
2. Describir problema/feature detalladamente
3. Incluir logs si aplica

---

## 📄 Licencia

© 2025 TemucoSoft S.A. - Todos los derechos reservados.

---

## 📞 Soporte

- **Email**: soporte@temucosoft.cl
- **GitHub Issues**: [Crear issue](https://github.com/TU_USUARIO/TemucoSoft-S.A._eva4/issues)
- **Documentación**: Ver carpeta `docs/`

---

## 🎓 Créditos

Proyecto desarrollado para el curso de Ingeniería de Software - Universidad Católica de Temuco

**Equipo**:

- Backend & Arquitectura: [Tu Nombre]
- Frontend & UX: [Tu Nombre]
- DevOps & Deploy: [Tu Nombre]
- Documentación: [Tu Nombre]

---

<div align="center">

**⭐ Si te gusta el proyecto, dale una estrella en GitHub!**

</div>

- Backend `.env.backend` (variables comunes y por servicio):

```
# Comunes
DJANGO_SECRET_KEY=change-me
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Base de datos (comunes)
DB_ENGINE=django.db.backends.postgresql
DB_HOST=localhost
DB_PORT=5432

# Master
DB_NAME_MASTER=masterdb
DB_USER_MASTER=master
DB_PASSWORD_MASTER=master123

# Basico
DB_NAME_BASICO=basicdb
DB_USER_BASICO=basic
DB_PASSWORD_BASICO=basic123

# Medio
DB_NAME_MEDIO=mediodb
DB_USER_MEDIO=medio
DB_PASSWORD_MEDIO=medio123

# Premium
DB_NAME_PREMIUM=premiumdb
DB_USER_PREMIUM=premium
DB_PASSWORD_PREMIUM=premium123
```

- Carga automática de `.env.backend` (opcional):

```bash
source backend/venv/bin/activate
pip install python-dotenv
cp backend/.env.backend.example backend/.env.backend
```

### Estructura del Proyecto

```
TemucoSoft-S.A._eva4/
├─ README.md
├─ PROJECT_OVERVIEW.txt
├─ start_servers.sh
├─ backend/
│  ├─ manage.py
│  ├─ requirements.txt
│  ├─ .env.backend
│  ├─ services/
│  │  ├─ master/
│  │  │  └─ proyecto_master/
│  │  │     ├─ empresas/              # Modelos/serializers/views master
│  │  │     └─ proyecto_master/       # settings/urls/wsgi
│  │  ├─ basico/
│  │  │  └─ proyecto_basico/
│  │  │     ├─ gestion/               # Módulos del plan Básico
│  │  │     └─ proyecto_basico/
│  │  ├─ medio/
│  │  │  └─ proyecto_medio/
│  │  │     ├─ gestion/
│  │  │     └─ proyecto_medio/
│  │  └─ premium/
│  │     └─ proyecto_premium/
│  │        ├─ gestion/
│  │        └─ proyecto_premium/
│  └─ update_plan_urls.py
├─ front/
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ .env
│  ├─ public/
│  │  ├─ logo2.png, iconos...
│  └─ src/
│     ├─ App.jsx, main.jsx, App.css, index.css
│     ├─ admin-cliente/
│     │  ├─ Layout.jsx
│     │  ├─ Router.jsx
│     │  ├─ components/ProtectedRoute.jsx
│     │  ├─ config/
│     │  │  ├─ api.js           # Axios con baseURL dinámico
│     │  │  ├─ AuthContext.jsx  # Login/estado de sesión
│     │  │  └─ menu.jsx
│     │  └─ Pages/
│     │     ├─ Dashboard/ Products/ Inventory/ Sale/ CashRegister/
│     │     ├─ Branches/ Providers/ Purchases/ Orders/ Reports/
│     │     ├─ Gestion-user/ Subcription/
│     ├─ admin-temucosoft/
│     │  ├─ Layout.jsx, Router.jsx, config/menu.jsx
│     │  └─ Pages/ (DashboardTS, Companies, Plans, SubscriptionsTS, ClientAdmins)
│     ├─ core/ (pages/Login, utils/rutValidation.js)
│     └─ context/UserContext.jsx
└─ .github/copilot-instructions.md
```

### Ejecutar frontend

```bash
cd front
npm install
npm run dev
```

---

## 🔗 Backend

- Django 5 + DRF
- JWT (djangorestframework-simplejwt)
- Aislamiento por `empresa_id` en cada servicio

### Instalar dependencias backend

```bash
cd temucosoft-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Ejecutar servicios

Desde la raíz del repo:

```bash
bash start_servers.sh
```

Levanta Master (8000) + Basico (8001) + Medio (8002) + Premium (8003).

---

## 🔐 Autenticación y ruteo

- Login siempre contra Master (`/api/master/login`)
- El front guarda `plan` y token en `localStorage`
- Interceptor Axios selecciona baseURL:
  - Super-admin (correo contiene "temucosoft") → Master
  - Usuario de plan → API del plan (8001/8002/8003)

---

## 🧭 Planes y módulos

- Básico: dashboard, productos, inventario, venta, caja
- Estándar: Básico + sucursales, proveedores, compras, órdenes
- Premium: Estándar + gestión de usuarios, suscripciones

---

## 🧪 Scripts útiles

- `bash start_servers.sh` — inicia los 4 backends
- `npm run dev` — frontend en modo desarrollo

---

## 📂 Estructura breve

- `front/` — app React (admin-cliente y admin-temucosoft)
- `temucosoft-backend/services/`
  - `master/` — autenticación y gestión de empresas/planes
  - `basico/`, `medio/`, `premium/` — servicios por plan
- `start_servers.sh` — arranque simultáneo de servicios

---
