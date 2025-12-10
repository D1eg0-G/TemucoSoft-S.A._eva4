# Diagrama Modelo Entidad-Relación (MER) - TemucoSoft ERP

## Arquitectura de Base de Datos Multi-Tenant

El sistema utiliza **4 bases de datos independientes**:

1. **Master DB** (Puerto 8000) - Gestión del SaaS
2. **Básico DB** (Puerto 8001) - Clientes con plan básico
3. **Estándar DB** (Puerto 8002) - Clientes con plan estándar
4. **Premium DB** (Puerto 8003) - Clientes con plan premium

---

## 📊 MASTER DATABASE (Django Auth + Multi-tenant Management)

### Tablas Core del SaaS

```
┌─────────────────────────────┐
│      auth_user (Django)     │
├─────────────────────────────┤
│ • id (PK)                   │
│ • username (unique)         │
│ • email                     │
│ • password                  │
│ • first_name               │
│ • last_name                │
│ • is_active                │
│ • is_staff                 │
│ • is_superuser             │
│ • date_joined              │
└─────────────────────────────┘
              │
              │ 1:1
              ▼
┌─────────────────────────────┐
│      UsuarioAdmin           │
├─────────────────────────────┤
│ • id (PK)                   │
│ • user_id (FK → auth_user) │
│ • empresa_id (FK → Empresa)│
│ • role (admin_cliente,     │
│         super_admin)        │
│ • activo                    │
│ • fecha_creacion           │
└─────────────────────────────┘
```

### Gestión de Empresas y Planes

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│          Plan               │         │         Empresa             │
├─────────────────────────────┤         ├─────────────────────────────┤
│ • id (PK)                   │         │ • id (PK)                   │
│ • nombre (basico,           │         │ • nombre                    │
│           estandar,         │◄────┐   │ • rut (unique, validado)   │
│           premium)          │     │   │ • email                     │
│ • precio_mensual           │     │   │ • telefono (validado)      │
│ • max_sucursales           │     │   │ • direccion                │
│ • max_usuarios             │     │   │ • fecha_registro           │
│ • modulos_json             │     │   │ • activo                   │
│ • host_base_url            │     │   │ • tenant_token (UUID)      │
└─────────────────────────────┘     │   │ • db_host, db_name,        │
                                    │   │   db_user, db_password     │
                                    │   └─────────────────────────────┘
                                    │                │
                                    │                │ 1:1
                                    │                ▼
                                    │   ┌─────────────────────────────┐
                                    └───┤       Suscripcion           │
                                        ├─────────────────────────────┤
                                        │ • id (PK)                   │
                                        │ • empresa_id (FK, unique)  │
                                        │ • plan_id (FK → Plan)      │
                                        │ • fecha_inicio             │
                                        │ • fecha_fin                │
                                        │ • estado (activa,          │
                                        │          suspendida,       │
                                        │          cancelada)        │
                                        │ • activo                   │
                                        │ • ec2_instance             │
                                        └─────────────────────────────┘
```

### Facturación

```
┌─────────────────────────────┐
│         Empresa             │
└─────────────────────────────┘
              │
              │ 1:N
              ▼
┌─────────────────────────────┐
│       Facturacion           │
├─────────────────────────────┤
│ • id (PK)                   │
│ • empresa_id (FK → Empresa)│
│ • monto (validado > 0)     │
│ • fecha_pago               │
│ • estado (pagado, etc.)    │
└─────────────────────────────┘
```

---

## 📦 PLAN BÁSICO DATABASE (5 módulos)

### Gestión de Usuarios y Sucursales

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│         Usuario             │         │        Sucursal             │
├─────────────────────────────┤         ├─────────────────────────────┤
│ • id (PK)                   │    ┌────┤ • id (PK)                   │
│ • username (unique)         │    │    │ • nombre                    │
│ • email                     │    │    │ • direccion                │
│ • password (hashed)         │    │    │ • telefono (validado)      │
│ • first_name               │    │    │ • email                     │
│ • last_name                │    │    │ • latitud, longitud        │
│ • role (admin_cliente,     │    │    │ • activo                   │
│         vendedor)           │    │    │ • empresa_id               │
│ • rut (validado)           │    │    └─────────────────────────────┘
│ • empresa_id               │    │                 │
│ • activo                   │    │                 │
└─────────────────────────────┘    │                 │
              │                    │                 │
              └────────────────────┘                 │
                                                     │
```

### Productos, Categorías e Inventario

```
┌─────────────────────────────┐
│        Categoria            │
├─────────────────────────────┤
│ • id (PK)                   │
│ • nombre                    │
│ • descripcion              │
│ • empresa_id               │
└─────────────────────────────┘
              │
              │ 1:N
              ▼
┌─────────────────────────────┐
│        Producto             │
├─────────────────────────────┤
│ • id (PK)                   │
│ • codigo (unique)           │
│ • nombre                    │
│ • descripcion              │
│ • precio (validado > 0)    │
│ • costo (validado > 0)     │
│ • categoria_id (FK)        │
│ • empresa_id               │
│ • activo                   │
└─────────────────────────────┘
              │
              │ N:M (via Inventario)
              ▼
┌─────────────────────────────┐
│        Inventario           │
├─────────────────────────────┤
│ • id (PK)                   │
│ • producto_id (FK)         │
│ • sucursal_id (FK)         │
│ • stock (validado >= 0)    │
│ • punto_reorden            │
│ • empresa_id               │
└─────────────────────────────┘
```

### Ventas y Caja

```
┌─────────────────────────────┐
│          Caja               │
├─────────────────────────────┤
│ • id (PK)                   │
│ • usuario_id (FK → Usuario)│
│ • sucursal_id (FK)         │
│ • monto_inicial (>= 0)     │
│ • monto_cierre             │
│ • fecha_apertura           │
│ • fecha_cierre             │
│ • estado (abierta,         │
│          cerrada)          │
│ • empresa_id               │
└─────────────────────────────┘
              │
              │ 1:N
              ▼
┌─────────────────────────────┐
│      MovimientoCaja         │
├─────────────────────────────┤
│ • id (PK)                   │
│ • caja_id (FK → Caja)      │
│ • tipo (entrada, salida)   │
│ • monto (validado)         │
│ • descripcion              │
│ • fecha                    │
│ • empresa_id               │
└─────────────────────────────┘

┌─────────────────────────────┐
│          Venta              │
├─────────────────────────────┤
│ • id (PK)                   │
│ • usuario_id (FK → Usuario)│
│ • sucursal_id (FK)         │
│ • caja_id (FK → Caja)      │
│ • total (validado > 0)     │
│ • metodo_pago (efectivo,   │
│               tarjeta,      │
│               transferencia)│
│ • fecha                    │
│ • empresa_id               │
└─────────────────────────────┘
              │
              │ 1:N
              ▼
┌─────────────────────────────┐
│        VentaItem            │
├─────────────────────────────┤
│ • id (PK)                   │
│ • venta_id (FK → Venta)    │
│ • producto_id (FK)         │
│ • cantidad (validada > 0)  │
│ • precio_unitario (> 0)    │
│ • empresa_id               │
└─────────────────────────────┘
```

---

## 📈 PLAN ESTÁNDAR DATABASE (Básico + 5 módulos adicionales)

Incluye todas las tablas del plan Básico MÁS:

### Gestión de Proveedores y Compras

```
┌─────────────────────────────┐
│        Proveedor            │
├─────────────────────────────┤
│ • id (PK)                   │
│ • nombre                    │
│ • rut (validado)           │
│ • email                     │
│ • telefono (validado)      │
│ • direccion                │
│ • contacto                 │
│ • activo                   │
│ • empresa_id               │
└─────────────────────────────┘
              │
              │ 1:N
              ▼
┌─────────────────────────────┐
│          Compra             │
├─────────────────────────────┤
│ • id (PK)                   │
│ • proveedor_id (FK)        │
│ • sucursal_id (FK)         │
│ • fecha_compra             │
│ • total (validado > 0)     │
│ • estado (pendiente,       │
│          recibido,         │
│          cancelado)        │
│ • empresa_id               │
└─────────────────────────────┘
              │
              │ 1:N
              ▼
┌─────────────────────────────┐
│        CompraItem           │
├─────────────────────────────┤
│ • id (PK)                   │
│ • compra_id (FK → Compra)  │
│ • producto_id (FK)         │
│ • cantidad (validada > 0)  │
│ • precio_unitario (> 0)    │
│ • empresa_id               │
└─────────────────────────────┘
```

### Pedidos Internos entre Sucursales

```
┌─────────────────────────────┐
│      PedidoInterno          │
├─────────────────────────────┤
│ • id (PK)                   │
│ • sucursal_origen_id (FK)  │
│ • sucursal_destino_id (FK) │
│ • producto_id (FK)         │
│ • cantidad (validada > 0)  │
│ • estado (pendiente,       │
│          aprobado,         │
│          rechazado,        │
│          enviado,          │
│          recibido)         │
│ • fecha_solicitud          │
│ • fecha_respuesta          │
│ • empresa_id               │
└─────────────────────────────┘
```

### Movimientos de Inventario (Historial)

```
┌─────────────────────────────┐
│   MovimientoInventario      │
├─────────────────────────────┤
│ • id (PK)                   │
│ • producto_id (FK)         │
│ • sucursal_id (FK)         │
│ • tipo (entrada, salida,   │
│        transferencia,      │
│        ajuste)             │
│ • cantidad (validada)      │
│ • motivo                   │
│ • usuario_id (FK)          │
│ • fecha                    │
│ • empresa_id               │
└─────────────────────────────┘
```

### Permiso Adicional: Rol Gerente

```
┌─────────────────────────────┐
│         Usuario             │
├─────────────────────────────┤
│ • role (admin_cliente,     │
│         gerente,  ← NUEVO  │
│         vendedor)          │
└─────────────────────────────┘
```

---

## 🚀 PLAN PREMIUM DATABASE (Estándar + E-commerce)

Incluye todas las tablas de Básico y Estándar MÁS:

### Clientes Finales (E-commerce)

```
┌─────────────────────────────┐
│       ClienteFinal          │
├─────────────────────────────┤
│ • id (PK)                   │
│ • nombre                    │
│ • apellido                 │
│ • email (unique)           │
│ • telefono (validado)      │
│ • rut (validado)           │
│ • direccion                │
│ • fecha_registro           │
│ • empresa_id               │
└─────────────────────────────┘
```

### Sistema de Carrito

```
┌─────────────────────────────┐
│         Carrito             │
├─────────────────────────────┤
│ • id (PK)                   │
│ • cliente_id (FK → Cliente │
│              Final, null)   │
│ • session_id (para guest)  │
│ • creado                   │
│ • empresa_id               │
└─────────────────────────────┘
              │
              │ 1:N
              ▼
┌─────────────────────────────┐
│       CarritoItem           │
├─────────────────────────────┤
│ • id (PK)                   │
│ • carrito_id (FK)          │
│ • producto_id (FK)         │
│ • cantidad (validada > 0)  │
└─────────────────────────────┘
```

### Órdenes de E-commerce

```
┌─────────────────────────────┐
│      OrdenEcommerce         │
├─────────────────────────────┤
│ • id (PK)                   │
│ • cliente_id (FK → Cliente │
│              Final, null)   │
│ • total (validado > 0)     │
│ • estado (pendiente,       │
│          confirmado,       │
│          enviado,          │
│          entregado,        │
│          cancelado)        │
│ • fecha                    │
│ • empresa_id               │
└─────────────────────────────┘
              │
              │ 1:N
              ▼
┌─────────────────────────────┐
│        OrdenItem            │
├─────────────────────────────┤
│ • id (PK)                   │
│ • orden_id (FK → Orden     │
│            Ecommerce)       │
│ • producto_id (FK)         │
│ • cantidad (validada > 0)  │
│ • precio_unitario (> 0)    │
└─────────────────────────────┘
```

### API Integraciones

```
┌─────────────────────────────┐
│         ApiToken            │
├─────────────────────────────┤
│ • id (PK)                   │
│ • usuario_id               │
│ • token (UUID)             │
│ • activo                   │
│ • expira                   │
│ • empresa_id               │
└─────────────────────────────┘

┌─────────────────────────────┐
│          LogApi             │
├─────────────────────────────┤
│ • id (PK)                   │
│ • usuario_id               │
│ • endpoint                 │
│ • metodo (GET, POST, etc.) │
│ • fecha                    │
│ • ip                       │
│ • empresa_id               │
└─────────────────────────────┘
```

---

## 🔐 Validaciones Implementadas

### Validadores Chilenos Custom

```python
# En todos los servicios: gestion/utils.py

✅ validar_rut()
   → Formato: 12.345.678-9
   → Dígito verificador válido

✅ validar_precio_positivo()
   → Valores >= 0

✅ validar_cantidad_item()
   → Valores > 0

✅ validar_telefono_chileno()
   → Formato: +569 12345678 o 912345678

✅ validar_fecha_no_futura()
   → Fecha <= hoy
```

---

## 🔗 Relaciones Entre Bases de Datos

### Aislamiento por `empresa_id`

**IMPORTANTE**: Los modelos en las bases de datos de planes (Básico/Estándar/Premium) usan `empresa_id` como **campo de filtrado**, NO como Foreign Key real. Esto permite:

- Aislamiento total entre tenants
- Migración independiente de cada base de datos
- Escalabilidad horizontal por plan

```python
# Ejemplo de filtrado multi-tenant en ViewSets:
def get_queryset(self):
    empresa_id = getattr(self.request.user, 'empresa_id', None)
    return super().get_queryset().filter(empresa_id=empresa_id)
```

### Routing de Login

```
1. Usuario ingresa email + password
2. Master API valida y busca empresa
3. Master consulta tabla Suscripcion → Plan
4. Master retorna instance_url según plan:
   - basico   → http://localhost:8001/api/basico
   - estandar → http://localhost:8002/api/medio
   - premium  → http://localhost:8003/api/premium
5. Frontend reconfigura Axios baseURL
6. Todas las peticiones posteriores van al servicio correcto
```

---

## 📝 Normalización de Tablas

### Formas Normales Aplicadas

#### 1FN (Primera Forma Normal)

✅ Todos los campos son atómicos (no hay campos multivalor)
✅ Cada tabla tiene clave primaria (PK)

#### 2FN (Segunda Forma Normal)

✅ No hay dependencias parciales de la clave
✅ Atributos no clave dependen de toda la PK

#### 3FN (Tercera Forma Normal)

✅ No hay dependencias transitivas
✅ Ejemplo: `Suscripcion` tiene `plan_id` → Plan tiene `precio_mensual`

- No se duplica `precio_mensual` en Suscripcion

### Casos de Desnormalización Intencional

❌ **`empresa_id` en todas las tablas de planes**

- **Motivo**: Multi-tenancy sin FK reales
- **Trade-off**: Duplicación controlada vs. aislamiento garantizado

❌ **`precio_unitario` en VentaItem/OrdenItem**

- **Motivo**: Histórico de precios (Producto.precio puede cambiar)
- **Trade-off**: Duplicación vs. integridad histórica

---

## 🔄 Nuevos Endpoints Custom Implementados

### Master API

```
POST /api/master/empresas/{id}/subscribe/
→ Crear/actualizar suscripción de empresa a un plan
Body: {
  "plan_id": 1,
  "fecha_inicio": "2025-01-01",
  "fecha_fin": "2025-12-31"
}
```

### Servicios Básico/Estándar/Premium

```
POST /api/{service}/inventario/{id}/adjust/
→ Ajustar stock manualmente
Body: {
  "cantidad": 10,
  "tipo": "entrada|salida",
  "motivo": "Ajuste por inventario físico"
}
```

### Servicio Premium

```
POST /api/premium/carrito/{id}/add/
→ Agregar producto al carrito
Body: {
  "producto_id": 1,
  "cantidad": 2
}

POST /api/premium/carrito/{id}/checkout/
→ Procesar checkout y crear orden
Body: {
  "cliente_id": 1,
  "direccion_envio": "Calle 123, Temuco",
  "metodo_pago": "tarjeta"
}
```

---

## 📊 Estadísticas del Modelo

| Base de Datos | Tablas | Validadores | FK Reales | Campos empresa_id |
| ------------- | ------ | ----------- | --------- | ----------------- |
| Master        | 5      | 3           | 6         | 0                 |
| Básico        | 10     | 5           | 15        | 10                |
| Estándar      | 15     | 5           | 22        | 15                |
| Premium       | 21     | 5           | 30        | 21                |

**Total**: 51 tablas | 18 validadores custom | 73 relaciones FK

---

## 🎯 Resumen de Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│                   MASTER DATABASE                        │
│  (Gestión SaaS: Empresas, Planes, Suscripciones)        │
└────────────┬─────────────────┬─────────────────┬─────────┘
             │                 │                 │
    ┌────────▼────────┐ ┌─────▼──────┐ ┌───────▼────────┐
    │   BÁSICO DB     │ │ ESTÁNDAR DB│ │   PREMIUM DB   │
    │   (5 módulos)   │ │ (10 módulos)│ │  (12 módulos)  │
    │  Puerto 8001    │ │ Puerto 8002 │ │  Puerto 8003   │
    └─────────────────┘ └─────────────┘ └────────────────┘
         empresa_id         empresa_id        empresa_id
       (Filtro, no FK)   (Filtro, no FK)  (Filtro, no FK)
```

**Ventajas**:

- ✅ Escalabilidad horizontal por plan
- ✅ Aislamiento total de datos entre clientes
- ✅ Migración independiente de cada base de datos
- ✅ Performance: queries más rápidas (menos datos por DB)

**Desventajas**:

- ❌ Reportes consolidados requieren múltiples queries
- ❌ Migración de cliente entre planes es compleja
