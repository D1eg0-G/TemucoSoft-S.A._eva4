from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from django.utils import timezone
from .models import (
    Categoria, Usuario, Sucursal, Producto, Inventario, Caja, MovimientoCaja,
    Venta, Proveedor, Compra, PedidoInterno, MovimientoInventario
)
from .serializers import (
    CategoriaSerializer, UsuarioSerializer, SucursalSerializer, ProductoSerializer, InventarioSerializer, CajaSerializer, MovimientoCajaSerializer,
    VentaSerializer, ProveedorSerializer, CompraSerializer, PedidoInternoSerializer, MovimientoInventarioSerializer
)

# ==============================================================================
# VIEWSETS CRUD (Estándar)
# ==============================================================================

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()

class MovimientoCajaViewSet(viewsets.ModelViewSet):
    queryset = MovimientoCaja.objects.all()
    serializer_class = MovimientoCajaSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    
    def perform_create(self, serializer):
        """Validar roles permitidos según el plan antes de crear usuario"""
        # Plan Estándar: permite admin_cliente, vendedor y gerente
        # No hay restricciones de roles en este plan
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Obtener datos del usuario autenticado"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class SucursalViewSet(viewsets.ModelViewSet):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer
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

class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all()
    serializer_class = InventarioSerializer
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

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)

class CompraViewSet(viewsets.ModelViewSet):
    queryset = Compra.objects.all()
    serializer_class = CompraSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)

class PedidoInternoViewSet(viewsets.ModelViewSet):
    queryset = PedidoInterno.objects.all()
    serializer_class = PedidoInternoSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)

class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInventario.objects.all()
    serializer_class = MovimientoInventarioSerializer
    http_method_names = ['get'] # Generalmente los movimientos son solo de lectura (historial)
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)

# ==============================================================================
# VIEWSET DE REPORTES 
# ==============================================================================

class ReportesViewSet(viewsets.ViewSet):
    """
    ViewSet que no está atado a un modelo específico, sino que agrupa 
    lógica de reportes del negocio.
    """
    # permission_classes = [permissions.IsAuthenticated] # Descomentar si usas Auth

    @action(detail=False, methods=['get'])
    def ventas(self, request):
        """
        Reporte de ventas por rango de fechas.
        Uso: GET /api/medio/reportes/ventas/?fecha_inicio=2023-01-01&fecha_fin=2023-12-31
        """
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        sucursal_id = request.query_params.get('sucursal')

        # Filtro base
        ventas = Venta.objects.all()
        empresa_id = getattr(request.user, 'empresa_id', None)
        if empresa_id is not None:
            ventas = ventas.filter(empresa_id=empresa_id)

        if fecha_inicio and fecha_fin:
            ventas = ventas.filter(fecha__date__range=[fecha_inicio, fecha_fin])
        
        if sucursal_id:
            ventas = ventas.filter(sucursal_id=sucursal_id)

        # Cálculos (Agregaciones)
        total_vendido = ventas.aggregate(Sum('total'))['total__sum'] or 0
        cantidad_ventas = ventas.count()
        
        # Desglose por método de pago
        por_metodo = ventas.values('metodo_pago').annotate(
            total=Sum('total'), 
            cantidad=Count('id')
        )

        return Response({
            "rango_fechas": {"inicio": fecha_inicio, "fin": fecha_fin},
            "total_vendido": total_vendido,
            "cantidad_transacciones": cantidad_ventas,
            "desglose_pago": por_metodo
        })

    @action(detail=False, methods=['get'])
    def stock(self, request):
        """
        Reporte de stock actual (crítico).
        Uso: GET /api/medio/reportes/stock/?sucursal=1
        """
        sucursal_id = request.query_params.get('sucursal')
        
        inventario = Inventario.objects.all()
        empresa_id = getattr(request.user, 'empresa_id', None)
        if empresa_id is not None:
            inventario = inventario.filter(empresa_id=empresa_id)
        
        if sucursal_id:
            inventario = inventario.filter(sucursal_id=sucursal_id)
            
        # Serializamos los datos para mostrarlos en el reporte
        # Usamos el serializer existente o construimos una respuesta custom
        data = inventario.values(
            'sucursal__nombre', 
            'producto__nombre', 
            'producto__sku', 
            'stock',
            'punto_reorden'
        ).order_by('sucursal', 'stock')

        # Alerta de stock bajo
        stock_bajo = inventario.filter(stock__lte=F('punto_reorden')).count()

        return Response({
            "alertas_stock_bajo": stock_bajo,
            "detalle_inventario": data
        })