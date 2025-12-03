from rest_framework import serializers
from django.db import transaction
from .models import (
    # Básico
    Producto, Venta, VentaItem, Sucursal, Usuario, Inventario, Caja,
    # Medio
    Proveedor, Compra, CompraItem, PedidoInterno, MovimientoInventario,
    # Premium
    ClienteFinal, OrdenEcommerce, OrdenItem, Carrito, CarritoItem, ApiToken, LogApi
)

# =========================================================
# 1. BLOQUE BÁSICO (Usuarios, Sucursales, Inventario)
# =========================================================

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'rut', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return Usuario.objects.create_user(**validated_data)

class SucursalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sucursal
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'

class InventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    sucursal_nombre = serializers.ReadOnlyField(source='sucursal.nombre')

    class Meta:
        model = Inventario
        fields = ['id', 'producto', 'producto_nombre', 'sucursal', 'sucursal_nombre', 'stock', 'punto_reorden']

class CajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caja
        fields = '__all__'

class VentaItemSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    
    class Meta:
        model = VentaItem
        fields = ['id', 'producto', 'producto_nombre', 'cantidad', 'precio_unitario']

class VentaSerializer(serializers.ModelSerializer):
    items = VentaItemSerializer(many=True)
    
    class Meta:
        model = Venta
        fields = ['id', 'sucursal', 'usuario', 'total', 'metodo_pago', 'fecha', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        with transaction.atomic():
            venta = Venta.objects.create(**validated_data)
            
            for item_data in items_data:
                producto = item_data['producto']
                cantidad = item_data['cantidad']
                sucursal = venta.sucursal
                
                try:
                    inventario = Inventario.objects.get(producto=producto, sucursal=sucursal)
                except Inventario.DoesNotExist:
                    raise serializers.ValidationError(f"No hay inventario para {producto.nombre}")

                if inventario.stock < cantidad:
                    raise serializers.ValidationError(f"Stock insuficiente para {producto.nombre}")
                
                # Restar Stock
                inventario.stock -= cantidad
                inventario.save()

                # Registrar Movimiento de Salida
                MovimientoInventario.objects.create(
                    producto=producto,
                    sucursal=sucursal,
                    tipo='salida',
                    cantidad=cantidad,
                    referencia=f"Venta #{venta.id}",
                    empresa_id=venta.empresa_id
                )
                
                VentaItem.objects.create(venta=venta, **item_data)
                
        return venta

# =========================================================
# 2. BLOQUE MEDIO (Proveedores, Compras, Pedidos)
# =========================================================

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'

class CompraItemSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    
    class Meta:
        model = CompraItem
        fields = ['id', 'producto', 'producto_nombre', 'cantidad', 'costo_unitario']

class CompraSerializer(serializers.ModelSerializer):
    items = CompraItemSerializer(many=True)
    proveedor_nombre = serializers.ReadOnlyField(source='proveedor.nombre')

    class Meta:
        model = Compra
        fields = ['id', 'proveedor', 'proveedor_nombre', 'sucursal', 'total', 'fecha', 'estado', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        with transaction.atomic():
            compra = Compra.objects.create(**validated_data)
            
            for item_data in items_data:
                producto = item_data['producto']
                cantidad = item_data['cantidad']
                sucursal = compra.sucursal
                
                # 1. Buscar o Crear Inventario (Si es producto nuevo en la sucursal)
                inventario, created = Inventario.objects.get_or_create(
                    producto=producto,
                    sucursal=sucursal,
                    defaults={'stock': 0, 'empresa_id': compra.empresa_id}
                )
                
                # 2. Sumar Stock
                inventario.stock += cantidad
                inventario.save()
                
                # 3. Registrar Movimiento (Opcional pero recomendado para auditoría)
                MovimientoInventario.objects.create(
                    producto=producto,
                    sucursal=sucursal,
                    tipo='entrada',
                    cantidad=cantidad,
                    referencia=f"Compra #{compra.id}",
                    empresa_id=compra.empresa_id
                )

                # 4. Crear Item de Compra
                CompraItem.objects.create(compra=compra, **item_data)
                
        return compra

    class Meta:
        model = Compra
        fields = ['id', 'proveedor', 'proveedor_nombre', 'sucursal', 'total', 'fecha', 'estado', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        compra = Compra.objects.create(**validated_data)
        for item_data in items_data:
            CompraItem.objects.create(compra=compra, **item_data)
        return compra

class PedidoInternoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PedidoInterno
        fields = '__all__'

class MovimientoInventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    
    class Meta:
        model = MovimientoInventario
        fields = ['id', 'producto', 'producto_nombre', 'sucursal', 'tipo', 'cantidad', 'fecha', 'referencia']

# =========================================================
# 3. BLOQUE PREMIUM (E-commerce, API Tokens)
# =========================================================

class ClienteFinalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClienteFinal
        fields = ['id', 'nombre', 'email', 'telefono', 'direccion', 'password']
        extra_kwargs = {'password': {'write_only': True}}

# --- E-COMMERCE ---
class OrdenItemSerializer(serializers.ModelSerializer):
    # Nota: Si producto_id es un entero simple, no podemos usar 'source' para obtener el nombre directamente
    # a menos que hagamos una consulta extra o cambiemos el modelo a ForeignKey.
    # Aquí lo dejamos simple asumiendo IntegerField.
    class Meta:
        model = OrdenItem
        fields = ['id', 'producto_id', 'cantidad', 'precio_unitario']

class OrdenEcommerceSerializer(serializers.ModelSerializer):
    items = OrdenItemSerializer(many=True)
    cliente_nombre = serializers.ReadOnlyField(source='cliente.nombre')

    class Meta:
        model = OrdenEcommerce
        fields = ['id', 'cliente', 'cliente_nombre', 'total', 'estado', 'fecha', 'direccion_envio', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        with transaction.atomic():
            orden = OrdenEcommerce.objects.create(**validated_data)
            
            # Asumimos que el ecommerce descuenta de una "Sucursal Central" o Bodega Principal
            # Podrías definir una lógica para elegir sucursal, aquí usaremos la primera encontrada o una por defecto
            sucursal_ecommerce = Sucursal.objects.filter(empresa_id=orden.empresa_id).first()
            if not sucursal_ecommerce:
                raise serializers.ValidationError("No hay sucursal configurada para despachar ecommerce.")

            for item_data in items_data:
                producto_id = item_data['producto_id']
                cantidad = item_data['cantidad']
                
                # 1. Buscar Inventario
                try:
                    inventario = Inventario.objects.get(producto_id=producto_id, sucursal=sucursal_ecommerce)
                except Inventario.DoesNotExist:
                    raise serializers.ValidationError(f"Producto ID {producto_id} sin stock en bodega central.")

                # 2. Validar Stock
                if inventario.stock < cantidad:
                    raise serializers.ValidationError(f"Stock insuficiente para producto ID {producto_id}.")
                
                # 3. Restar Stock
                inventario.stock -= cantidad
                inventario.save()
                
                # 4. Crear Item
                OrdenItem.objects.create(orden=orden, **item_data)
                
        return orden

class CarritoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarritoItem
        fields = ['id', 'producto_id', 'cantidad']

class CarritoSerializer(serializers.ModelSerializer):
    items = CarritoItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Carrito
        fields = ['id', 'cliente', 'session_id', 'creado', 'items']

# --- API INTEGRACIONES ---
class ApiTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiToken
        fields = ['token', 'activo', 'expira', 'creado']
        read_only_fields = ['token', 'creado']

class LogApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogApi
        fields = '__all__'