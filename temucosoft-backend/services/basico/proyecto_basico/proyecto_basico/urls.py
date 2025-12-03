from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from gestion.views import ProductoViewSet, VentaViewSet, CajaViewSet, SucursalViewSet, UsuarioViewSet, InventarioViewSet, VentaItemViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
router = DefaultRouter()
router.register(r'productos', ProductoViewSet)
router.register(r'ventas', VentaViewSet)
router.register(r'cajas', CajaViewSet)
router.register(r'sucursales', SucursalViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'inventarios', InventarioViewSet)
router.register(r'venta_items', VentaItemViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    # Fíjate que cambiamos el prefijo para diferenciarlo
    path('api/basico/', include(router.urls)),
    # Endpoints para Autenticación JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Login
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Refrescar sesión
]