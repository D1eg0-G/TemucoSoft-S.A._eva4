from django.db import models
from django.contrib.auth.models import AbstractUser
# 1. IMPORTAMOS TUS VALIDADORES
from .utils import validar_rut, validar_precio_positivo, validar_cantidad_item, validar_fecha_no_futura, validar_telefono_chileno

# =========================================================
# USUARIOS
# =========================================================
class Usuario(AbstractUser):
    ROLES = (
        ('admin_cliente', 'Administrador Cliente'),
        ('vendedor', 'Vendedor'),
        ('gerente', 'Gerente'),  # Disponible en planes superiores
    )
    role = models.CharField(max_length=20, choices=ROLES, default='vendedor')
    
    # 2. APLICAMOS VALIDACIÓN DE RUT
    rut = models.CharField(max_length=20, blank=True, null=True, validators=[validar_rut])
    
    empresa_id = models.IntegerField(null=True, blank=True, help_text="ID empresa master. Null si es Superuser")
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"

# =========================================================
# CORE DEL NEGOCIO
# =========================================================

class Sucursal(models.Model):
    nombre = models.CharField(max_length=100)
    direccion = models.CharField(max_length=200)
    telefono = models.CharField(max_length=20, validators=[validar_telefono_chileno])
    empresa_id = models.IntegerField()

    def __str__(self):
        return self.nombre

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
    
    # 3. APLICAMOS VALIDACIÓN DE PRECIOS POSITIVOS
    precio = models.IntegerField(validators=[validar_precio_positivo])
    costo = models.IntegerField(validators=[validar_precio_positivo])
    
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    empresa_id = models.IntegerField()

    class Meta:
        unique_together = ('sku', 'empresa_id')

    def __str__(self):
        return self.nombre

class Inventario(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    sucursal = models.ForeignKey(Sucursal, on_delete=models.CASCADE)
    
    # 4. STOCK NO PUEDE SER NEGATIVO (Validación simple)
    stock = models.IntegerField(default=0, validators=[validar_precio_positivo])
    
    punto_reorden = models.IntegerField(default=5, validators=[validar_precio_positivo])
    empresa_id = models.IntegerField()

class Caja(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT)
    sucursal = models.ForeignKey(Sucursal, on_delete=models.PROTECT)
    monto_inicial = models.IntegerField(validators=[validar_precio_positivo])
    monto_final = models.IntegerField(null=True, blank=True, validators=[validar_precio_positivo])
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
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
    fecha = models.DateTimeField(auto_now_add=True)
    empresa_id = models.IntegerField()

    def __str__(self):
        return f"{self.tipo} - ${self.monto} - {self.concepto}"

# =========================================================
# VENTAS (POS)
# =========================================================

class Venta(models.Model):
    METODOS_PAGO = (
        ('efectivo', 'Efectivo'),
        ('tarjeta', 'Tarjeta Débito/Crédito'),
        ('transferencia', 'Transferencia'),
    )
    
    sucursal = models.ForeignKey(Sucursal, on_delete=models.PROTECT)
    usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT)
    total = models.IntegerField(validators=[validar_precio_positivo])
    metodo_pago = models.CharField(max_length=20, choices=METODOS_PAGO)
    
    # Nota: auto_now_add se salta validadores al crear, 
    # pero es buena práctica tener la referencia si lo editaras manualmente.
    fecha = models.DateTimeField(auto_now_add=True, validators=[validar_fecha_no_futura])
    
    empresa_id = models.IntegerField()

class VentaItem(models.Model):
    venta = models.ForeignKey(Venta, related_name='items', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    
    # 5. CANTIDAD DEBE SER AL MENOS 1
    cantidad = models.IntegerField(validators=[validar_cantidad_item])
    
    precio_unitario = models.IntegerField(validators=[validar_precio_positivo])