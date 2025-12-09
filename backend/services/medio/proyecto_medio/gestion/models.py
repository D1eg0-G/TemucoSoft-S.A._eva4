from django.db import models
from django.contrib.auth.models import AbstractUser
from .utils import validar_rut, validar_precio_positivo, validar_cantidad_item, validar_fecha_no_futura, validar_telefono_chileno
class Usuario(AbstractUser):
    # ... (Mismos campos que Básico)
    ROLES = (
        ('admin_cliente', 'Administrador Cliente'),
        ('vendedor', 'Vendedor'),
        ('gerente', 'Gerente'), # Rol extra en estándar
    )
    role = models.CharField(max_length=20, choices=ROLES, default='vendedor')
    empresa_id = models.IntegerField(null=True, blank=True, help_text="ID empresa master. Null si es Superuser") 
    rut = models.CharField(max_length=20, blank=True, validators=[validar_rut])

class Sucursal(models.Model):
    nombre = models.CharField(max_length=100)
    direccion = models.CharField(max_length=200)
    telefono = models.CharField(max_length=20, validators=[validar_telefono_chileno])
    empresa_id = models.IntegerField()

class Categoria(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    empresa_id = models.IntegerField()

    class Meta:
        unique_together = ('nombre', 'empresa_id')

    def __str__(self):
        return self.nombre

class Producto(models.Model):
    sku = models.CharField(max_length=50)
    nombre = models.CharField(max_length=150)
    precio = models.IntegerField(validators=[validar_precio_positivo])
    costo = models.IntegerField(validators=[validar_precio_positivo])
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
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
    total = models.IntegerField(validators=[validar_precio_positivo])
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

class MovimientoCaja(models.Model):
    TIPOS_MOVIMIENTO = (
        ('retiro', 'Retiro'),
        ('gasto', 'Gasto'),
        ('entrada', 'Entrada'),
    )
    
    caja = models.ForeignKey(Caja, on_delete=models.CASCADE, related_name='movimientos')
    tipo = models.CharField(max_length=20, choices=TIPOS_MOVIMIENTO)
    monto = models.IntegerField(validators=[validar_precio_positivo])
    concepto = models.CharField(max_length=200)
    fecha = models.DateTimeField(auto_now_add=True, validators=[validar_fecha_no_futura])
    empresa_id = models.IntegerField()

    def __str__(self):
        return f"{self.tipo} - ${self.monto} - {self.concepto}"

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