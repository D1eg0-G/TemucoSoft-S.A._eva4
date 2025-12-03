# UBICACIÓN: proyecto_master/empresas/models.py

from django.db import models
from django.utils import timezone
import uuid
from .utils import validar_rut, validar_precio_positivo, validar_fecha_no_futura, validar_telefono_chileno

# 1. PLANES (Lo que vendes)
class Plan(models.Model):
    TIPO_CHOICES = [
        ('basico', 'Plan Básico'),
        ('estandar', 'Plan Estándar'),
        ('premium', 'Plan Premium'),
    ]
    nombre = models.CharField(max_length=50, choices=TIPO_CHOICES, unique=True)
    precio_mensual = models.IntegerField(validators=[validar_precio_positivo])
    max_sucursales = models.IntegerField()
    max_usuarios = models.IntegerField()
    modulos_json = models.JSONField(default=dict)
    host_base_url = models.URLField(
        default="http://localhost:8001/api/basico",
        help_text="URL de la API para este plan"
    )

    def __str__(self):
        return self.nombre

# 2. EMPRESAS (Tus Clientes)
class Empresa(models.Model):
    nombre = models.CharField(max_length=200)
    rut = models.CharField(max_length=20, unique=True, validators=[validar_rut])
    direccion = models.CharField(max_length=255, blank=True, null=True)  # ✅ Opcional
    telefono = models.CharField(max_length=20, validators=[validar_telefono_chileno], blank=True, null=True)
    email = models.EmailField()  # ✅ CAMBIO: email → email_contacto
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    # Datos técnicos para conectar a su BD (Routing)
    db_host = models.CharField(max_length=100, help_text="Ej: ec2-basico o IP", blank=True, null=True)
    db_name = models.CharField(max_length=100, blank=True, null=True)
    db_user = models.CharField(max_length=100, blank=True, null=True)
    db_password = models.CharField(max_length=100, blank=True, null=True)
    
    # Token para identificar al cliente en las otras APIs
    tenant_token = models.UUIDField(default=uuid.uuid4, editable=False)

    def __str__(self):
        return self.nombre

# 3. SUSCRIPCIONES
class Suscripcion(models.Model):
    empresa = models.OneToOneField(Empresa, on_delete=models.CASCADE)
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)
    fecha_inicio = models.DateField(default=timezone.now)
    fecha_fin = models.DateField(null=True, blank=True)
    activo = models.BooleanField(default=True)
    
    # Instancia física asignada
    ec2_instance = models.CharField(max_length=50, help_text="Ej: ec2-basico", blank=True, null=True)

    def __str__(self):
        return f"{self.empresa.nombre} - {self.plan.nombre}"

# 4. FACTURACIÓN
class Facturacion(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    monto = models.IntegerField(validators=[validar_precio_positivo])
    fecha_pago = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, default='pagado')

    def __str__(self):
        return f"Factura {self.empresa.nombre} - ${self.monto}"