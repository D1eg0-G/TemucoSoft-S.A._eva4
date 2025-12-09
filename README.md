<div align="center">

# 🧩 TemucoSoft ERP

_SaaS multi-tenant con React, Django/DRF y PostgreSQL_

![Status](https://img.shields.io/badge/Estado-En%20Desarrollo-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DBFB)
![Backend](https://img.shields.io/badge/Backend-Django%20%2B%20DRF-092E20)
![Database](https://img.shields.io/badge/DB-PostgreSQL-336791)
![License](https://img.shields.io/badge/License-Privado-orange)

</div>

---

## 🚀 Descripción

SaaS ERP multi-tenant con planes Básico, Estándar y Premium. Autenticación centralizada en el servicio Master y ruteo dinámico de API según plan del cliente.

---

## 🏗️ Arquitectura

- Backend: 4 servicios Django/DRF
  - Master (8000): auth, empresas, suscripciones
  - Basico (8001), Medio (8002), Premium (8003): módulos por plan
- Frontend: React + Vite, router por rol (admin-cliente, admin-temucosoft)
- DB: PostgreSQL (una por plan)

---

## ⚡ Frontend

- React 19 + Vite 7
- React Router v7
- Axios con interceptores y baseURL dinámica por plan
- UI libs: lucide-react (iconos), recharts (gráficas)

### Entorno

- Frontend `.env` (ejemplo real):

```
VITE_API_MASTER_URL=http://localhost:8000
VITE_API_BASICO_URL=http://localhost:8001/api/basico
VITE_API_ESTANDAR_URL=http://localhost:8002/api/medio
VITE_API_PREMIUM_URL=http://localhost:8003/api/premium
```

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
