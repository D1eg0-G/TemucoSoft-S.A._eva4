from rest_framework import serializers
from django.db import transaction
from .models import (
    Categoria, Producto, Venta, VentaItem, Sucursal, Usuario, Inventario, Caja, MovimientoCaja,
    Proveedor, Compra, CompraItem, PedidoInterno, MovimientoInventario
    
)

# --- CATEGORÍAS ---
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

# --- CAJA Y MOVIMIENTOS ---
class MovimientoCajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovimientoCaja
        fields = '__all__'

# --- USUARIOS Y SUCURSALES ---
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'rut', 'password']
        extra_kwargs = {'password': {'write_only': True}} # Ocultar password al leer

    def create(self, validated_data):
        user = Usuario.objects.create_user(**validated_data)
        return user

class SucursalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sucursal
        fields = '__all__'

# --- PRODUCTOS E INVENTARIO ---
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

# --- CAJA ---
class CajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caja
        fields = '__all__'

# --- VENTAS (POS) ---
class VentaItemSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    
    class Meta:
        model = VentaItem
        fields = ['id', 'producto', 'producto_nombre', 'cantidad', 'precio_unitario']

class VentaSerializer(serializers.ModelSerializer):
    items = VentaItemSerializer(many=True) # Permite crear items anidados
    vendedor_nombre = serializers.ReadOnlyField(source='usuario.username')
    
    class Meta:
        model = Venta
        fields = ['id', 'sucursal', 'usuario', 'vendedor_nombre', 'total', 'metodo_pago', 'fecha', 'items']

    def create(self, validated_data):
        """Transaction atomic para guardar venta e items"""
        items_data = validated_data.pop('items')
        venta = Venta.objects.create(**validated_data)
        for item_data in items_data:
            VentaItem.objects.create(venta=venta, **item_data)
        return venta

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'role', 'rut', 'password']
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

# --- NUEVO EN PLAN MEDIO ---

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

class PedidoInternoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PedidoInterno
        fields = '__all__'

class MovimientoInventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    class Meta:
        model = MovimientoInventario
        fields = ['id', 'producto', 'producto_nombre', 'sucursal', 'tipo', 'cantidad', 'fecha', 'referencia']

# --- VENTA (IGUAL QUE BÁSICO) ---
class VentaItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = VentaItem
        fields = ['producto', 'cantidad', 'precio_unitario']

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