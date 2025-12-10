from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Categoria, Producto, Venta, Caja, Sucursal, Usuario, Inventario, VentaItem, MovimientoCaja
from .serializers import CategoriaSerializer, ProductoSerializer, VentaSerializer, CajaSerializer, SucursalSerializer, UsuarioSerializer, InventarioSerializer, VentaItemSerializer, MovimientoCajaSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        if empresa_id is None:
            raise ValidationError({
                "error": f"El usuario '{self.request.user.username}' no tiene empresa_id asignado. "
                         "Ejecuta en la base de datos: UPDATE gestion_usuario SET empresa_id=1 WHERE username='{self.request.user.username}';"
            })
        serializer.save(empresa_id=empresa_id)

class MovimientoCajaViewSet(viewsets.ModelViewSet):
    queryset = MovimientoCaja.objects.all()
    serializer_class = MovimientoCajaSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)

class CajaViewSet(viewsets.ModelViewSet):
    queryset = Caja.objects.all()
    serializer_class = CajaSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)

class SucursalViewSet(viewsets.ModelViewSet):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    
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
        
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Obtener datos del usuario autenticado"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all()
    serializer_class = InventarioSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)
    
    @action(detail=True, methods=['post'], url_path='adjust')
    def adjust(self, request, pk=None):
        """
        Ajustar stock de inventario manualmente.
        POST /api/basico/inventario/{id}/adjust/
        Body: {"cantidad": 10, "tipo": "entrada|salida", "motivo": "Ajuste por diferencia"}
        """
        inventario = self.get_object()
        cantidad = request.data.get('cantidad')
        tipo = request.data.get('tipo', 'entrada')
        motivo = request.data.get('motivo', 'Ajuste manual')
        
        if cantidad is None:
            return Response({"error": "Se requiere cantidad"}, status=400)
        
        try:
            cantidad = int(cantidad)
            if cantidad <= 0:
                return Response({"error": "La cantidad debe ser positiva"}, status=400)
        except ValueError:
            return Response({"error": "Cantidad inválida"}, status=400)
        
        stock_anterior = inventario.stock
        
        if tipo == 'entrada':
            inventario.stock += cantidad
        elif tipo == 'salida':
            if inventario.stock < cantidad:
                return Response({
                    "error": f"Stock insuficiente. Stock actual: {inventario.stock}"
                }, status=400)
            inventario.stock -= cantidad
        else:
            return Response({"error": "Tipo debe ser 'entrada' o 'salida'"}, status=400)
        
        inventario.save()
        
        return Response({
            "message": f"Ajuste de inventario realizado: {tipo}",
            "stock_anterior": stock_anterior,
            "cantidad_ajustada": cantidad,
            "stock_nuevo": inventario.stock,
            "motivo": motivo
        }, status=200)

class VentaItemViewSet(viewsets.ModelViewSet):
    queryset = VentaItem.objects.all()
    serializer_class = VentaItemSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
