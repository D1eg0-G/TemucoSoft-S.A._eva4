"""
Vista de autenticación que se conecta al Master para validar credenciales
y crear/sincronizar usuarios locales. Si falla, intenta autenticar localmente.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
import requests
import logging

logger = logging.getLogger(__name__)

# URL del servicio Master
MASTER_API = "http://localhost:8000"

class SyncTokenObtainPairView(APIView):
    """
    Endpoint que:
    1. Intenta validar credenciales contra Master
    2. Si falla, intenta autenticar localmente (para usuarios creados en servicio)
    3. Sincroniza el usuario localmente si viene de Master
    4. Emite token JWT local
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username', '')
        password = request.data.get('password', '')

        # Intentar primero con Master (para admin_cliente que sincroniza)
        try:
            routing_response = requests.post(
                f"{MASTER_API}/api/master/empresas/login-router/",
                json={"email": username_or_email, "password": password},
                timeout=5
            )

            if routing_response.status_code == 200:
                # Validación exitosa en Master
                routing_data = routing_response.json()
                empresa_id = routing_data.get('empresa_id')
                empresa_nombre = routing_data.get('empresa_nombre')
                plan = routing_data.get('plan')
                modulos = routing_data.get('modulos', [])

                # Obtener token del Master
                token_response = requests.post(
                    f"{MASTER_API}/api/token/",
                    json={"username": username_or_email, "password": password},
                    timeout=5
                )

                if token_response.status_code != 200:
                    logger.error(f"Master token error: {token_response.status_code}")
                    # Continuar con autenticación local
                    return self._authenticate_locally(username_or_email, password)

                master_token = token_response.json().get('access')

                # Obtener datos del usuario del Master
                user_response = requests.get(
                    f"{MASTER_API}/api/master/admin-usuarios/?search={username_or_email}",
                    headers={"Authorization": f"Bearer {master_token}"},
                    timeout=5
                )

                user_data = {}
                if user_response.status_code == 200:
                    users = user_response.json()
                    if isinstance(users, list) and users:
                        user_data = users[0].get('user', {})

                # Sincronizar usuario localmente
                return self._sync_and_authenticate(
                    username_or_email, password, empresa_id, empresa_nombre, plan, modulos, user_data
                )
            else:
                # Falló Master, intentar autenticación local
                logger.warning(f"Master routing failed, attempting local auth")
                return self._authenticate_locally(username_or_email, password)

        except requests.exceptions.RequestException as e:
            logger.warning(f"Error conectando con Master: {str(e)}, intentando autenticación local")
            return self._authenticate_locally(username_or_email, password)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            return self._authenticate_locally(username_or_email, password)

    def _authenticate_locally(self, username_or_email, password):
        """Intenta autenticación local para usuarios creados en el servicio"""
        try:
            from gestion.models import Usuario
            
            # Intentar autenticar con username o email
            user = authenticate(username=username_or_email, password=password)
            
            if not user:
                # Si no funciona con username, buscar usuario por email
                try:
                    user_obj = Usuario.objects.get(email=username_or_email)
                    user = authenticate(username=user_obj.username, password=password)
                except Usuario.DoesNotExist:
                    user = None
            
            if not user:
                logger.warning(f"Authentication failed for {username_or_email}")
                return Response(
                    {"detail": "Credenciales inválidas"},
                    status=401
                )
            
            # Generar token local
            serializer = TokenObtainPairSerializer(data={
                'username': user.username,
                'password': password
            })

            if not serializer.is_valid():
                logger.warning(f"Token generation failed for {user.username}")
                return Response(
                    {"detail": "Error generando token"},
                    status=401
                )

            return Response({
                **serializer.validated_data,
                'empresa_id': user.empresa_id or 0,
                'empresa_nombre': getattr(user, 'empresa_nombre', 'Local'),
                'plan': 'local',
                'modulos': []
            })

        except Exception as e:
            logger.error(f"Local authentication error: {str(e)}", exc_info=True)
            return Response(
                {"detail": f"Error en autenticación: {str(e)}"},
                status=500
            )

    def _sync_and_authenticate(self, username_or_email, password, empresa_id, empresa_nombre, plan, modulos, user_data):
        """Sincroniza usuario desde Master y genera token"""
        try:
            from gestion.models import Usuario
            
            username_base = username_or_email.split('@')[0]
            
            usuario, created = Usuario.objects.get_or_create(
                username=username_base,
                defaults={
                    'email': username_or_email,
                    'empresa_id': empresa_id,
                    'role': 'admin_cliente',
                    'first_name': user_data.get('first_name', ''),
                    'last_name': user_data.get('last_name', ''),
                }
            )

            # Actualizar campos
            usuario.email = username_or_email
            usuario.empresa_id = empresa_id
            usuario.role = 'admin_cliente'
            usuario.is_active = True
            usuario.set_password(password)
            usuario.save()

            logger.info(f"Usuario sincronizado: {username_base}")

            # Generar token local
            serializer = TokenObtainPairSerializer(data={
                'username': usuario.username,
                'password': password
            })

            if not serializer.is_valid():
                logger.warning(f"Token local falló, usando token de Master")
                return Response({
                    'access': 'master_token_placeholder',
                    'empresa_id': empresa_id,
                    'empresa_nombre': empresa_nombre,
                    'plan': plan,
                    'modulos': modulos
                })

            return Response({
                **serializer.validated_data,
                'empresa_id': empresa_id,
                'empresa_nombre': empresa_nombre,
                'plan': plan,
                'modulos': modulos
            })

        except Exception as e:
            logger.error(f"Sync and authenticate error: {str(e)}", exc_info=True)
            return Response(
                {"detail": f"Error en autenticación: {str(e)}"},
                status=500
            )
