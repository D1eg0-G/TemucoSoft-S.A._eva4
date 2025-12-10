# Documentación API - TemucoSoft ERP

## 📋 Guía de Endpoints

Esta documentación describe todos los endpoints disponibles en el sistema TemucoSoft ERP, organizados por servicio y funcionalidad.

---

## 🔐 Autenticación

Todos los endpoints (excepto login) requieren autenticación JWT.

### Headers Requeridos

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

---

## 🏢 MASTER API (Puerto 8000)

Base URL: `http://localhost:8000/api/master`

### 1. Autenticación

#### Login (Routing Multi-tenant)

```http
POST /api/master/empresas/login-router/
Content-Type: application/json

{
  "email": "admin@empresa.cl",
  "password": "password123"
}
```

**Response Success (Admin Cliente)**:

```json
{
  "empresa_id": 1,
  "empresa_nombre": "Mi Empresa",
  "plan": "basico",
  "instance_url": "http://localhost:8001/api/basico",
  "modulos": {
    "dashboard": true,
    "products": true,
    "inventory": true,
    "sale": true,
    "cashregister": true
  }
}
```

**Response Success (Super Admin)**:

```json
{
  "empresa_id": 0,
  "plan": "super-admin",
  "instance_url": "http://localhost:8000/api/master",
  "modulos": ["all"]
}
```

#### Obtener Token JWT

```http
POST /api/master/token/
Content-Type: application/json

{
  "username": "admin@temucosoft.cl",
  "password": "admin123"
}
```

**Response**:

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Refrescar Token

```http
POST /api/master/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 2. Gestión de Empresas

#### Listar Empresas

```http
GET /api/master/empresas/
Authorization: Bearer {token}
```

**Response**:

```json
[
  {
    "id": 1,
    "nombre": "Empresa Demo",
    "rut": "12.345.678-9",
    "email": "contacto@empresa.cl",
    "telefono": "+56912345678",
    "direccion": "Calle Principal 123",
    "activo": true,
    "fecha_registro": "2025-01-01T10:00:00Z",
    "suscripcion": {
      "id": 1,
      "plan": "basico",
      "plan_nombre": "Plan Básico",
      "fecha_inicio": "2025-01-01",
      "fecha_fin": "2025-12-31",
      "estado": "activa",
      "activo": true
    }
  }
]
```

#### Crear Empresa

```http
POST /api/master/empresas/
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Nueva Empresa",
  "rut": "98.765.432-1",
  "email": "nueva@empresa.cl",
  "telefono": "+56987654321",
  "direccion": "Av. Central 456"
}
```

#### Suscribir Empresa a un Plan (NUEVO)

```http
POST /api/master/empresas/{id}/subscribe/
Authorization: Bearer {token}
Content-Type: application/json

{
  "plan_id": 2,
  "fecha_inicio": "2025-01-15",
  "fecha_fin": "2026-01-15"
}
```

**Response**:

```json
{
  "message": "Suscripción creada exitosamente",
  "suscripcion": {
    "id": 5,
    "empresa": 1,
    "empresa_nombre": "Empresa Demo",
    "plan": 2,
    "plan_nombre": "estandar",
    "fecha_inicio": "2025-01-15",
    "fecha_fin": "2026-01-15",
    "estado": "activa",
    "activo": true
  }
}
```

---

### 3. Gestión de Planes

#### Listar Planes

```http
GET /api/master/planes/
Authorization: Bearer {token}
```

**Response**:

```json
[
  {
    "id": 1,
    "nombre": "basico",
    "precio_mensual": 50000,
    "max_sucursales": 1,
    "max_usuarios": 3,
    "modulos_json": {
      "dashboard": true,
      "products": true,
      "inventory": true,
      "sale": true,
      "cashregister": true
    },
    "host_base_url": "http://localhost:8001/api/basico"
  }
]
```

---

### 4. Gestión de Suscripciones

#### Listar Suscripciones

```http
GET /api/master/suscripciones/
Authorization: Bearer {token}
```

#### Crear Suscripción

```http
POST /api/master/suscripciones/
Authorization: Bearer {token}
Content-Type: application/json

{
  "empresa": 1,
  "plan": 2,
  "fecha_inicio": "2025-01-01",
  "fecha_fin": "2025-12-31",
  "estado": "activa"
}
```

---

### 5. Usuarios Admin

#### Listar Admin Clientes

```http
GET /api/master/usuarios-admin/
Authorization: Bearer {token}
```

#### Crear Admin Cliente

```http
POST /api/master/usuarios-admin/
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "admin_empresa",
  "email": "admin@empresa.cl",
  "password": "password123",
  "empresa": 1,
  "role": "admin_cliente"
}
```

---

## 📦 PLAN BÁSICO API (Puerto 8001)

Base URL: `http://localhost:8001/api/basico`

### 1. Gestión de Usuarios

#### Listar Usuarios

```http
GET /api/basico/usuarios/
Authorization: Bearer {token}
```

#### Crear Usuario

```http
POST /api/basico/usuarios/
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "vendedor1",
  "email": "vendedor@empresa.cl",
  "password": "password123",
  "first_name": "Juan",
  "last_name": "Pérez",
  "role": "vendedor",
  "rut": "11.222.333-4"
}
```

**Nota**: El rol `gerente` NO está permitido en plan Básico.

#### Obtener Usuario Actual

```http
GET /api/basico/usuarios/me/
Authorization: Bearer {token}
```

---

### 2. Gestión de Sucursales

#### Listar Sucursales

```http
GET /api/basico/sucursales/
Authorization: Bearer {token}
```

#### Crear Sucursal

```http
POST /api/basico/sucursales/
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Sucursal Centro",
  "direccion": "Calle Principal 123",
  "telefono": "+56912345678",
  "email": "centro@empresa.cl",
  "latitud": "-38.7350",
  "longitud": "-72.5903"
}
```

---

### 3. Gestión de Productos

#### Listar Productos

```http
GET /api/basico/productos/
Authorization: Bearer {token}
```

**Query Parameters**:

- `?search={nombre}` - Búsqueda por nombre
- `?categoria={id}` - Filtrar por categoría
- `?activo={true|false}` - Filtrar por estado

#### Crear Producto

```http
POST /api/basico/productos/
Authorization: Bearer {token}
Content-Type: application/json

{
  "codigo": "PROD-001",
  "nombre": "Producto Demo",
  "descripcion": "Descripción del producto",
  "precio": 10000,
  "costo": 5000,
  "categoria": 1
}
```

#### Obtener Detalle de Producto

```http
GET /api/basico/productos/{id}/
Authorization: Bearer {token}
```

---

### 4. Gestión de Inventario

#### Listar Inventario

```http
GET /api/basico/inventario/
Authorization: Bearer {token}
```

**Query Parameters**:

- `?sucursal={id}` - Filtrar por sucursal
- `?producto={id}` - Filtrar por producto
- `?stock__lt={cantidad}` - Stock menor que

#### Crear Registro de Inventario

```http
POST /api/basico/inventario/
Authorization: Bearer {token}
Content-Type: application/json

{
  "producto": 1,
  "sucursal": 1,
  "stock": 100,
  "punto_reorden": 20
}
```

#### Ajustar Stock (NUEVO)

```http
POST /api/basico/inventario/{id}/adjust/
Authorization: Bearer {token}
Content-Type: application/json

{
  "cantidad": 50,
  "tipo": "entrada",
  "motivo": "Ajuste por inventario físico"
}
```

**Tipos válidos**: `entrada`, `salida`

**Response**:

```json
{
  "message": "Ajuste de inventario realizado: entrada",
  "stock_anterior": 100,
  "cantidad_ajustada": 50,
  "stock_nuevo": 150,
  "motivo": "Ajuste por inventario físico"
}
```

---

### 5. Gestión de Ventas

#### Listar Ventas

```http
GET /api/basico/ventas/
Authorization: Bearer {token}
```

**Query Parameters**:

- `?fecha__gte={fecha}` - Ventas desde fecha
- `?fecha__lte={fecha}` - Ventas hasta fecha
- `?usuario={id}` - Filtrar por vendedor
- `?sucursal={id}` - Filtrar por sucursal

#### Crear Venta

```http
POST /api/basico/ventas/
Authorization: Bearer {token}
Content-Type: application/json

{
  "usuario": 1,
  "sucursal": 1,
  "caja": 1,
  "total": 25000,
  "metodo_pago": "efectivo",
  "items": [
    {
      "producto": 1,
      "cantidad": 2,
      "precio_unitario": 10000
    },
    {
      "producto": 2,
      "cantidad": 1,
      "precio_unitario": 5000
    }
  ]
}
```

**Métodos de pago válidos**: `efectivo`, `tarjeta`, `transferencia`

---

### 6. Gestión de Caja

#### Listar Cajas

```http
GET /api/basico/cajas/
Authorization: Bearer {token}
```

**Query Parameters**:

- `?estado={abierta|cerrada}` - Filtrar por estado
- `?usuario={id}` - Filtrar por usuario
- `?sucursal={id}` - Filtrar por sucursal

#### Abrir Caja

```http
POST /api/basico/cajas/
Authorization: Bearer {token}
Content-Type: application/json

{
  "usuario": 1,
  "sucursal": 1,
  "monto_inicial": 50000
}
```

#### Cerrar Caja

```http
PATCH /api/basico/cajas/{id}/
Authorization: Bearer {token}
Content-Type: application/json

{
  "estado": "cerrada",
  "monto_cierre": 75000
}
```

---

### 7. Categorías

#### Listar Categorías

```http
GET /api/basico/categorias/
Authorization: Bearer {token}
```

#### Crear Categoría

```http
POST /api/basico/categorias/
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Electrónica",
  "descripcion": "Productos electrónicos"
}
```

---

## 📈 PLAN ESTÁNDAR API (Puerto 8002)

Base URL: `http://localhost:8002/api/medio`

**Nota**: Incluye TODOS los endpoints de Básico + los siguientes:

### 1. Gestión de Proveedores

#### Listar Proveedores

```http
GET /api/medio/proveedores/
Authorization: Bearer {token}
```

#### Crear Proveedor

```http
POST /api/medio/proveedores/
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Proveedor Demo",
  "rut": "76.543.210-9",
  "email": "contacto@proveedor.cl",
  "telefono": "+56912345678",
  "direccion": "Av. Industrial 789",
  "contacto": "María González"
}
```

---

### 2. Gestión de Compras

#### Listar Compras

```http
GET /api/medio/compras/
Authorization: Bearer {token}
```

#### Crear Compra

```http
POST /api/medio/compras/
Authorization: Bearer {token}
Content-Type: application/json

{
  "proveedor": 1,
  "sucursal": 1,
  "fecha_compra": "2025-01-15",
  "estado": "pendiente",
  "items": [
    {
      "producto": 1,
      "cantidad": 50,
      "precio_unitario": 4000
    }
  ]
}
```

**Estados válidos**: `pendiente`, `recibido`, `cancelado`

---

### 3. Pedidos Internos

#### Listar Pedidos Internos

```http
GET /api/medio/pedidos-internos/
Authorization: Bearer {token}
```

#### Crear Pedido Interno

```http
POST /api/medio/pedidos-internos/
Authorization: Bearer {token}
Content-Type: application/json

{
  "sucursal_origen": 1,
  "sucursal_destino": 2,
  "producto": 3,
  "cantidad": 20,
  "estado": "pendiente"
}
```

**Estados válidos**: `pendiente`, `aprobado`, `rechazado`, `enviado`, `recibido`

---

### 4. Movimientos de Inventario

#### Listar Movimientos

```http
GET /api/medio/movimientos-inventario/
Authorization: Bearer {token}
```

**Query Parameters**:

- `?tipo={entrada|salida|transferencia|ajuste}` - Filtrar por tipo
- `?producto={id}` - Filtrar por producto
- `?sucursal={id}` - Filtrar por sucursal
- `?fecha__gte={fecha}` - Desde fecha

#### Registrar Movimiento

```http
POST /api/medio/movimientos-inventario/
Authorization: Bearer {token}
Content-Type: application/json

{
  "producto": 1,
  "sucursal": 1,
  "tipo": "entrada",
  "cantidad": 30,
  "motivo": "Recepción de compra",
  "usuario": 2
}
```

---

## 🚀 PLAN PREMIUM API (Puerto 8003)

Base URL: `http://localhost:8003/api/premium`

**Nota**: Incluye TODOS los endpoints de Básico + Estándar + los siguientes:

### 1. Clientes Finales (E-commerce)

#### Listar Clientes

```http
GET /api/premium/clientes-finales/
Authorization: Bearer {token}
```

#### Crear Cliente

```http
POST /api/premium/clientes-finales/
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Cliente",
  "apellido": "Final",
  "email": "cliente@email.com",
  "telefono": "+56987654321",
  "rut": "15.678.901-2",
  "direccion": "Calle Residencial 456"
}
```

---

### 2. Gestión de Carrito

#### Listar Carritos

```http
GET /api/premium/carritos/
Authorization: Bearer {token}
```

#### Crear Carrito

```http
POST /api/premium/carritos/
Authorization: Bearer {token}
Content-Type: application/json

{
  "cliente": 1,
  "session_id": "guest_12345"
}
```

#### Agregar Producto al Carrito (NUEVO)

```http
POST /api/premium/carritos/{id}/add/
Authorization: Bearer {token}
Content-Type: application/json

{
  "producto_id": 5,
  "cantidad": 2
}
```

**Response**:

```json
{
  "message": "Producto agregado al carrito",
  "carrito": {
    "id": 1,
    "cliente": 1,
    "session_id": null,
    "creado": "2025-01-15T10:30:00Z",
    "items": [
      {
        "id": 1,
        "producto_id": 5,
        "cantidad": 2
      }
    ]
  }
}
```

#### Procesar Checkout (NUEVO)

```http
POST /api/premium/carritos/{id}/checkout/
Authorization: Bearer {token}
Content-Type: application/json

{
  "cliente_id": 1,
  "direccion_envio": "Calle Residencial 456, Temuco",
  "metodo_pago": "tarjeta"
}
```

**Response**:

```json
{
  "message": "Checkout realizado exitosamente",
  "orden_id": 10,
  "total": 35000,
  "estado": "pendiente"
}
```

**Validaciones**:

- Carrito no vacío
- Stock suficiente para todos los productos
- Cliente existe (si se proporciona)
- Reduce stock automáticamente
- Limpia carrito después del checkout

---

### 3. Órdenes de E-commerce

#### Listar Órdenes

```http
GET /api/premium/ordenes-ecommerce/
Authorization: Bearer {token}
```

**Query Parameters**:

- `?estado={pendiente|confirmado|enviado|entregado|cancelado}` - Filtrar por estado
- `?cliente={id}` - Filtrar por cliente
- `?fecha__gte={fecha}` - Desde fecha

#### Crear Orden

```http
POST /api/premium/ordenes-ecommerce/
Authorization: Bearer {token}
Content-Type: application/json

{
  "cliente": 1,
  "total": 50000,
  "estado": "pendiente",
  "items": [
    {
      "producto": 1,
      "cantidad": 3,
      "precio_unitario": 15000
    }
  ]
}
```

#### Actualizar Estado de Orden

```http
PATCH /api/premium/ordenes-ecommerce/{id}/
Authorization: Bearer {token}
Content-Type: application/json

{
  "estado": "enviado"
}
```

---

### 4. API Tokens (Integraciones)

#### Listar Tokens

```http
GET /api/premium/api-tokens/
Authorization: Bearer {token}
```

#### Crear Token de API

```http
POST /api/premium/api-tokens/
Authorization: Bearer {token}
Content-Type: application/json

{
  "usuario_id": 1,
  "expira": "2026-01-15T23:59:59Z"
}
```

---

### 5. Logs de API

#### Listar Logs

```http
GET /api/premium/logs-api/
Authorization: Bearer {token}
```

**Query Parameters**:

- `?usuario_id={id}` - Filtrar por usuario
- `?endpoint={path}` - Filtrar por endpoint
- `?metodo={GET|POST|PUT|DELETE}` - Filtrar por método HTTP
- `?fecha__gte={fecha}` - Desde fecha

---

## 🔍 Códigos de Respuesta HTTP

| Código | Significado           | Descripción                    |
| ------ | --------------------- | ------------------------------ |
| 200    | OK                    | Solicitud exitosa              |
| 201    | Created               | Recurso creado exitosamente    |
| 204    | No Content            | Eliminación exitosa            |
| 400    | Bad Request           | Datos inválidos o faltantes    |
| 401    | Unauthorized          | Token inválido o ausente       |
| 403    | Forbidden             | Sin permisos para este recurso |
| 404    | Not Found             | Recurso no encontrado          |
| 500    | Internal Server Error | Error del servidor             |

---

## 📝 Formato de Errores

Todos los errores siguen este formato:

```json
{
  "error": "Descripción del error",
  "detail": "Información adicional (opcional)",
  "field_errors": {
    "campo": ["Error específico del campo"]
  }
}
```

**Ejemplo**:

```json
{
  "error": "Datos inválidos",
  "field_errors": {
    "rut": ["RUT inválido: debe tener formato 12.345.678-9"],
    "precio": ["Precio debe ser mayor a 0"]
  }
}
```

---

## 🧪 Ejemplos con cURL

### Login y Obtención de Token

```bash
# 1. Login Routing
curl -X POST http://localhost:8000/api/master/empresas/login-router/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.cl",
    "password": "password123"
  }'

# 2. Obtener Token JWT
curl -X POST http://localhost:8000/api/master/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@temucosoft.cl",
    "password": "admin123"
  }'
```

### Crear Producto

```bash
curl -X POST http://localhost:8001/api/basico/productos/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "PROD-001",
    "nombre": "Producto Demo",
    "precio": 10000,
    "costo": 5000,
    "categoria": 1
  }'
```

### Ajustar Stock

```bash
curl -X POST http://localhost:8001/api/basico/inventario/1/adjust/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "cantidad": 50,
    "tipo": "entrada",
    "motivo": "Recepción de mercadería"
  }'
```

### Checkout del Carrito

```bash
curl -X POST http://localhost:8003/api/premium/carritos/1/checkout/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "direccion_envio": "Calle Principal 123",
    "metodo_pago": "tarjeta"
  }'
```

---

## 📦 Colección Postman

Para importar esta colección en Postman:

1. Abrir Postman
2. Click en "Import"
3. Seleccionar el archivo `TemucoSoft_API_Collection.json`
4. Configurar variables de entorno:
   - `base_url_master`: `http://localhost:8000/api/master`
   - `base_url_basico`: `http://localhost:8001/api/basico`
   - `base_url_medio`: `http://localhost:8002/api/medio`
   - `base_url_premium`: `http://localhost:8003/api/premium`
   - `access_token`: (se auto-completa después de login)

---

## 🔗 URLs de Referencia

- **Swagger/OpenAPI**: Disponible en cada servicio en `/swagger/`
- **Redoc**: Disponible en cada servicio en `/redoc/`
- **Admin Django**: Disponible en cada servicio en `/admin/`

---

## 💡 Tips para Testing

1. **Orden de Testing**:

   - Login → Obtener token
   - Crear recursos base (categorías, sucursales)
   - Crear productos
   - Crear inventario
   - Realizar operaciones (ventas, compras)

2. **Variables de Entorno en Postman**:

   - Crear variable `{{access_token}}` para reutilizar
   - Usar scripts para auto-extraer tokens de respuestas

3. **Filtros y Búsquedas**:

   - Usar query parameters para filtrado
   - Combinar múltiples filtros con `&`
   - Ejemplo: `/productos/?categoria=1&activo=true&search=laptop`

4. **Paginación**:
   - Por defecto: 100 resultados por página
   - Usar `?page=2` para páginas siguientes
   - Response incluye: `count`, `next`, `previous`, `results`

---

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades, contactar a:

- **Email**: soporte@temucosoft.cl
- **Issues**: GitHub Repository
