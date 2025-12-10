from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from django.utils import timezone
from .models import (
    Categoria, Usuario, Sucursal, Producto, Inventario, Caja, MovimientoCaja,
    Venta, Proveedor, Compra, PedidoInterno, MovimientoInventario,
    ClienteFinal, OrdenEcommerce, Carrito, ApiToken, LogApi
)
from .serializers import (
    CategoriaSerializer, UsuarioSerializer, SucursalSerializer, ProductoSerializer, InventarioSerializer, CajaSerializer, MovimientoCajaSerializer,
    VentaSerializer, ProveedorSerializer, CompraSerializer, PedidoInternoSerializer, MovimientoInventarioSerializer,
    ClienteFinalSerializer, OrdenEcommerceSerializer, CarritoSerializer, ApiTokenSerializer, LogApiSerializer
)

# ==============================================================================
# VIEWSETS CRUD (BÁSICO + MEDIO)
# ==============================================================================

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
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

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    
    def perform_create(self, serializer):
        """Validar roles permitidos según el plan antes de crear usuario"""
        # Plan Premium: permite todos los roles disponibles
        # admin_cliente, vendedor y gerente
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
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)

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
        POST /api/premium/inventario/{id}/adjust/
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
    http_method_names = ['get']
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
# VIEWSETS CRUD (EXCLUSIVO PREMIUM)
# ==============================================================================

class ClienteFinalViewSet(viewsets.ModelViewSet):
    queryset = ClienteFinal.objects.all()
    serializer_class = ClienteFinalSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)

class OrdenEcommerceViewSet(viewsets.ModelViewSet):
    queryset = OrdenEcommerce.objects.all()
    serializer_class = OrdenEcommerceSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)

class CarritoViewSet(viewsets.ModelViewSet):
    queryset = Carrito.objects.all()
    serializer_class = CarritoSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)
    
    @action(detail=True, methods=['post'], url_path='add')
    def add_item(self, request, pk=None):
        """
        Agregar producto al carrito.
        POST /api/premium/carrito/{id}/add/
        Body: {"producto_id": 1, "cantidad": 2}
        """
        carrito = self.get_object()
        producto_id = request.data.get('producto_id')
        cantidad = request.data.get('cantidad', 1)
        
        if not producto_id:
            return Response({"error": "Se requiere producto_id"}, status=400)
        
        try:
            cantidad = int(cantidad)
            if cantidad <= 0:
                return Response({"error": "La cantidad debe ser positiva"}, status=400)
        except ValueError:
            return Response({"error": "Cantidad inválida"}, status=400)
        
        # Verificar que el producto existe y tiene stock
        try:
            producto = Producto.objects.get(id=producto_id, empresa_id=carrito.empresa_id)
        except Producto.DoesNotExist:
            return Response({"error": "Producto no encontrado"}, status=404)
        
        # Verificar stock disponible
        inventario = Inventario.objects.filter(
            producto_id=producto_id, 
            empresa_id=carrito.empresa_id
        ).first()
        
        if inventario and inventario.stock < cantidad:
            return Response({
                "error": f"Stock insuficiente. Disponible: {inventario.stock}"
            }, status=400)
        
        # Verificar si el producto ya está en el carrito
        carrito_item = CarritoItem.objects.filter(
            carrito=carrito, 
            producto_id=producto_id
        ).first()
        
        if carrito_item:
            # Actualizar cantidad
            carrito_item.cantidad += cantidad
            carrito_item.save()
            message = "Cantidad actualizada en el carrito"
        else:
            # Crear nuevo item
            carrito_item = CarritoItem.objects.create(
                carrito=carrito,
                producto_id=producto_id,
                cantidad=cantidad
            )
            message = "Producto agregado al carrito"
        
        return Response({
            "message": message,
            "carrito": CarritoSerializer(carrito).data
        }, status=200)
    
    @action(detail=True, methods=['post'], url_path='checkout')
    def checkout(self, request, pk=None):
        """
        Procesar checkout del carrito y crear orden de e-commerce.
        POST /api/premium/carrito/{id}/checkout/
        Body: {"cliente_id": 1, "direccion_envio": "Calle 123", "metodo_pago": "tarjeta"}
        """
        from django.db import transaction
        
        carrito = self.get_object()
        cliente_id = request.data.get('cliente_id')
        direccion_envio = request.data.get('direccion_envio')
        metodo_pago = request.data.get('metodo_pago', 'efectivo')
        
        # Validar que el carrito tiene items
        items = CarritoItem.objects.filter(carrito=carrito)
        if not items.exists():
            return Response({"error": "El carrito está vacío"}, status=400)
        
        # Validar cliente
        if cliente_id:
            try:
                cliente = ClienteFinal.objects.get(id=cliente_id, empresa_id=carrito.empresa_id)
            except ClienteFinal.DoesNotExist:
                return Response({"error": "Cliente no encontrado"}, status=404)
        else:
            cliente = None
        
        try:
            with transaction.atomic():
                # Calcular total y validar stock
                total = 0
                orden_items_data = []
                
                for item in items:
                    try:
                        producto = Producto.objects.get(
                            id=item.producto_id, 
                            empresa_id=carrito.empresa_id
                        )
                    except Producto.DoesNotExist:
                        return Response({
                            "error": f"Producto {item.producto_id} no encontrado"
                        }, status=404)
                    
                    # Verificar stock
                    inventario = Inventario.objects.filter(
                        producto_id=item.producto_id,
                        empresa_id=carrito.empresa_id
                    ).first()
                    
                    if inventario and inventario.stock < item.cantidad:
                        return Response({
                            "error": f"Stock insuficiente para {producto.nombre}. Disponible: {inventario.stock}"
                        }, status=400)
                    
                    # Reducir stock
                    if inventario:
                        inventario.stock -= item.cantidad
                        inventario.save()
                    
                    subtotal = producto.precio * item.cantidad
                    total += subtotal
                    
                    orden_items_data.append({
                        'producto_id': item.producto_id,
                        'cantidad': item.cantidad,
                        'precio_unitario': producto.precio
                    })
                
                # Crear orden de e-commerce
                orden = OrdenEcommerce.objects.create(
                    cliente=cliente,
                    total=total,
                    estado='pendiente',
                    empresa_id=carrito.empresa_id
                )
                
                # Crear items de la orden
                for item_data in orden_items_data:
                    OrdenItem.objects.create(
                        orden=orden,
                        **item_data
                    )
                
                # Limpiar carrito
                items.delete()
                
                return Response({
                    "message": "Checkout realizado exitosamente",
                    "orden_id": orden.id,
                    "total": total,
                    "estado": orden.estado
                }, status=201)
                
        except Exception as e:
            return Response({
                "error": f"Error al procesar checkout: {str(e)}"
            }, status=500)

class ApiTokenViewSet(viewsets.ModelViewSet):
    queryset = ApiToken.objects.all()
    serializer_class = ApiTokenSerializer
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()
    def perform_create(self, serializer):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        serializer.save(empresa_id=empresa_id)

class LogApiViewSet(viewsets.ModelViewSet):
    queryset = LogApi.objects.all()
    serializer_class = LogApiSerializer
    http_method_names = ['get']
    def get_queryset(self):
        empresa_id = getattr(self.request.user, 'empresa_id', None)
        return super().get_queryset().filter(empresa_id=empresa_id) if empresa_id is not None else super().get_queryset().none()

# ==============================================================================
# VIEWSET DE REPORTES (IGUAL QUE MEDIO)
# ==============================================================================

class ReportesViewSet(viewsets.ViewSet):
    """
    ViewSet que agrupa lógica de reportes.
    En Premium, podrías extender esto para incluir ventas de Ecommerce también.
    """
    @action(detail=False, methods=['get'])
    def ventas(self, request):
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        sucursal_id = request.query_params.get('sucursal')

        # 1. Ventas POS
        ventas_pos = Venta.objects.all()
        empresa_id = getattr(request.user, 'empresa_id', None)
        if empresa_id is not None:
            ventas_pos = ventas_pos.filter(empresa_id=empresa_id)
        if fecha_inicio and fecha_fin:
            ventas_pos = ventas_pos.filter(fecha__date__range=[fecha_inicio, fecha_fin])
        if sucursal_id:
            ventas_pos = ventas_pos.filter(sucursal_id=sucursal_id)

        total_pos = ventas_pos.aggregate(Sum('total'))['total__sum'] or 0
        
        # 2. Ventas Ecommerce (Opcional: Agregar al reporte si quieres mostrar todo junto)
        ventas_web = OrdenEcommerce.objects.filter(estado='entregado') # Solo ventas cerradas
        if empresa_id is not None:
            ventas_web = ventas_web.filter(empresa_id=empresa_id)
        if fecha_inicio and fecha_fin:
            ventas_web = ventas_web.filter(fecha__date__range=[fecha_inicio, fecha_fin])
            
        total_web = ventas_web.aggregate(Sum('total'))['total__sum'] or 0

        return Response({
            "rango_fechas": {"inicio": fecha_inicio, "fin": fecha_fin},
            "ventas_pos": total_pos,
            "ventas_ecommerce": total_web,
            "total_general": total_pos + total_web,
            "cantidad_transacciones_pos": ventas_pos.count(),
            "cantidad_transacciones_web": ventas_web.count()
        })

    @action(detail=False, methods=['get'])
    def stock(self, request):
        sucursal_id = request.query_params.get('sucursal')
        inventario = Inventario.objects.all()
        empresa_id = getattr(request.user, 'empresa_id', None)
        if empresa_id is not None:
            inventario = inventario.filter(empresa_id=empresa_id)
        
        if sucursal_id:
            inventario = inventario.filter(sucursal_id=sucursal_id)
            
        data = inventario.values(
            'sucursal__nombre', 
            'producto__nombre', 
            'producto__sku', 
            'stock',
            'punto_reorden'
        ).order_by('sucursal', 'stock')

        stock_bajo = inventario.filter(stock__lte=F('punto_reorden')).count()

        return Response({
            "alertas_stock_bajo": stock_bajo,
            "detalle_inventario": data
        })