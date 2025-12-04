# 🚨 Quick Reference: Auditoría TemucoSoft

## Estado del Proyecto: 🔴 CRÍTICO

**4 problemas de seguridad crítica encontrados. Requieren fix inmediato.**

---

## 🔴 TOP 4 PROBLEMAS CRÍTICOS

### 1️⃣ Fuga de Datos Multitenancy

```
RIESGO: Usuario A ve datos de Usuario B
UBICACIÓN: services/*/gestion/views.py
SOLUCIÓN: Agregar get_queryset() con filtro empresa_id
TIEMPO: 2 horas
```

### 2️⃣ Creación sin Validación de Empresa

```
RIESGO: Usuario crea datos en empresa que no es la suya
UBICACIÓN: services/*/gestion/views.py (perform_create)
SOLUCIÓN: Asignar empresa_id=request.user.empresa_id
TIEMPO: 1 hora
```

### 3️⃣ SECRET KEYS en Repositorio

```
RIESGO: Claves de encriptación expuestas en GitHub
UBICACIÓN: services/*/proyecto_*/settings.py (4 archivos)
SOLUCIÓN: Mover a .env usando decouple
TIEMPO: 30 minutos
```

### 4️⃣ Endpoints Master Sin Protección

```
RIESGO: Cualquiera puede ver todas las empresas
UBICACIÓN: services/master/empresas/views.py
SOLUCIÓN: Agregar permisos personalizados
TIEMPO: 1 hora
```

**TOTAL CRÍTICA: 4.5 horas**

---

## 🟡 4 PROBLEMAS MODERADOS

| #   | Problema                        | Ubicación         | Tiempo |
| --- | ------------------------------- | ----------------- | ------ |
| 5   | Inconsistencia .env PLAN ROUTES | `front/.env`      | 5 min  |
| 6   | Falta caché AuthContext         | `AuthContext.jsx` | 1 hr   |
| 7   | JWT sin rotación                | `settings.py`     | 30 min |
| 8   | Vite sin proxy                  | `vite.config.js`  | 20 min |

**TOTAL MODERADA: 2 horas**

---

## 📋 IMPLEMENTACIÓN RÁPIDA

### 1. Agregar filtros (2 hrs)

En `services/basico/proyecto_basico/gestion/views.py`:

```python
class ProductoViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Producto.objects.filter(empresa_id=self.request.user.empresa_id)
```

**Aplicar a**: Categoria, Producto, Venta, Caja, Sucursal, Inventario

### 2. Validar empresa_id (1 hr)

En cada ViewSet:

```python
def perform_create(self, serializer):
    serializer.save(empresa_id=self.request.user.empresa_id)
```

### 3. .env file (30 min)

Crear `services/*/proyecto_*/.env`:

```
SECRET_KEY=dev-only-key-xyz
DEBUG=True
ALLOWED_HOSTS=localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Agregar permisos Master (1 hr)

En `services/master/empresas/views.py`:

```python
class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.email.endswith('temucosoft.cl')

class EmpresaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
```

---

## ✅ CHECKLIST DE VALIDACIÓN

```
ANTES DE PUSHEAR:

[ ] Usuario A NO ve datos de empresa B
    → curl -H "Authorization: Bearer TOKEN_A" http://localhost:8001/api/basico/productos/
    → Retorna solo productos de empresa A

[ ] Crear producto SIN empresa_id en body
    → curl -X POST ... -d '{"nombre": "Test"}'
    → Se asigna automáticamente empresa_id del usuario

[ ] SECRET_KEY en archivo .env
    → grep -r "django-insecure" . (no debe encontrar nada)
    → ls -la services/basico/.env (debe existir)

[ ] Super-admin ve todas las empresas
    → curl -H "Authorization: Bearer ADMIN_TOKEN" /api/master/empresas/
    → Retorna 3+ empresas

[ ] Usuario normal solo ve su empresa
    → curl -H "Authorization: Bearer CLIENT_TOKEN" /api/master/empresas/
    → Retorna error 403 o solo su empresa
```

---

## 📊 ESTADÍSTICAS

```
Total Archivos Analizados: 50+
Problemas Encontrados: 8
  - Críticos: 4
  - Moderados: 4

Tiempo Total Remediation: 6.5 horas
  - Fase 1 (HOY): 4.5 hrs
  - Fase 2 (SEMANA): 2 hrs

Archivos a Modificar: 12+
  - services/basico/gestion/views.py
  - services/basico/proyecto_basico/settings.py
  - services/basico/.env (nuevo)
  - services/medio/* (x3)
  - services/premium/* (x3)
  - services/master/empresas/views.py
  - front/.env
  - front/vite.config.js
  - front/src/admin-cliente/config/AuthContext.jsx
```

---

## 🎯 PRIORIDAD: ¿POR DÓNDE EMPIEZO?

### Opción A: RÁPIDO (Solo lo crítico) - 4.5 hrs

1. Filtros por empresa_id ✓
2. Validación en perform_create() ✓
3. SECRET_KEY a .env ✓
4. Permisos en Master ✓

### Opción B: COMPLETO (Con moderados) - 6.5 hrs

1. Todo lo anterior
2. Corregir .env plans
3. Token rotation
4. Vite proxy
5. AuthContext memoization

### Opción C: STAGED (Por semana)

- Semana 1: Críticos (4.5 hrs)
- Semana 2: Moderados (2 hrs)
- Semana 3: Testing (3 hrs)

---

## 🔗 REFERENCIAS RÁPIDAS

📄 **AUDIT_REPORT.md** - Análisis detallado completo
📄 **FIXES_GUIDE.md** - Código antes/después para cada fix
📄 **.github/copilot-instructions.md** - Arquitectura del proyecto

---

## ⚡ COMMANDS ÚTILES

```bash
# Buscar ViewSets SIN filtro
grep -r "queryset = " services/ | grep -v "get_queryset"

# Buscar SECRET hardcodeados
grep -r "django-insecure" services/

# Contar viewsets a arreglar
find services/ -name "views.py" -path "*/gestion/*" | wc -l

# Ver qué servicios existen
ls -la services/*/proyecto_*/gestion/views.py
```

---

## 📞 SOPORTE

- 🤖 **Copilot**: Abre AUDIT_REPORT.md para detalles
- 💬 **Team**: Discutir timeline en daily standup
- 🔍 **QA**: Usar CHECKLIST de validación
- 📝 **Docs**: Actualizar después de cada fix

---

**Última actualización**: 4 de Diciembre de 2025  
**Estado**: 🔴 CRÍTICO - Requiere atención inmediata
