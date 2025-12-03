from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Empresa, Plan, Facturacion
from .serializers import EmpresaSerializer, PlanSerializer, FacturacionSerializer

# ✅ CAMBIO: ReadOnlyModelViewSet → ModelViewSet
class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    # Permitir operaciones públicas (opcional, puedes cambiar a IsAuthenticated)
    permission_classes = [AllowAny]

class FacturacionViewSet(viewsets.ModelViewSet):
    queryset = Facturacion.objects.all()
    serializer_class = FacturacionSerializer

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer

    @action(detail=False, methods=['post'], url_path='login-router', permission_classes=[AllowAny])
    def login_tenant(self, request):
        email = request.data.get('email', '').lower()
        
        # --- PUERTA VIP: SUPER ADMIN ---
        if 'temucosoft.cl' in email or email == 'admin@super.cl':
            return Response({
                "empresa_id": 0,
                "plan": "super-admin",
                "instance_url": "http://localhost:8000", 
                "modulos": ["all"]
            })

        # --- CLIENTES NORMALES ---
        empresa = Empresa.objects.filter(email_contacto=email).first()
        
        if empresa:
            if not hasattr(empresa, 'suscripcion'):
                return Response({"error": "Empresa sin suscripción asignada"}, status=403)

            return Response({
                "empresa_id": empresa.id,
                "plan": empresa.suscripcion.plan.nombre,
                "instance_url": empresa.suscripcion.plan.host_base_url, 
                "modulos": empresa.suscripcion.plan.modulos_json
            })
        
        return Response({"error": "Credenciales inválidas o empresa no registrada"}, status=404)