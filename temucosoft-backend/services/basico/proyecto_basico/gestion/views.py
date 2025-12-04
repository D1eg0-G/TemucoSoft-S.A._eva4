from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Categoria, Producto, Venta, Caja, Sucursal, Usuario, Inventario, VentaItem, MovimientoCaja
from .serializers import CategoriaSerializer, ProductoSerializer, VentaSerializer, CajaSerializer, SucursalSerializer, UsuarioSerializer, InventarioSerializer, VentaItemSerializer, MovimientoCajaSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class MovimientoCajaViewSet(viewsets.ModelViewSet):
    queryset = MovimientoCaja.objects.all()
    serializer_class = MovimientoCajaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer

class CajaViewSet(viewsets.ModelViewSet):
    queryset = Caja.objects.all()
    serializer_class = CajaSerializer

class SucursalViewSet(viewsets.ModelViewSet):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    
    def perform_create(self, serializer):
        """Validar roles permitidos según el plan antes de crear usuario"""
        role = serializer.validated_data.get('role')
        
        # Plan Básico: solo permite admin_cliente y vendedor
        # No permite gerente
        if role == 'gerente':
            from rest_framework.exceptions import ValidationError
            raise ValidationError(
                {"role": "El rol 'gerente' no está disponible en el plan Básico. "
                         "Actualiza tu suscripción a un plan superior."}
            )
        
        serializer.save()
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Obtener datos del usuario autenticado"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all()
    serializer_class = InventarioSerializer

class VentaItemViewSet(viewsets.ModelViewSet):
    queryset = VentaItem.objects.all()
    serializer_class = VentaItemSerializer
