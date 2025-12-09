from rest_framework import serializers
from django.db import transaction
from .models import Categoria, Producto, Venta, VentaItem, Sucursal, Usuario, Inventario, Caja, MovimientoCaja

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

                
                VentaItem.objects.create(venta=venta, **item_data)
                
        return venta