from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, authenticate
from .models import UsuarioAdmin, Empresa, Plan, Suscripcion, Facturacion
from .serializers import UsuarioAdminSerializer, UsuarioSerializer, EmpresaSerializer, PlanSerializer, SuscripcionSerializer, FacturacionSerializer

User = get_user_model()

# ✅ CUSTOM TOKEN VIEW: Aceptar email o username
class CustomTokenObtainPairView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
        
        username_or_email = request.data.get('username', '')
        password = request.data.get('password', '')
        
        # Intentar autenticar con username o email
        user = authenticate(username=username_or_email, password=password)
        
        if not user:
            # Si no funciona con username, intentar con email
            try:
                user = User.objects.get(email=username_or_email)
                user = authenticate(username=user.username, password=password)
            except User.DoesNotExist:
                return Response(
                    {"detail": "No active account found with the given credentials"},
                    status=401
                )
        
        if not user:
            return Response(
                {"detail": "No active account found with the given credentials"},
                status=401
            )
        
        # Usar el serializer estándar con el username real
        serializer = TokenObtainPairSerializer(data={
            'username': user.username,
            'password': password
        })
        
        if serializer.is_valid():
            return Response(serializer.validated_data)
        
        return Response(serializer.errors, status=400)

# ✅ NUEVO: ViewSet para gestionar admin_clientes con asignación a empresas
class UsuarioAdminViewSet(viewsets.ModelViewSet):
    queryset = UsuarioAdmin.objects.all()
    serializer_class = UsuarioAdminSerializer
    permission_classes = [AllowAny]  # TODO: Cambiar a IsAuthenticated en producción

# ✅ ANTIGUO: ViewSet para gestionar usuarios Django básicos
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]  # TODO: Cambiar a IsAuthenticated en producción

class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    # Permitir operaciones públicas (opcional, puedes cambiar a IsAuthenticated)
    permission_classes = [AllowAny]

class SuscripcionViewSet(viewsets.ModelViewSet):
    queryset = Suscripcion.objects.all()
    serializer_class = SuscripcionSerializer

class FacturacionViewSet(viewsets.ModelViewSet):
    queryset = Facturacion.objects.all()
    serializer_class = FacturacionSerializer

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [AllowAny]  # TODO: Cambiar a IsAuthenticated en producción

    @action(detail=False, methods=['post'], url_path='login-router', permission_classes=[AllowAny])
    def login_tenant(self, request):
        email = request.data.get('email', '').lower()
        password = request.data.get('password', '')
        
        # --- PUERTA VIP: SUPER ADMIN ---
        if 'temucosoft.cl' in email or email == 'admin@super.cl':
            # Validar credenciales contra la DB de Django
            from django.contrib.auth import authenticate
            user = authenticate(username=email, password=password)
            if user:
                return Response({
                    "empresa_id": 0,
                    "plan": "super-admin",
                    "instance_url": "http://localhost:8000", 
                    "modulos": ["all"]
                })
            else:
                return Response({"error": "Credenciales inválidas"}, status=401)

        # --- ADMIN CLIENTES (UsuarioAdmin) ---
        from django.contrib.auth import authenticate
        from django.contrib.auth.models import User
        
        # Intentar autenticar: primero con email, luego buscar usuario por email
        user = authenticate(username=email, password=password)
        
        if not user:
            # Si no funciona con email como username, buscar usuario por email
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None
        
        if user:
            # El usuario existe y la contraseña es válida
            # Buscar si tiene UsuarioAdmin asociado
            try:
                admin_user = UsuarioAdmin.objects.get(user=user)
                if not admin_user.empresa:
                    return Response({"error": "Usuario sin empresa asignada"}, status=403)
                
                empresa = admin_user.empresa
                if not hasattr(empresa, 'suscripcion'):
                    return Response({"error": "Empresa sin suscripción asignada"}, status=403)

                return Response({
                    "empresa_id": empresa.id,
                    "empresa_nombre": empresa.nombre,
                    "plan": empresa.suscripcion.plan.nombre,
                    "instance_url": empresa.suscripcion.plan.host_base_url, 
                    "modulos": empresa.suscripcion.plan.modulos_json
                })
            except UsuarioAdmin.DoesNotExist:
                return Response({"error": "Usuario no es administrador de cliente"}, status=403)

        # --- CLIENTES NORMALES (email de empresa) ---
        empresa = Empresa.objects.filter(email=email).first()
        
        if empresa:
            if not hasattr(empresa, 'suscripcion'):
                return Response({"error": "Empresa sin suscripción asignada"}, status=403)

            return Response({
                "empresa_id": empresa.id,
                "empresa_nombre": empresa.nombre,
                "plan": empresa.suscripcion.plan.nombre,
                "instance_url": empresa.suscripcion.plan.host_base_url, 
                "modulos": empresa.suscripcion.plan.modulos_json
            })
        
        return Response({"error": "Credenciales inválidas o empresa no registrada"}, status=404)