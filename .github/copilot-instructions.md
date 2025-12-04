# TemucoSoft ERP - AI Copilot Instructions

## 📋 Project Overview

**TemucoSoft** is a **multi-tenant SaaS ERP system** with subscription-based tiers (Básico, Estándar, Premium).

- **Frontend**: React + Vite (single app with role-based routing)
- **Backend**: Django + DRF with **multi-service architecture** (Master API + per-plan instances)
- **Database**: PostgreSQL (one per plan)

**Key Insight**: The architecture uses **plan-based API routing** where clients connect to different Django backends based on subscription tier.

---

## 🏗️ Architecture Patterns

### Multi-Service Backend Structure

```
temucosoft-backend/services/
├── master/          → Port 8000 (authentication, company management, subscriptions)
├── basico/          → Port 8001 (basic plan features)
├── medio/           → Port 8002 (standard plan features)
└── premium/         → Port 8003 (premium plan features)
```

**Startup**: Run `bash start_servers.sh` from workspace root - spawns all 4 Django servers simultaneously.

### Dynamic API Routing (Critical Pattern)

Located in `front/src/admin-cliente/config/api.js` and `AuthContext.jsx`:

- **AuthContext** stores `plan` & `user` data in localStorage
- **API Interceptor** dynamically selects baseURL:
  - **Super-admin** (email contains "temucosoft") → Always uses Master API (port 8000)
  - **Regular user** → Uses plan-specific API (port 8001-8003)
- Plan metadata includes `apiUrl` configuration for routing

**Pattern**: Modify API behavior via `localStorage.getItem("plan")` and user role checks.

---

## 🎯 Component Architecture

### Frontend Organization

- **`admin-cliente/`** → Client ERP dashboard (16 modules across 3 plans)
- **`admin-temucosoft/`** → Super-admin SaaS management (Companies, Plans, Subscriptions)
- **`core/`** → Shared (Login page, contexts, utils)

### Plan-Based Module Access

Each plan enables different modules (stored in AuthContext):

```javascript
PLAN_CONFIG = {
  basico: ["dashboard", "products", "inventory", "sale", "cashregister"],
  estandar: [...basico + "branches", "providers", "purchases", ...],
  premium: [...estandar + "gestion-user", "subscription"]
}
```

**Pattern**: Use `ProtectedRoute` wrapper for module authorization (see `admin-cliente/components/ProtectedRoute.jsx`).

---

## 🔐 Authentication & Security

- **JWT tokens** stored in localStorage (`access_token`)
- **AuthContext** manages login state and auto-initialization from tokens
- **Master API** (`VITE_API_BASICO_URL`, etc.) configured via `.env` variables
- **Token injection**: API interceptor adds `Authorization: Bearer {token}` to all requests

**Key Files**:

- `front/src/admin-cliente/config/AuthContext.jsx` → Login, token refresh, plan initialization
- `front/src/admin-cliente/config/api.js` → Request/response interceptors

---

## 📊 Core Data Models

### Master (Server Management)

- **Empresa** → Client companies with RUT validation
- **Plan** → Subscription tiers (name, features, modules)
- **Suscripcion** → Links Empresa + Plan with pricing & dates
- **ClientAdmin** → Super-admin users managing Temucosoft

### Per-Plan Services (Basico/Medio/Premium)

- **Usuario** → Role-based (admin_cliente, vendedor)
- **Sucursal** → Branches with geolocation
- **Producto** → SKU-based inventory with cost tracking
- **Inventario** → Stock per sucursal with reorder points
- **Venta** → POS transactions with payment method tracking
- **Caja** → Cash register sessions (open/close)
- **Compra** → Purchase orders to providers
- **Proveedor** → Vendor management

**Pattern**: All models include `empresa_id` for tenant isolation (no FK to distinguish from other tenants).

---

## 🚀 Developer Workflows

### Starting the Development Stack

```bash
# Terminal 1: Backend (from workspace root)
bash start_servers.sh

# Terminal 2: Frontend (from ./front)
npm run dev
```

Frontend runs on `http://localhost:5173` (Vite default).
Master API defaults to `http://localhost:8000/api/master`.

### Testing Login Flow

1. **Super-admin**: Email with "temucosoft" domain routes to Master API
2. **Regular user**: Logs in with plan selection, routes to plan-specific API
3. Check `/token-refresh` endpoints for token expiry handling

### Common Django Commands

```bash
# Inside service directory (e.g., services/master/proyecto_master/)
python manage.py runserver 0.0.0.0:8000      # Manual start
python manage.py makemigrations              # Track model changes
python manage.py migrate                     # Apply migrations
python manage.py createsuperuser             # Create admin user
```

---

## ⚙️ Project Conventions

### File Naming

- **React Components**: PascalCase (e.g., `Dashboard.jsx`, `Products.jsx`)
- **Pages/Routes**: PascalCase in `/Pages` directories
- **CSS**: Companion `.css` file (e.g., `Dashboard.jsx` + `Dashboard.css`)
- **Python Models**: CamelCase class names (e.g., `Usuario`, `Producto`)

### Frontend Patterns

- **React Router v7** with nested routing (`admin-cliente/Router.jsx` defines all client routes)
- **Context API** for global state (AuthContext, UserContext)
- **Axios** with interceptors for API abstraction
- **Lucide-react** for icons, **Recharts** for dashboards

### Environment Variables

Frontend expects (in `.env`):

```
VITE_API_MASTER_URL=http://localhost:8000/api/master
VITE_API_BASICO_URL=http://localhost:8001/api
VITE_API_ESTANDAR_URL=http://localhost:8002/api
VITE_API_PREMIUM_URL=http://localhost:8003/api
```

---

## 🔗 Integration Points & Data Flow

### Login to Dashboard Flow

1. User submits login on `core/pages/Login/Login`
2. **AuthContext** calls Master API `/login` endpoint → gets token + user data
3. Stores token + plan info in localStorage
4. API interceptor reconfigures baseURL based on plan
5. Router evaluates plan modules and renders enabled pages

### Adding New Modules

1. Create page component in `admin-cliente/Pages/{ModuleName}/`
2. Add route to `admin-cliente/Router.jsx`
3. Add module name to `PLAN_CONFIG` in `AuthContext.jsx`
4. Wrap route with `<ProtectedRoute>` if plan-specific

### Adding Django Endpoints

1. Define model in service's `gestion/models.py`
2. Create serializer in `gestion/serializers.py`
3. Create ViewSet in `gestion/views.py`
4. Register in `gestion/urls.py` with SimpleRouter

---

## 🛠️ Validation & Error Handling

### Django Validation Utilities

Located in `services/{plan}/proyecto_{plan}/gestion/utils.py`:

- `validar_rut()` → Chilean RUT format
- `validar_precio_positivo()` → Non-negative integers
- `validar_telefono_chileno()` → Chilean phone format
- `validar_cantidad_item()` → Positive item quantities
- `validar_fecha_no_futura()` → No future dates

**Pattern**: Apply validators to model fields: `models.CharField(..., validators=[validar_rut])`

---

## ⚠️ Common Gotchas

1. **API URL Mismatch**: Ensure `.env` variables match running server ports (check `start_servers.sh`)
2. **Tenant Isolation**: Always filter queries by `empresa_id` (no FK constraints across tenants)
3. **Token Expiry**: Check AuthContext for refresh logic; expired tokens redirect to login
4. **Module Visibility**: Pages not in PLAN_CONFIG won't render (even if route exists)
5. **Database Per Plan**: Each plan has isolated PostgreSQL - migrations run separately

---

## 📚 Quick Reference: Key Files

| Purpose           | File                                                                    |
| ----------------- | ----------------------------------------------------------------------- |
| Main routing      | `front/src/App.jsx`                                                     |
| Client routes     | `front/src/admin-cliente/Router.jsx`                                    |
| Auth state        | `front/src/admin-cliente/config/AuthContext.jsx`                        |
| API config        | `front/src/admin-cliente/config/api.js`                                 |
| Start all servers | `start_servers.sh`                                                      |
| Master models     | `temucosoft-backend/services/master/proyecto_master/empresas/models.py` |
| Shared validators | `temucosoft-backend/services/{plan}/proyecto_{plan}/gestion/utils.py`   |
