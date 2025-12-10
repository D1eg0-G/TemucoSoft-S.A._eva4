from rest_framework import serializers
from django.db import transaction
from .models import Categoria, Producto, Venta, VentaItem, Sucursal, Usuario, Inventario, Caja, MovimientoCaja

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
    items = VentaItemSerializer(many=True)
    
    class Meta:
        model = Venta
        fields = ['id', 'sucursal', 'usuario', 'total', 'metodo_pago', 'fecha', 'items', 'empresa_id']
        extra_kwargs = {'empresa_id': {'required': False}}

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

                
                VentaItem.objects.create(venta=venta, **item_data)
                
        return venta