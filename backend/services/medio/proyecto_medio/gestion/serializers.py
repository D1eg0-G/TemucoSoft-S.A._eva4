from rest_framework import serializers
from django.db import transaction
from .models import (
    Categoria, Producto, Venta, VentaItem, Sucursal, Usuario, Inventario, Caja, MovimientoCaja,
    Proveedor, Compra, CompraItem, PedidoInterno, MovimientoInventario
    
)

# --- CATEGORÍAS ---
class CategoriaSerializer(serializers.ModelSerializer):
    empresa_id = serializers.IntegerField(required=False, allow_null=False)
    
    class Meta:
        model = Categoria
        fields = '__all__'

# --- CAJA Y MOVIMIENTOS ---
class MovimientoCajaSerializer(serializers.ModelSerializer):
    empresa_id = serializers.IntegerField(required=False, allow_null=False)
    
    class Meta:
        model = MovimientoCaja
        fields = '__all__'

# --- USUARIOS Y SUCURSALES ---
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'rut', 'password', 'is_active', 'empresa_id']
        extra_kwargs = {
            'password': {'write_only': True},
            'empresa_id': {'required': False}
        }

    def create(self, validated_data):
        # Extraer empresa_id si viene en validated_data
        empresa_id = validated_data.pop('empresa_id', None)
        
        # Crear usuario con create_user para hashear password
        user = Usuario.objects.create_user(**validated_data)
        
        # Asignar empresa_id después de crear
        if empresa_id is not None:
            user.empresa_id = empresa_id
            user.activo = validated_data.get('is_active', True)
            user.save()
        
        return user
    
    def update(self, instance, validated_data):
        # Si viene password, actualizarla con hash
        password = validated_data.pop('password', None)
        
        # Actualizar campos normales
        for attr, value in validated_data.items():
            if attr == 'is_active':
                instance.activo = value
            else:
                setattr(instance, attr, value)
        
        # Si hay nueva password, hashearla
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance

class SucursalSerializer(serializers.ModelSerializer):
    empresa_id = serializers.IntegerField(required=False, allow_null=False)
    
    class Meta:
        model = Sucursal
        fields = '__all__'

# --- PRODUCTOS E INVENTARIO ---
class ProductoSerializer(serializers.ModelSerializer):
    empresa_id = serializers.IntegerField(required=False, allow_null=False)
    
    class Meta:
        model = Producto
        fields = '__all__'

class InventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    sucursal_nombre = serializers.ReadOnlyField(source='sucursal.nombre')

    class Meta:
        model = Inventario
        fields = ['id', 'producto', 'producto_nombre', 'sucursal', 'sucursal_nombre', 'stock', 'punto_reorden', 'empresa_id']
        extra_kwargs = {'empresa_id': {'required': False}}

# --- CAJA ---
class CajaSerializer(serializers.ModelSerializer):
    empresa_id = serializers.IntegerField(required=False, allow_null=False)
    
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
        fields = ['id', 'sucursal', 'usuario', 'vendedor_nombre', 'total', 'metodo_pago', 'fecha', 'items', 'empresa_id']
        extra_kwargs = {'empresa_id': {'required': False}}

    def create(self, validated_data):
        """Transaction atomic para guardar venta e items"""
        items_data = validated_data.pop('items')
        venta = Venta.objects.create(**validated_data)
        for item_data in items_data:
            VentaItem.objects.create(venta=venta, **item_data)
        return venta

# --- NUEVO EN PLAN MEDIO ---

class ProveedorSerializer(serializers.ModelSerializer):
    empresa_id = serializers.IntegerField(required=False, allow_null=False)
    
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
        extra_kwargs = {'empresa_id': {'required': False}}

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
    empresa_id = serializers.IntegerField(required=False, allow_null=False)
    
    class Meta:
        model = PedidoInterno
        fields = '__all__'

class MovimientoInventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    class Meta:
        model = MovimientoInventario
        fields = ['id', 'producto', 'producto_nombre', 'sucursal', 'tipo', 'cantidad', 'fecha', 'referencia']