from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from gestion.auth_views import SyncTokenObtainPairView

# 1. IMPORTACIÓN CORREGIDA (Quitamos VentaItemViewSet y CompraItemViewSet)
from gestion.views import (
    CategoriaViewSet, UsuarioViewSet, SucursalViewSet, ProductoViewSet, InventarioViewSet,
    CajaViewSet, MovimientoCajaViewSet, VentaViewSet, ProveedorViewSet, CompraViewSet,
    PedidoInternoViewSet, MovimientoInventarioViewSet, ReportesViewSet
)

# 2. ROUTER CORREGIDO
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
router.register(r'reportes', ReportesViewSet, basename='reportes')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Autenticación JWT
    path('api/token/', SyncTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API Medio
    path('api/medio/', include(router.urls)),
]