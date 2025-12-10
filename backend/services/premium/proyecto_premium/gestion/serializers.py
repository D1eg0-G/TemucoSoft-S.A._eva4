from rest_framework import serializers
from django.db import transaction
from .models import (
    # Básico
    Categoria, Producto, Venta, VentaItem, Sucursal, Usuario, Inventario, Caja, MovimientoCaja,
    # Medio
    Proveedor, Compra, CompraItem, PedidoInterno, MovimientoInventario,
    # Premium
    ClienteFinal, OrdenEcommerce, OrdenItem, Carrito, CarritoItem, ApiToken, LogApi
)

# =========================================================
# 1. BLOQUE CATEGORÍAS
# =========================================================

class CategoriaSerializer(serializers.ModelSerializer):
    empresa_id = serializers.IntegerField(required=False, allow_null=False)
    
    class Meta:
        model = Categoria
        fields = '__all__'

# =========================================================
# 1. BLOQUE CAJA Y MOVIMIENTOS
# =========================================================

class MovimientoCajaSerializer(serializers.ModelSerializer):
    empresa_id = serializers.IntegerField(required=False, allow_null=False)
    
    class Meta:
        model = MovimientoCaja
        fields = '__all__'

# =========================================================
# 1. BLOQUE BÁSICO (Usuarios, Sucursales, Inventario)
# =========================================================

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

class CajaSerializer(serializers.ModelSerializer):
    empresa_id = serializers.IntegerField(required=False, allow_null=False)
    
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
        fields = ['id', 'proveedor', 'proveedor_nombre', 'sucursal', 'total', 'fecha', 'estado', 'items', 'empresa_id']
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

# =========================================================
# 3. BLOQUE PREMIUM (E-commerce, API Tokens)
# =========================================================

class ClienteFinalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClienteFinal
        fields = ['id', 'nombre', 'email', 'telefono', 'direccion', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'empresa_id': {'required': False}
        }

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
        extra_kwargs = {'empresa_id': {'required': False}}
    
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
        extra_kwargs = {'empresa_id': {'required': False}}

# --- API INTEGRACIONES ---
class ApiTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiToken
        fields = ['token', 'activo', 'expira', 'creado']
        read_only_fields = ['token', 'creado']
        extra_kwargs = {'empresa_id': {'required': False}}

class LogApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogApi
        fields = '__all__'