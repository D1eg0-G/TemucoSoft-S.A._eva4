from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Sucursal, Producto, Inventario, Venta, Caja

# 1. Configuración Avanzada para el Usuario Personalizado
class CustomUserAdmin(UserAdmin):
    model = Usuario
    # Campos que se ven en la lista (tabla)
    list_display = ['username', 'email', 'role', 'empresa_id', 'is_active', 'is_staff']
    
    # Filtros laterales
    list_filter = ['role', 'is_active', 'empresa_id']
    
    # Campos que se ven al EDITAR un usuario
    fieldsets = UserAdmin.fieldsets + (
        ('Información TemucoSoft', {'fields': ('role', 'rut', 'empresa_id')}),
    )
    
    # Campos que se ven al CREAR un usuario
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información TemucoSoft', {'fields': ('email', 'role', 'rut', 'empresa_id')}),
    )

# 2. Registrar Modelos
admin.site.register(Usuario, CustomUserAdmin)
admin.site.register(Sucursal)
admin.site.register(Producto)
admin.site.register(Inventario)
admin.site.register(Venta)
admin.site.register(Caja)