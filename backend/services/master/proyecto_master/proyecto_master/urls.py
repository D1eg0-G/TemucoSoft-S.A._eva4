from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from empresas.views import (
    UsuarioAdminViewSet, 
    UsuarioViewSet, 
    EmpresaViewSet, 
    PlanViewSet, 
    SuscripcionViewSet, 
    FacturacionViewSet,
    CustomTokenObtainPairView
)

router = DefaultRouter()
router.register(r'admin-usuarios', UsuarioAdminViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'empresas', EmpresaViewSet)
router.register(r'planes', PlanViewSet)
router.register(r'suscripciones', SuscripcionViewSet)
router.register(r'facturacion', FacturacionViewSet) # Nueva ruta

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/master/', include(router.urls)), # Prefijo importante
    # Endpoints para Autenticación JWT
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), # Login custom
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Refrescar sesión
]