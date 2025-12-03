from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from .utils import validar_rut, validar_precio_positivo, validar_cantidad_item, validar_fecha_no_futura, validar_telefono_chileno

class Usuario(AbstractUser):
    # ... (Mismos campos que Básico)
    ROLES = (
        ('admin_cliente', 'Administrador Cliente'),
        ('vendedor', 'Vendedor'),
        ('gerente', 'Gerente'), # Rol extra posible en estándar
    )
    role = models.CharField(max_length=20, choices=ROLES, default='vendedor')
    empresa_id = models.IntegerField(null=True, blank=True, help_text="ID empresa master. Null si es Superuser")
    rut = models.CharField(max_length=20, blank=True, null=True, validators=[validar_rut])

class Sucursal(models.Model):
    nombre = models.CharField(max_length=100)
    direccion = models.CharField(max_length=200)
    telefono = models.CharField(max_length=20, validators=[validar_telefono_chileno])
    empresa_id = models.IntegerField()

class Producto(models.Model):
    sku = models.CharField(max_length=50)
    nombre = models.CharField(max_length=150)
    precio = models.IntegerField(validators=[validar_precio_positivo])
    costo = models.IntegerField(validators=[validar_precio_positivo])
    categoria = models.CharField(max_length=100)
    empresa_id = models.IntegerField()

class Inventario(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    sucursal = models.ForeignKey(Sucursal, on_delete=models.CASCADE)
    stock = models.IntegerField(default=0)
    punto_reorden = models.IntegerField(default=5)
    empresa_id = models.IntegerField()

class Venta(models.Model):
    sucursal = models.ForeignKey(Sucursal, on_delete=models.PROTECT)
    usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT)
    total = models.IntegerField(validators=[validar_precio_positivo]    )
    metodo_pago = models.CharField(max_length=20)
    fecha = models.DateTimeField(auto_now_add=True, validators=[validar_fecha_no_futura])
    empresa_id = models.IntegerField()

class VentaItem(models.Model):
    venta = models.ForeignKey(Venta, related_name='items', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.IntegerField(validators=[validar_cantidad_item])
    precio_unitario = models.IntegerField(validators=[validar_precio_positivo])

class Caja(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT)
    sucursal = models.ForeignKey(Sucursal, on_delete=models.PROTECT)
    monto_inicial = models.IntegerField(validators=[validar_precio_positivo])
    monto_final = models.IntegerField(null=True, validators=[validar_precio_positivo])
    fecha_apertura = models.DateTimeField(auto_now_add=True, validators=[validar_fecha_no_futura])
    fecha_cierre = models.DateTimeField(null=True, validators=[validar_fecha_no_futura])
    empresa_id = models.IntegerField()

# =========================================================
# MÓDULOS ADICIONALES (ESTÁNDAR)
# =========================================================

class Proveedor(models.Model):
    nombre = models.CharField(max_length=200)
    rut = models.CharField(max_length=20, validators=[validar_rut])
    contacto = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20, validators=[validar_telefono_chileno])
    email = models.EmailField()
    empresa_id = models.IntegerField()

    def __str__(self):
        return self.nombre

class Compra(models.Model):
    ESTADOS = (('pendiente', 'Pendiente'), ('recibido', 'Recibido'))
    
    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT)
    sucursal = models.ForeignKey(Sucursal, on_delete=models.PROTECT)
    total = models.IntegerField(validators=[validar_precio_positivo])
    fecha = models.DateTimeField(auto_now_add=True, validators=[validar_fecha_no_futura])
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    empresa_id = models.IntegerField()

class CompraItem(models.Model):
    compra = models.ForeignKey(Compra, related_name='items', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.IntegerField(validators=[validar_cantidad_item])
    costo_unitario = models.IntegerField(validators=[validar_precio_positivo])

class PedidoInterno(models.Model):
    """Pedidos internos entre sucursales o de reposición"""
    sucursal = models.ForeignKey(Sucursal, on_delete=models.PROTECT)
    usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT)
    total = models.IntegerField(validators=[validar_precio_positivo])
    estado = models.CharField(max_length=20, default='solicitado')
    fecha = models.DateTimeField(auto_now_add=True, validators=[validar_fecha_no_futura])
    empresa_id = models.IntegerField()

class MovimientoInventario(models.Model):
    TIPOS = (
        ('entrada', 'Entrada (Compra)'),
        ('salida', 'Salida (Venta)'),
        ('ajuste', 'Ajuste Manual'),
        ('merma', 'Merma/Pérdida'),
    )
    
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    sucursal = models.ForeignKey(Sucursal, on_delete=models.PROTECT)
    tipo = models.CharField(max_length=20, choices=TIPOS)
    cantidad = models.IntegerField(validators=[validar_cantidad_item]) # Puede ser negativo para salidas
    fecha = models.DateTimeField(auto_now_add=True, validators=[validar_fecha_no_futura])
    referencia = models.CharField(max_length=100, help_text="ID de Venta #100 o Compra #50")
    empresa_id = models.IntegerField()

# =========================================================
# MÓDULOS ADICIONALES (PREMIUM)
# =========================================================

class ClienteFinal(models.Model):
    """Clientes exclusivos del E-commerce"""
    nombre = models.CharField(max_length=200)
    email = models.EmailField()
    telefono = models.CharField(max_length=20, validators=[validar_telefono_chileno])
    direccion = models.TextField()
    password = models.CharField(max_length=128, blank=True)
    empresa_id = models.IntegerField()

class OrdenEcommerce(models.Model):
    ESTADOS = (('pendiente', 'Pendiente'), ('enviado', 'Enviado'), ('entregado', 'Entregado'))
    cliente = models.ForeignKey(ClienteFinal, on_delete=models.PROTECT)
    total = models.IntegerField(validators=[validar_precio_positivo])
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    fecha = models.DateTimeField(auto_now_add=True, validators=[validar_fecha_no_futura])
    direccion_envio = models.TextField()
    empresa_id = models.IntegerField()

class OrdenItem(models.Model):
    orden = models.ForeignKey(OrdenEcommerce, related_name='items', on_delete=models.CASCADE)
    producto_id = models.IntegerField() # O ForeignKey a Producto
    cantidad = models.IntegerField(validators=[validar_cantidad_item])
    precio_unitario = models.IntegerField(validators=[validar_precio_positivo])

class Carrito(models.Model):
    cliente = models.ForeignKey(ClienteFinal, null=True, on_delete=models.CASCADE)
    session_id = models.CharField(max_length=100, null=True)
    creado = models.DateTimeField(auto_now_add=True)
    empresa_id = models.IntegerField()

class CarritoItem(models.Model):
    carrito = models.ForeignKey(Carrito, related_name='items', on_delete=models.CASCADE)
    producto_id = models.IntegerField()
    cantidad = models.IntegerField(validators=[validar_cantidad_item])

class ApiToken(models.Model):
    usuario_id = models.IntegerField()
    token = models.UUIDField(default=uuid.uuid4)
    activo = models.BooleanField(default=True)
    expira = models.DateTimeField(null=True)
    empresa_id = models.IntegerField()

class LogApi(models.Model):
    usuario_id = models.IntegerField()
    endpoint = models.CharField(max_length=200)
    metodo = models.CharField(max_length=10)
    fecha = models.DateTimeField(auto_now_add=True)
    ip = models.GenericIPAddressField()
    empresa_id = models.IntegerField()