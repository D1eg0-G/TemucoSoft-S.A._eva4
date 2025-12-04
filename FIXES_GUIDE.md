# 🔧 Guía de Fixes para Auditoría TemucoSoft

## Fix #1: Filtrar QuerySets por empresa_id

### ❌ ANTES (Inseguro)

**services/basico/proyecto_basico/gestion/views.py**

```python
from rest_framework import viewsets
from .models import Categoria, Producto, Venta, Caja, Sucursal, Usuario, Inventario
from .serializers import CategoriaSerializer, ProductoSerializer, VentaSerializer, CajaSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()  # ❌ SIN FILTRAR
    serializer_class = CategoriaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()  # ❌ SIN FILTRAR
    serializer_class = ProductoSerializer

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()  # ❌ SIN FILTRAR
    serializer_class = VentaSerializer
```

### ✅ DESPUÉS (Seguro)

```python
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Categoria, Producto, Venta, Caja, Sucursal, Usuario, Inventario
from .serializers import CategoriaSerializer, ProductoSerializer, VentaSerializer, CajaSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar por empresa_id del usuario autenticado"""
        empresa_id = self.request.user.empresa_id
        return Categoria.objects.filter(empresa_id=empresa_id)

class ProductoViewSet(viewsets.ModelViewSet):
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar por empresa_id del usuario autenticado"""
        empresa_id = self.request.user.empresa_id
        return Producto.objects.filter(empresa_id=empresa_id)

class VentaViewSet(viewsets.ModelViewSet):
    serializer_class = VentaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar por empresa_id del usuario autenticado"""
        empresa_id = self.request.user.empresa_id
        return Venta.objects.filter(empresa_id=empresa_id)

class CajaViewSet(viewsets.ModelViewSet):
    serializer_class = CajaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar por empresa_id del usuario autenticado"""
        empresa_id = self.request.user.empresa_id
        return Caja.objects.filter(empresa_id=empresa_id)

class SucursalViewSet(viewsets.ModelViewSet):
    serializer_class = SucursalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        empresa_id = self.request.user.empresa_id
        return Sucursal.objects.filter(empresa_id=empresa_id)

class InventarioViewSet(viewsets.ModelViewSet):
    serializer_class = InventarioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        empresa_id = self.request.user.empresa_id
        return Inventario.objects.filter(empresa_id=empresa_id)
```

---

## Fix #2: Validar empresa_id en Creación

### ❌ ANTES

```python
class ProductoViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        serializer.save()  # ❌ Permite any empresa_id
```

### ✅ DESPUÉS

```python
class ProductoViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        # Asignar empresa_id del usuario autenticado
        serializer.save(empresa_id=self.request.user.empresa_id)

    def perform_update(self, serializer):
        # Validar que no intente cambiar empresa_id
        if 'empresa_id' in serializer.validated_data:
            if serializer.validated_data['empresa_id'] != self.request.user.empresa_id:
                raise ValidationError("No puedes cambiar la empresa de un registro")
        serializer.save()
```

**Aplicar a**: CategoriaViewSet, ProductoViewSet, VentaViewSet, CajaViewSet, SucursalViewSet, InventarioViewSet

---

## Fix #3: Extraer SECRET_KEY a .env

### ❌ ANTES (services/basico/proyecto_basico/proyecto_basico/settings.py)

```python
SECRET_KEY = 'django-insecure-x&^nl(@^c&czw$su-071#r-+u!jct$bn3ze2mluiyvb*o0_1z+'
DEBUG = True
ALLOWED_HOSTS = []
```

### ✅ DESPUÉS

```python
import os
from pathlib import Path

# Variables de entorno
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-only-for-development')
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
```

### 📝 Crear `.env.example` en cada servicio

```bash
# services/basico/.env.example
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,tu-dominio.com
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://tu-dominio.com
```

### 📝 Crear `.env` local (git-ignored)

```bash
# services/basico/.env (NO COMMITEAR)
SECRET_KEY=django-insecure-dev-key-xyz-123
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### 📝 Actualizar .gitignore

```bash
# .gitignore
*.env
!.env.example
```

---

## Fix #4: Agregar Permisos a Endpoints Master

### ❌ ANTES (services/master/proyecto_master/empresas/views.py)

```python
class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()  # ❌ Sin protección
    serializer_class = EmpresaSerializer
```

### ✅ DESPUÉS

```python
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, BasePermission
from .models import Empresa
from .serializers import EmpresaSerializer

class IsSuperAdmin(BasePermission):
    """Solo super-admin puede acceder"""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                (request.user.email.endswith('temucosoft.cl') or
                 request.user.role == 'super-admin'))

class IsOwnEmpresa(BasePermission):
    """El usuario solo puede ver su propia empresa"""
    def has_object_permission(self, request, view, obj):
        return (request.user.role == 'super-admin' or
                obj.admin_user == request.user)

class EmpresaViewSet(viewsets.ModelViewSet):
    serializer_class = EmpresaSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.email.endswith('temucosoft.cl') or user.role == 'super-admin':
            return Empresa.objects.all()  # Super-admin ve todo
        return Empresa.objects.filter(admin_user=user)  # Admin cliente ve solo la suya
```

---

## Fix #5: Corregir .env Plan Routes

### ❌ ANTES

```dotenv
VITE_API_MASTER_URL=http://localhost:8000
VITE_API_BASICO_URL=http://localhost:8001/api/basico
VITE_API_ESTANDAR_URL=http://localhost:8002/api/medio      ← ¡INCORRECTO!
VITE_API_PREMIUM_URL=http://localhost:8003/api/premium
```

### ✅ DESPUÉS

```dotenv
VITE_API_MASTER_URL=http://localhost:8000
VITE_API_BASICO_URL=http://localhost:8001/api/basico
VITE_API_ESTANDAR_URL=http://localhost:8002/api/medio      ← ¿O api/estandar?
VITE_API_PREMIUM_URL=http://localhost:8003/api/premium
```

**Verificar con backend**: ¿Usa `/api/medio` o `/api/estandar`?

---

## Fix #6: Habilitar Token Rotation

### ❌ ANTES (settings.py)

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,  # ❌ Sin rotación
    'BLACKLIST_AFTER_ROTATION': False,
}
```

### ✅ DESPUÉS

```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Más corto
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,  # ✓ Rotar cada uso
    'BLACKLIST_AFTER_ROTATION': True,  # ✓ Blacklist el anterior
    'AUTH_HEADER_TYPES': ('Bearer',),
    'SIGNING_KEY': None,  # Usa SECRET_KEY
}
```

---

## Fix #7: Agregar Proxy en Vite

### ❌ ANTES (vite.config.js)

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

### ✅ DESPUÉS

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy para desarrollo - evita CORS
      "/api/basico": {
        target: "http://localhost:8001",
        changeOrigin: true,
      },
      "/api/medio": {
        target: "http://localhost:8002",
        changeOrigin: true,
      },
      "/api/premium": {
        target: "http://localhost:8003",
        changeOrigin: true,
      },
      "/api/master": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
```

---

## Fix #8: Optimizar AuthContext con useMemo

### ❌ ANTES (AuthContext.jsx)

```javascript
const login = async (email, password) => {
  // ... código de login
  localStorage.setItem("user", JSON.stringify(userData));
  // Se ejecuta cada renderizado
};

const hasModule = (moduleName) => {
  // Se ejecuta cada verificación
  if (!plan || !plan.modulos) return false;
  return plan.modulos.includes(moduleName);
};
```

### ✅ DESPUÉS

```javascript
import { useCallback, useMemo } from "react";

const login = useCallback(async (email, password) => {
  // ... código de login
  localStorage.setItem("user", JSON.stringify(userData));
}, []); // ✓ Memoizado

const hasModule = useCallback(
  (moduleName) => {
    // ✓ Memoizado
    if (!plan || !plan.modulos) return false;
    if (plan.modulos.includes("all")) return true;
    return plan.modulos.includes(moduleName);
  },
  [plan]
);

// En el return del Provider
const contextValue = useMemo(
  () => ({
    user,
    plan,
    apiUrl,
    loading,
    login,
    logout,
    hasModule,
  }),
  [user, plan, apiUrl, loading, login, logout, hasModule]
);

return (
  <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
);
```

---

## 📋 Testing Checklist

Después de implementar cada fix, validar:

```bash
# Fix #1-2: Aislamiento Multitenancy
[ ] Usuario A no ve datos de Usuario B
[ ] Usuario A no puede listar productos de empresa B
[ ] Intentar acceder a /api/basico/productos/999 de otra empresa retorna 404

# Fix #3: Variables de Entorno
[ ] SECRET_KEY está en .env
[ ] DEBUG=False en .env.example
[ ] El servidor arranca sin errores

# Fix #4: Permisos Master
[ ] Super-admin ve todas las empresas
[ ] Admin cliente solo ve su empresa
[ ] Usuarios no-autenticados no ven nada

# Fix #5: Plan Routes
[ ] Login con plan Estándar conecta a URL correcta
[ ] API URLs correctas en localStorage

# Fix #6: Token Rotation
[ ] Access token expira en 15 minutos
[ ] Refresh token funciona
[ ] Refresh token rota en cada uso

# Fix #7: Vite Proxy
[ ] npm run dev no tiene errores CORS
[ ] Requests van a http://localhost:PORT

# Fix #8: Performance
[ ] AuthContext no re-renderiza innecesariamente
[ ] hasModule() es rápido con 1000 módulos
```

---

## Orden de Implementación Recomendado

1. **Fix #3** (15 min): Extraer SECRET_KEY - NO requiere funcionalidad nueva
2. **Fix #1-2** (2 hrs): Filtros por empresa_id - CRÍTICO de seguridad
3. **Fix #4** (1 hr): Permisos en Master - CRÍTICO de seguridad
4. **Fix #5** (5 min): Corregir .env - Rápido
5. **Fix #6** (30 min): Token rotation - Security hardening
6. **Fix #7** (20 min): Vite proxy - DX improvement
7. **Fix #8** (1 hr): Optimización React - Performance

**Tiempo total**: ~5 horas
