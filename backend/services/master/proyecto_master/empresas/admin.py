from django.contrib import admin
from .models import Plan, Empresa, Suscripcion, Facturacion

# Configuración personalizada para ver mejor los datos
class SuscripcionAdmin(admin.ModelAdmin):
    # Verificamos los nombres exactos de tu modelo Suscripcion
    # Si 'ec2_instance' es el nombre real en tu modelo, úsalo aquí.
    list_display = ('empresa', 'plan', 'fecha_inicio', 'fecha_fin', 'activo') 
    list_filter = ('plan', 'activo') # Usamos 'activo' en vez de 'estado' si ese es el campo booleano
    search_fields = ('empresa__nombre',)

class EmpresaAdmin(admin.ModelAdmin):
    # Ajustamos 'email_contacto' a 'email' si así se llama en tu modelo
    list_display = ('nombre', 'rut', 'email', 'activo', 'fecha_registro')
    search_fields = ('nombre', 'rut')

class PlanAdmin(admin.ModelAdmin):
    # Si 'host_base_url' no existe en el modelo Plan, lo quitamos de la lista
    # O lo agregamos si es un método calculado
    list_display = ('nombre', 'precio_mensual', 'max_sucursales', 'max_usuarios')

# Registrar modelos
admin.site.register(Plan, PlanAdmin)
admin.site.register(Empresa, EmpresaAdmin)
admin.site.register(Suscripcion, SuscripcionAdmin)
admin.site.register(Facturacion)