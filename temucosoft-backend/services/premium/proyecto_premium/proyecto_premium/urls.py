from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from gestion.auth_views import SyncTokenObtainPairView

# Importamos TODAS las vistas que creamos en gestion/views.py
from gestion.views import (
    CategoriaViewSet, UsuarioViewSet, SucursalViewSet, ProductoViewSet, InventarioViewSet,
    CajaViewSet, MovimientoCajaViewSet, VentaViewSet, ProveedorViewSet, CompraViewSet,
    PedidoInternoViewSet, MovimientoInventarioViewSet,
    ClienteFinalViewSet, OrdenEcommerceViewSet, CarritoViewSet,
    ApiTokenViewSet, LogApiViewSet, ReportesViewSet
)

# 1. Configuración del Router (Tus endpoints de negocio)
router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'sucursales', SucursalViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'inventario', InventarioViewSet)
router.register(r'cajas', CajaViewSet)
router.register(r'movimientos-caja', MovimientoCajaViewSet)
router.register(r'ventas', VentaViewSet)
router.register(r'proveedores', ProveedorViewSet)
router.register(r'compras', CompraViewSet)
router.register(r'pedidos-internos', PedidoInternoViewSet)
router.register(r'movimientos', MovimientoInventarioViewSet)

# Exclusivos Premium
router.register(r'clientes-finales', ClienteFinalViewSet)
router.register(r'ordenes-web', OrdenEcommerceViewSet)
router.register(r'carrito', CarritoViewSet)
router.register(r'api-tokens', ApiTokenViewSet)
router.register(r'logs-api', LogApiViewSet)

# Reportes
router.register(r'reportes', ReportesViewSet, basename='reportes')

# 2. URL Patterns (Rutas finales)
urlpatterns = [
    path('admin/', admin.site.urls),

    # A. Rutas de Autenticación (JWT)
    path('api/token/', SyncTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # B. Rutas de la API de Negocio (El router incluye todo lo de arriba)
    path('api/premium/', include(router.urls)),
]