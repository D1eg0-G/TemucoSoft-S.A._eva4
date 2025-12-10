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
    permission_classes = [IsAuthenticated]

# ✅ ANTIGUO: ViewSet para gestionar usuarios Django básicos
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = [IsAuthenticated]

class SuscripcionViewSet(viewsets.ModelViewSet):
    queryset = Suscripcion.objects.all()
    serializer_class = SuscripcionSerializer
    permission_classes = [IsAuthenticated]

class FacturacionViewSet(viewsets.ModelViewSet):
    queryset = Facturacion.objects.all()
    serializer_class = FacturacionSerializer
    permission_classes = [IsAuthenticated]

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='subscribe')
    def subscribe(self, request, pk=None):
        """
        Endpoint para suscribir una empresa a un plan.
        POST /api/master/empresas/{id}/subscribe/
        Body: {"plan_id": 1, "fecha_inicio": "2025-01-01", "fecha_fin": "2025-12-31"}
        """
        empresa = self.get_object()
        plan_id = request.data.get('plan_id')
        fecha_inicio = request.data.get('fecha_inicio')
        fecha_fin = request.data.get('fecha_fin')
        
        if not plan_id:
            return Response({"error": "Se requiere plan_id"}, status=400)
        
        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({"error": "Plan no encontrado"}, status=404)
        
        # Verificar si ya tiene suscripción activa
        if hasattr(empresa, 'suscripcion') and empresa.suscripcion.activo:
            return Response({
                "error": "La empresa ya tiene una suscripción activa",
                "suscripcion_actual": SuscripcionSerializer(empresa.suscripcion).data
            }, status=400)
        
        # Crear o actualizar suscripción
        suscripcion, created = Suscripcion.objects.update_or_create(
            empresa=empresa,
            defaults={
                'plan': plan,
                'fecha_inicio': fecha_inicio or timezone.now().date(),
                'fecha_fin': fecha_fin,
                'estado': 'activa',
                'activo': True
            }
        )
        
        return Response({
            "message": "Suscripción creada exitosamente" if created else "Suscripción actualizada",
            "suscripcion": SuscripcionSerializer(suscripcion).data
        }, status=201 if created else 200)

    @action(detail=False, methods=['post'], url_path='login-router', permission_classes=[AllowAny])
    def login_tenant(self, request):
        import psycopg2
        from django.conf import settings
        
        email = request.data.get('email', '').lower()
        password = request.data.get('password', '')
        
        # Helper para normalizar instance_url con sufijo de servicio
        def normalize_instance_url(base_url, plan_name):
            """Asegura que la URL incluya el sufijo /basico, /medio o /premium"""
            if not base_url:
                return base_url
            # Limpiar trailing slash
            url = base_url.rstrip('/')
            plan_lower = plan_name.lower()
            
            # Mapeo plan → sufijo de API
            suffix_map = {
                'basico': '/basico',
                'estandar': '/medio',
                'medio': '/medio',
                'premium': '/premium'
            }
            
            suffix = suffix_map.get(plan_lower, '')
            if suffix and not url.lower().endswith(suffix):
                # Si termina en /api, añadir sufijo
                if url.lower().endswith('/api'):
                    return f"{url}{suffix}"
                # Si no tiene /api al final, intentar añadir ambos
                if '/api' in url.lower():
                    return url  # Ya tiene estructura compleja, respetar
                return f"{url}/api{suffix}"
            return url
        
        # Helper para buscar y autenticar en bases de datos de planes
        def check_plan_database(db_name, plan_name, port):
            """Busca usuario en base de datos de plan específico"""
            try:
                # Conectar a la base de datos del plan
                conn = psycopg2.connect(
                    dbname=db_name,
                    user=settings.DATABASES['default']['USER'],
                    password=settings.DATABASES['default']['PASSWORD'],
                    host=settings.DATABASES['default']['HOST'],
                    port=settings.DATABASES['default']['PORT']
                )
                cursor = conn.cursor()
                
                # Buscar usuario por email o username
                cursor.execute("""
                    SELECT id, username, email, password, empresa_id, is_active 
                    FROM gestion_usuario 
                    WHERE email = %s OR username = %s
                """, (email, email))
                
                user_data = cursor.fetchone()
                cursor.close()
                conn.close()
                
                if user_data:
                    user_id, username, user_email, hashed_password, empresa_id, is_active = user_data
                    
                    # Verificar contraseña usando Django's check_password
                    from django.contrib.auth.hashers import check_password
                    if check_password(password, hashed_password) and is_active:
                        return {
                            "success": True,
                            "empresa_id": empresa_id or 1,  # Default a 1 si es None
                            "plan": plan_name,
                            "instance_url": f"http://localhost:{port}/api",
                            "username": username,
                            "email": user_email
                        }
                
                return None
            except Exception as e:
                print(f"Error checking {plan_name} database: {e}")
                return None
        
        # --- PUERTA VIP: SUPER ADMIN ---
        if 'temucosoft.cl' in email or email == 'admin@super.cl':
            # Validar credenciales contra la DB de Django
            from django.contrib.auth import authenticate
            user = authenticate(username=email, password=password)
            if user:
                return Response({
                    "empresa_id": 0,
                    "plan": "super-admin",
                    "instance_url": "http://localhost:8000/api/master", 
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

                plan_name = empresa.suscripcion.plan.nombre
                base_url = empresa.suscripcion.plan.host_base_url
                return Response({
                    "empresa_id": empresa.id,
                    "empresa_nombre": empresa.nombre,
                    "plan": plan_name,
                    "instance_url": normalize_instance_url(base_url, plan_name), 
                    "modulos": empresa.suscripcion.plan.modulos_json
                })
            except UsuarioAdmin.DoesNotExist:
                pass  # Continuar buscando en otras bases de datos

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
        
        # --- BUSCAR EN BASES DE DATOS DE PLANES ---
        plan_databases = [
            ('db_basico', 'Básico', 8001),
            ('db_medio', 'Estándar', 8002),
            ('db_premium', 'Premium', 8003)
        ]
        
        for db_name, plan_name, port in plan_databases:
            result = check_plan_database(db_name, plan_name, port)
            if result and result.get('success'):
                # Definir módulos según el plan
                modulos = {
                    'Básico': ['dashboard', 'products', 'inventory', 'sale', 'cashregister'],
                    'Estándar': ['dashboard', 'products', 'inventory', 'sale', 'cashregister', 'branches', 'providers', 'purchases', 'orders', 'reports'],
                    'Premium': ['dashboard', 'products', 'inventory', 'sale', 'cashregister', 'branches', 'providers', 'purchases', 'orders', 'reports', 'gestion-user', 'subscription']
                }
                
                return Response({
                    "empresa_id": result['empresa_id'],
                    "empresa_nombre": "HiperMarket C",  # Default name
                    "plan": plan_name,
                    "instance_url": result['instance_url'],
                    "modulos": modulos.get(plan_name, []),
                    "username": result['username'],
                    "email": result['email']
                })
        
        return Response({"error": "Credenciales inválidas o empresa no registrada"}, status=404)